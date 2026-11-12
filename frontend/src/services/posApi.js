import api from './api';

/**
 * POS Terminal API Service
 * Handles live catalog loading, customer lookup, and thermal receipt generation.
 * In Phase 5.1, live menu items and categories are loaded directly from authoritative
 * public endpoints without mock fallback pollution, allowing visible error and retry handling.
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

export default {
  getPosCategories,
  getPosMenuItems,
  lookupCustomer,
  getThermalReceipt,
};
