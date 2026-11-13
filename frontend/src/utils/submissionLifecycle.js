/**
 * Submission Lifecycle & Error Classification Engine (Phase 5.3)
 *
 * Implements strict financial integrity rules:
 * 1. Definitive states: IDLE, SUBMITTING, SUCCEEDED, DEFINITIVELY_FAILED, AMBIGUOUS_OUTCOME
 * 2. Conservative error classification (timeouts, resets, 5xx treated as ambiguous)
 * 3. Safe, minimal persistence of pending/ambiguous operation markers
 * 4. Rigorous cash tender calculation & validation
 */

export const SUBMISSION_LIFECYCLE = {
  IDLE: 'idle',
  SUBMITTING: 'submitting',
  SUCCEEDED: 'succeeded',
  DEFINITIVELY_FAILED: 'definitively_failed',
  AMBIGUOUS_OUTCOME: 'ambiguous_outcome',
};

export const AMBIGUOUS_STORAGE_KEY = 'tss_ambiguous_bill_marker';

/**
 * Classifies an error from POST /api/v1/pos/bills conservatively
 * @param {Object} err The error caught from posApi.createPosBill
 * @returns {'definitively_failed' | 'ambiguous_outcome'}
 */
export function classifyBillError(err) {
  if (!err) return SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME;

  const status = err.status || err.response?.status;
  const message = (err.message || '').toLowerCase();
  const code = (err.code || err.errorCode || '').toString().toLowerCase();

  // 1. Confirmed validation rejections from Spring Boot / Jackson / BeanValidation
  // (HTTP 400 Bad Request, 422 Unprocessable, 404 Not Found)
  // Backend rejected the request BEFORE persisting any database transaction.
  if (status === 400 || status === 422 || status === 404) {
    return SUBMISSION_LIFECYCLE.DEFINITIVELY_FAILED;
  }

  // 2. Authentication & Authorization errors (401 Unauthorized, 403 Forbidden)
  if (status === 401 || status === 403) {
    return SUBMISSION_LIFECYCLE.DEFINITIVELY_FAILED;
  }

  // 3. Network timeouts, aborts, resets, network errors
  if (
    code === 'econnaborted' ||
    code === 'err_network' ||
    message.includes('timeout') ||
    message.includes('network error') ||
    message.includes('connection reset') ||
    message.includes('failed to fetch') ||
    message.includes('networkerror')
  ) {
    return SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME;
  }

  // 4. Server errors (HTTP 500, 502, 503, 504)
  // An HTTP 500 response does NOT guarantee that the database transaction rolled back.
  // The transaction may have committed the bill, and failed in audit log or response serialization.
  if (status >= 500 && status <= 599) {
    return SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME;
  }

  // Default: Treat any uncategorized or ambiguous outcome conservatively
  return SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME;
}

/**
 * Saves a minimal, safe marker for an ambiguous bill submission.
 * Strictly excludes JWT tokens, credentials, and sensitive customer data.
 * @param {Object} details Minimal order snapshot
 */
export function saveAmbiguousMarker(details) {
  try {
    const marker = {
      clientReferenceId: details.clientReferenceId || `REF-${Date.now()}`,
      timestamp: Date.now(),
      orderType: details.orderType || 'DINE_IN',
      cabinTableRef: details.cabinTableRef || null,
      itemCount: details.itemCount || 0,
      estimatedTotal: Number(details.estimatedTotal || 0),
      paymentMethod: details.paymentMethod || 'CASH',
      reason: details.reason || 'Network or server interruption during bill finalization',
    };
    localStorage.setItem(AMBIGUOUS_STORAGE_KEY, JSON.stringify(marker));
    return marker;
  } catch (e) {
    console.warn('Unable to persist ambiguous marker to storage:', e);
    return null;
  }
}

/**
 * Reads the ambiguous marker if one exists
 * @returns {Object|null}
 */
export function getAmbiguousMarker() {
  try {
    const raw = localStorage.getItem(AMBIGUOUS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clears the ambiguous marker after authoritative reconciliation
 */
export function clearAmbiguousMarker() {
  try {
    localStorage.removeItem(AMBIGUOUS_STORAGE_KEY);
  } catch (e) {
    console.warn('Unable to remove ambiguous marker from storage:', e);
  }
}

/**
 * Validates cash tendered amount against payable total using integer paise arithmetic.
 * Requirements satisfied:
 * - If cash tendered is entered, it must be >= authoritative bill total.
 * - If cashier enters less than bill total, disables finalization.
 * - If field is empty, treated as exact cash received only after explicit cashier confirmation.
 * - Change calculated to exact paise without float rounding.
 *
 * @param {string} cashTenderedStr Cash tendered string input
 * @param {number} payableTotal Authoritative total payable
 * @returns {Object} Validation result { isExactCash, isValid, tenderedAmount, changeAmount, errorMessage }
 */
export function validateCashTender(cashTenderedStr, payableTotal) {
  const payablePaise = Math.round(Number(payableTotal || 0) * 100);
  const trimmed = (cashTenderedStr !== undefined && cashTenderedStr !== null)
    ? String(cashTenderedStr).trim()
    : '';

  // 1. Empty field: Treated as exact cash received (requires explicit confirmation)
  if (trimmed === '') {
    return {
      isExactCash: true,
      isValid: true,
      tenderedAmount: payableTotal,
      tenderedPaise: payablePaise,
      changeAmount: 0,
      errorMessage: null,
    };
  }

  const num = parseFloat(trimmed);
  // 2. Non-numeric or negative input
  if (isNaN(num) || num < 0) {
    return {
      isExactCash: false,
      isValid: false,
      tenderedAmount: 0,
      tenderedPaise: 0,
      changeAmount: 0,
      errorMessage: 'Please enter a valid positive cash amount.',
    };
  }

  const tenderedPaise = Math.round(num * 100);

  // 3. Insufficient cash tendered
  if (tenderedPaise < payablePaise) {
    const shortPaise = payablePaise - tenderedPaise;
    return {
      isExactCash: false,
      isValid: false,
      tenderedAmount: num,
      tenderedPaise,
      changeAmount: 0,
      errorMessage: `Insufficient cash: Tendered ₹${(tenderedPaise / 100).toFixed(2)} is less than bill total ₹${(payablePaise / 100).toFixed(2)} (Short by ₹${(shortPaise / 100).toFixed(2)}).`,
    };
  }

  // 4. Valid cash tendered >= total
  const changePaise = tenderedPaise - payablePaise;
  return {
    isExactCash: false,
    isValid: true,
    tenderedAmount: num,
    tenderedPaise,
    changeAmount: changePaise / 100,
    errorMessage: null,
  };
}

export default {
  SUBMISSION_LIFECYCLE,
  AMBIGUOUS_STORAGE_KEY,
  classifyBillError,
  saveAmbiguousMarker,
  getAmbiguousMarker,
  clearAmbiguousMarker,
  validateCashTender,
};
