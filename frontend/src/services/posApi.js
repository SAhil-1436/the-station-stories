import api from './api';

/**
 * POS Terminal API Service
 * Handles live catalog loading, customer lookup, bill finalization, and thermal receipt generation.
 * In Phase 5.2, authoritative bill creation is posted to /api/v1/pos/bills with exact CreateBillRequest contracts.
 */

/**
 * Retrieves all active categories from authoritative public endpoint
 * @returns {Promise<Array<Object>>} List of CategoryResponse objects
 */
export const getPosCategories = async () => {
  const response = await api.get('/api/v1/public/categories');
  return response.data || [];
};

/**
 * Retrieves all available menu items for the POS counter
 * @param {Object} [params] Optional query params (categoryId, search, isVeg)
 * @returns {Promise<Array<Object>>} List of MenuItemResponse objects
 */
export const getPosMenuItems = async (params = {}) => {
  const response = await api.get('/api/v1/public/menu', { params });
  return response.data || [];
};

/**
 * Customer lookup by 10-digit mobile number
 * @param {string} phone 10-digit mobile number
 * @returns {Promise<Object>} Customer profile
 */
export const lookupCustomer = async (phone) => {
  const response = await api.get('/api/v1/pos/customers/lookup', {
    params: { phone },
  });
  return response.data;
};

/**
 * Creates and authoritatively finalizes a POS bill with idempotency protection
 * @param {Object} billData CreateBillRequest payload
 * @param {string} [idempotencyKey] Unique client-generated idempotency key
 * @returns {Promise<Object>} BillResponse object
 */
export const createPosBill = async (billData, idempotencyKey) => {
  const headers = {};
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
    billData = { ...billData, idempotencyKey };
  }
  const response = await api.post('/api/v1/pos/bills', billData, { headers });
  return response.data;
};

/**
 * Reconciles status of a bill-creation operation by idempotency key
 * @param {string} operationKey Unique operation/idempotency key
 * @returns {Promise<{operationKey: string, status: string, message: string, bill: Object|null, createdAt: string}>} BillOperationResponse
 */
export const getBillOperationStatus = async (operationKey) => {
  const response = await api.get(`/api/v1/pos/bills/operations/${encodeURIComponent(operationKey)}`);
  return response.data;
};

/**
 * Retrieves full bill details by ID
 * @param {number|string} billId Bill ID
 * @returns {Promise<Object>} BillResponse object
 */
export const getPosBillById = async (billId) => {
  const response = await api.get(`/api/v1/pos/bills/${billId}`);
  return response.data;
};

/**
 * Retrieves formatted ESC/POS thermal receipt data
 * @param {number|string} billId Bill ID
 * @param {string} [width='80mm'] Printer width ('80mm' or '58mm')
 * @returns {Promise<Object>} ThermalReceiptResponse object
 */
export const getThermalReceipt = async (billId, width = '80mm') => {
  const response = await api.get(`/api/v1/pos/bills/${billId}/receipt`, {
    params: { width },
  });
  return response.data;
};

/**
 * Registers this browser terminal as a trusted POS device
 * @param {Object} data DeviceRegistrationRequest
 * @returns {Promise<Object>} DeviceRegistrationResponse
 */
export const registerPosDevice = async (data) => {
  const response = await api.post('/api/v1/pos/devices/register', data);
  return response.data;
};

/**
 * Checks enrollment and active status of this device
 * @param {string} deviceId
 * @returns {Promise<Object>} Device status
 */
export const getPosDeviceStatus = async (deviceId) => {
  const response = await api.get(`/api/v1/pos/devices/status/${encodeURIComponent(deviceId)}`);
  return response.data;
};

/**
 * Revokes a POS device
 * @param {string} deviceId
 * @returns {Promise<Object>}
 */
export const revokePosDevice = async (deviceId) => {
  const response = await api.post(`/api/v1/pos/devices/${encodeURIComponent(deviceId)}/revoke`);
  return response.data;
};

/**
 * Requests an asymmetrically signed 24-hour offline lease
 * @param {Object} data OfflineLeaseRequest
 * @returns {Promise<Object>} OfflineLeaseResponse
 */
export const requestOfflineLease = async (data) => {
  const response = await api.post('/api/v1/pos/auth/offline-lease', data);
  return response.data;
};

/**
 * Fetches the backend RSA-2048 public verification key
 * @returns {Promise<{algorithm: string, format: string, publicKey: string}>}
 */
export const getPosPublicKey = async () => {
  const response = await api.get('/api/v1/pos/auth/public-key');
  return response.data;
};

/**
 * Synchronizes an offline-created bill to the backend
 * @param {Object} syncRequest SyncBillRequest
 * @returns {Promise<Object>} SyncBillResponse
 */
export const syncOfflineBill = async (syncRequest) => {
  const response = await api.post('/api/v1/pos/sync/bills', syncRequest);
  return response.data;
};

/**
 * Batch-synchronizes multiple offline-created bills
 * @param {Array<Object>} batchRequests Array of SyncBillRequest
 * @returns {Promise<Array<Object>>} List of SyncBillResponse
 */
export const syncBatchOfflineBills = async (batchRequests) => {
  const response = await api.post('/api/v1/pos/sync/bills/batch', batchRequests);
  return response.data;
};

export default {
  getPosCategories,
  getPosMenuItems,
  lookupCustomer,
  createPosBill,
  getBillOperationStatus,
  getPosBillById,
  getThermalReceipt,
  registerPosDevice,
  getPosDeviceStatus,
  revokePosDevice,
  requestOfflineLease,
  getPosPublicKey,
  syncOfflineBill,
  syncBatchOfflineBills,
};

