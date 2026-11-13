import assert from 'node:assert';
import {
  SUBMISSION_LIFECYCLE,
  classifyBillError,
  validateCashTender,
  generateIdempotencyKey,
  saveAmbiguousMarker,
  getAmbiguousMarker,
  clearAmbiguousMarker,
} from './src/utils/submissionLifecycle.js';
import fs from 'node:fs';

console.log('====================================================');
console.log('🧪 RUNNING PHASE 5.3 FINAL CORRECTION AUDIT SUITE');
console.log('====================================================\n');

// -----------------------------------------------------------------------------
// 1. CASH TENDER BOUNDARY TESTS
// -----------------------------------------------------------------------------
console.log('--- 1. Cash Tender Boundary Tests ---');

// Test 1.1: Empty tender = exact cash
{
  const res = validateCashTender('', 100);
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.isExactCash, true);
  assert.strictEqual(res.tenderedAmount, 100);
  assert.strictEqual(res.changeAmount, 0);
  console.log('  ✔ 1.1 Empty tender defaults to exact cash');
}

// Test 1.2: Exact tender
{
  const res = validateCashTender('100.00', 100);
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.isExactCash, false);
  assert.strictEqual(res.changeAmount, 0);
  console.log('  ✔ 1.2 Exact tender ₹100.00 gives ₹0 change');
}

// Test 1.3: ₹75.25 bill with ₹100.50 tender (paise math)
{
  const res = validateCashTender('100.50', 75.25);
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.tenderedPaise, 10050);
  assert.strictEqual(res.changeAmount, 25.25);
  console.log('  ✔ 1.3 ₹75.25 bill with ₹100.50 tender gives exact ₹25.25 change');
}

// Test 1.4: Under-tender (₹75.25 bill with ₹75.20 tender)
{
  const res = validateCashTender('75.20', 75.25);
  assert.strictEqual(res.isValid, false);
  assert.ok(res.errorMessage.includes('Short by ₹0.05'));
  console.log('  ✔ 1.4 ₹75.25 bill with ₹75.20 tender is rejected (Short by ₹0.05)');
}

// Test 1.5: Zero bill with zero tender
{
  const res = validateCashTender('0', 0);
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.changeAmount, 0);
  console.log('  ✔ 1.5 ₹0 bill with ₹0 tender');
}

// Test 1.6: Boundary ₹0.01 bill with ₹0.01 tender
{
  const res = validateCashTender('0.01', 0.01);
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.changeAmount, 0);
  console.log('  ✔ 1.6 ₹0.01 bill with ₹0.01 tender');
}

// Test 1.7: Negative tender rejected
{
  const res = validateCashTender('-50', 100);
  assert.strictEqual(res.isValid, false);
  console.log('  ✔ 1.7 Negative tender rejected');
}

// Test 1.8: Non-numeric tender rejected
{
  const res = validateCashTender('abc', 100);
  assert.strictEqual(res.isValid, false);
  console.log('  ✔ 1.8 Alphabetical tender rejected');
}

// Test 1.9: Trailing garbage rejected (e.g. "100abc")
{
  const res = validateCashTender('100abc', 100);
  assert.strictEqual(res.isValid, false);
  console.log('  ✔ 1.9 Trailing garbage rejected');
}

// Test 1.10: More than 2 decimal places rejected (e.g. "100.555")
{
  const res = validateCashTender('100.555', 100);
  assert.strictEqual(res.isValid, false);
  console.log('  ✔ 1.10 Excess decimals (>2) rejected');
}

// -----------------------------------------------------------------------------
// 2. CONSERVATIVE ERROR CLASSIFICATION TESTS
// -----------------------------------------------------------------------------
console.log('\n--- 2. Conservative Error Classification Tests ---');

// Test 2.1: 400 Bad Request -> DEFINITIVELY_FAILED
{
  const state = classifyBillError({ status: 400, message: 'Invalid bill item' });
  assert.strictEqual(state, SUBMISSION_LIFECYCLE.DEFINITIVELY_FAILED);
  console.log('  ✔ 2.1 HTTP 400 -> DEFINITIVELY_FAILED');
}

// Test 2.2: 401 Unauthorized -> DEFINITIVELY_FAILED
{
  const state = classifyBillError({ status: 401, message: 'Token expired' });
  assert.strictEqual(state, SUBMISSION_LIFECYCLE.DEFINITIVELY_FAILED);
  console.log('  ✔ 2.2 HTTP 401 -> DEFINITIVELY_FAILED');
}

// Test 2.3: 403 Forbidden -> DEFINITIVELY_FAILED
{
  const state = classifyBillError({ status: 403, message: 'Access denied' });
  assert.strictEqual(state, SUBMISSION_LIFECYCLE.DEFINITIVELY_FAILED);
  console.log('  ✔ 2.3 HTTP 403 -> DEFINITIVELY_FAILED');
}

// Test 2.4: 500 Internal Server Error -> AMBIGUOUS_OUTCOME
{
  const state = classifyBillError({ status: 500, message: 'Internal Server Error' });
  assert.strictEqual(state, SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME);
  console.log('  ✔ 2.4 HTTP 500 -> AMBIGUOUS_OUTCOME');
}

// Test 2.5: 504 Gateway Timeout -> AMBIGUOUS_OUTCOME
{
  const state = classifyBillError({ status: 504, message: 'Gateway Timeout' });
  assert.strictEqual(state, SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME);
  console.log('  ✔ 2.5 HTTP 504 -> AMBIGUOUS_OUTCOME');
}

// Test 2.6: ECONNABORTED Axios timeout -> AMBIGUOUS_OUTCOME
{
  const state = classifyBillError({ code: 'ECONNABORTED', message: 'timeout of 10000ms exceeded' });
  assert.strictEqual(state, SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME);
  console.log('  ✔ 2.6 Axios ECONNABORTED -> AMBIGUOUS_OUTCOME');
}

// Test 2.7: Network Error -> AMBIGUOUS_OUTCOME
{
  const state = classifyBillError({ message: 'Network Error' });
  assert.strictEqual(state, SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME);
  console.log('  ✔ 2.7 Network Error -> AMBIGUOUS_OUTCOME');
}

// -----------------------------------------------------------------------------
// 3. IDEMPOTENCY KEY GENERATION & STORAGE TESTS
// -----------------------------------------------------------------------------
console.log('\n--- 3. Idempotency Key Generation & Storage Tests ---');

// Mock localStorage for Node.js test environment
const storageMock = {};
global.localStorage = {
  getItem: (k) => storageMock[k] || null,
  setItem: (k, v) => { storageMock[k] = String(v); },
  removeItem: (k) => { delete storageMock[k]; },
};

// Test 3.1: Key format
{
  const key = generateIdempotencyKey();
  assert.ok(/^IDEMP-\d+-[a-z0-9]+$/.test(key), `Key ${key} does not match expected format`);
  console.log(`  ✔ 3.1 Key generated matches format: ${key}`);
}

// Test 3.2: Ambiguous marker preservation
{
  const key = generateIdempotencyKey();
  saveAmbiguousMarker({
    idempotencyKey: key,
    orderType: 'DINE_IN',
    cabinTableRef: 'T-10',
    itemCount: 3,
    estimatedTotal: 340.50,
  });

  const retrieved = getAmbiguousMarker();
  assert.strictEqual(retrieved.idempotencyKey, key);
  assert.strictEqual(retrieved.estimatedTotal, 340.50);
  assert.strictEqual(retrieved.cabinTableRef, 'T-10');

  clearAmbiguousMarker();
  assert.strictEqual(getAmbiguousMarker(), null);
  console.log('  ✔ 3.2 Marker saves original idempotencyKey and clears upon resolution');
}

// -----------------------------------------------------------------------------
// 4. RECEIPT GENERATOR INTEGRITY & ENGLISH-ONLY AUDIT
// -----------------------------------------------------------------------------
console.log('\n--- 4. Receipt Generator Integrity & English-Only Audit ---');

const receiptCode = fs.readFileSync('./src/utils/receiptPdfGenerator.js', 'utf8');

// Test 4.1: No Devanagari font references
assert.ok(!receiptCode.includes('Noto Sans Devanagari'), 'Devanagari font must be removed');
console.log('  ✔ 4.1 No Devanagari font references');

// Test 4.2: English monospace font family used
assert.ok(receiptCode.includes("'Courier New', Courier, monospace, Arial, sans-serif"), 'Monospace font must be used');
console.log('  ✔ 4.2 Clean English monospace font configured');

// Test 4.3: No Tax-Exempt claim in receiptPdfGenerator
assert.ok(!receiptCode.includes('Tax-Exempt'), 'Tax-Exempt string must not appear in receipt generator');
console.log('  ✔ 4.3 No "Tax-Exempt" claim in receipt generator');

// Test 4.4: 58mm roll width check
assert.ok(receiptCode.includes('pdfWidthMm = 58'), 'PDF width must be 58mm');
console.log('  ✔ 4.4 58mm thermal roll width strictly set');

// Test 4.5: Check PosReceiptPreviewModal has no printer queue or tax-exempt claim
const modalCode = fs.readFileSync('./src/components/pos/PosReceiptPreviewModal.jsx', 'utf8');
assert.ok(!modalCode.includes('Sent to printer queue'), 'Misleading printer queue claim must be removed');
assert.ok(!modalCode.includes('Tax-Exempt'), 'Tax-Exempt claim must be removed from receipt preview modal');
console.log('  ✔ 4.5 PosReceiptPreviewModal has no misleading printer claims or Tax-Exempt labels');

console.log('\n====================================================');
console.log('🎉 ALL AUDIT TESTS PASSED SUCCESSFULLY (18/18)');
console.log('====================================================');
