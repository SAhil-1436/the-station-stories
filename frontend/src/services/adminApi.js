import api from './api.js';

/**
 * Admin Management API Service
 * Strictly implements the 17 verified endpoints from AdminController.java (/api/v1/admin/**)
 * All operations require valid JWT with ROLE_ADMIN authority.
 */

// ============================================================================
// 1. Staff Management (Provisioning Only)
// Note: Backend provides POST /users/staff only. No GET /users or deactivation.
// ============================================================================

/**
 * Provisions a new staff or cashier account
 * @param {Object} staffData - Staff details
 * @param {string} staffData.username - Required, 3-50 chars
 * @param {string} staffData.password - Required, min 8 chars
 * @param {string} staffData.fullName - Required
 * @param {string} [staffData.phone] - Optional contact number
 * @param {string} staffData.companyCardNumber - Required mandatory verification number
 * @param {string} [staffData.role='ROLE_CASHIER'] - 'ROLE_CASHIER' or 'ROLE_ADMIN'
 * @returns {Promise<Object>} UserDto of created staff account
 */
export const createStaff = async (staffData) => {
  const response = await api.post('/api/v1/admin/users/staff', staffData);
  return response.data;
};

// ============================================================================
// 2. Category Management
// ============================================================================

/**
 * Retrieves full category hierarchy (including inactive) with live item counts
 * @returns {Promise<Array<Object>>} List of CategoryResponse objects
 */
export const getCategories = async () => {
  const response = await api.get('/api/v1/admin/categories');
  return response.data;
};

/**
 * Adds a new menu category
 * @param {Object} categoryData
 * @param {string} categoryData.name - Required, max 100 chars
 * @param {string} [categoryData.hindiName] - Optional Hindi translation
 * @param {number} [categoryData.displayOrder=0] - Sorting sequence
 * @param {boolean} [categoryData.isActive=true] - Active flag
 * @param {string} [categoryData.iconName] - Lucide icon identifier
 * @returns {Promise<Object>} CategoryResponse
 */
export const createCategory = async (categoryData) => {
  const response = await api.post('/api/v1/admin/categories', categoryData);
  return response.data;
};

/**
 * Updates an existing menu category
 * @param {number|string} id - Category ID
 * @param {Object} categoryData - Updated category details
 * @returns {Promise<Object>} CategoryResponse
 */
export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/api/v1/admin/categories/${id}`, categoryData);
  return response.data;
};

/**
 * Safely deletes a menu category
 * Fails with HTTP 400 Bad Request if active dishes are currently assigned.
 * @param {number|string} id - Category ID
 * @returns {Promise<string>} Deletion confirmation message
 */
export const deleteCategory = async (id) => {
  const response = await api.delete(`/api/v1/admin/categories/${id}`);
  return response.data;
};

// ============================================================================
// 3. Menu Item Management
// ============================================================================

/**
 * Retrieves complete dish catalog including unavailable/86'd items
 * @returns {Promise<Array<Object>>} List of MenuItemResponse objects
 */
export const getMenuItems = async () => {
  const response = await api.get('/api/v1/admin/menu');
  return response.data;
};

/**
 * Registers a new dish item in the catalog
 * @param {Object} itemData - MenuItemRequest payload
 * @returns {Promise<Object>} MenuItemResponse
 */
export const createMenuItem = async (itemData) => {
  const response = await api.post('/api/v1/admin/menu', itemData);
  return response.data;
};

/**
 * Updates dish metadata. Past finalized bills remain permanently protected.
 * @param {number|string} id - Menu item ID
 * @param {Object} itemData - MenuItemRequest payload
 * @returns {Promise<Object>} MenuItemResponse
 */
export const updateMenuItem = async (id, itemData) => {
  const response = await api.put(`/api/v1/admin/menu/${id}`, itemData);
  return response.data;
};

/**
 * Updates catalog price and logs an audit log event
 * @param {number|string} id - Menu item ID
 * @param {number|string} price - New price (> 0.01)
 * @returns {Promise<Object>} MenuItemResponse
 */
export const updateMenuPrice = async (id, price) => {
  const response = await api.patch(`/api/v1/admin/menu/${id}/price`, { price: Number(price) });
  return response.data;
};

/**
 * Toggles dish availability (86 switch)
 * @param {number|string} id - Menu item ID
 * @returns {Promise<Object>} MenuItemResponse
 */
export const toggleMenuAvailability = async (id) => {
  const response = await api.patch(`/api/v1/admin/menu/${id}/toggle-availability`);
  return response.data;
};

/**
 * Uploads multipart dish photograph and updates imageUrl
 * @param {number|string} id - Menu item ID
 * @param {File|Blob} file - Image file binary
 * @param {boolean} [isOriginal=false] - Whether this is an authentic restaurant photograph
 * @returns {Promise<Object>} MenuItemResponse
 */
export const uploadMenuPhoto = async (id, file, isOriginal = false) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('isOriginal', String(isOriginal));

  const response = await api.post(`/api/v1/admin/menu/${id}/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ============================================================================
// 4. Bill Management & Authoritative Cancellation
// ============================================================================

/**
 * Search historical bills with pagination and multi-criteria filters
 * @param {Object} [params] - Query filter parameters
 * @param {string} [params.status] - PaymentStatus ('PAID', 'CANCELLED', 'PENDING')
 * @param {string} [params.method] - PaymentMethod ('CASH', 'UPI', 'CARD', 'OTHER')
 * @param {string} [params.fromDate] - ISO Date 'YYYY-MM-DD'
 * @param {string} [params.toDate] - ISO Date 'YYYY-MM-DD'
 * @param {number} [params.page=0] - 0-indexed page number
 * @param {number} [params.size=20] - Page size
 * @returns {Promise<{content: Array<Object>, totalElements: number, totalPages: number, number: number, size: number}>} Page of BillResponse
 */
export const getBills = async (params = {}) => {
  const cleanParams = {};
  if (params.status) cleanParams.status = params.status;
  if (params.method) cleanParams.method = params.method;
  if (params.fromDate) cleanParams.fromDate = params.fromDate;
  if (params.toDate) cleanParams.toDate = params.toDate;
  cleanParams.page = params.page ?? 0;
  cleanParams.size = params.size ?? 20;

  const response = await api.get('/api/v1/admin/bills', { params: cleanParams });
  return response.data;
};

/**
 * Authoritative non-destructive bill cancellation with refund recording
 * @param {number|string} id - Bill ID
 * @param {Object} cancellationData
 * @param {string} cancellationData.cancellationReason - Mandatory explanation
 * @param {number} [cancellationData.refundAmount=0.00] - Refund amount
 * @returns {Promise<Object>} BillResponse
 */
export const cancelBill = async (id, cancellationData) => {
  const response = await api.post(`/api/v1/admin/bills/${id}/cancel`, {
    cancellationReason: cancellationData.cancellationReason,
    refundAmount: cancellationData.refundAmount ?? 0,
  });
  return response.data;
};

// ============================================================================
// 5. Financial Analytics & Reports
// ============================================================================

/**
 * Retrieves today's sales dashboard metrics
 * Calculates today's gross sales, cash vs UPI breakdown, order counts, and top 5 bestsellers.
 * Note: Scoped strictly to today's operations per backend implementation.
 * @returns {Promise<{todayTotalSales: number, todayOrderCount: number, todayPaidBills: number, todayCancelledBills: number, todayCashSales: number, todayUpiSales: number, todayOtherSales: number, averageOrderValue: number, topSellingItems: Array<{itemName: string, quantitySold: number, totalRevenue: number}>}>} DashboardReportResponse
 */
export const getDashboardReport = async () => {
  const response = await api.get('/api/v1/admin/reports/dashboard');
  return response.data;
};

// ============================================================================
// 6. Settings & Dynamic GST Tax Configuration
// ============================================================================

/**
 * Retrieves active restaurant settings and GST policy from database
 * @returns {Promise<Object>} RestaurantSettingResponse
 */
export const getSettings = async () => {
  const response = await api.get('/api/v1/admin/settings');
  return response.data;
};

/**
 * Updates restaurant information, UPI VPA, contact details, and dynamic GST toggle
 * @param {Object} settingsData - RestaurantSettingRequest payload
 * @returns {Promise<Object>} RestaurantSettingResponse
 */
export const updateSettings = async (settingsData) => {
  const response = await api.put('/api/v1/admin/settings', settingsData);
  return response.data;
};

// ============================================================================
// 7. Regulatory Compliance Audit Trail
// Note: Backend supports pagination only (page, size). No server-side entity filtering.
// ============================================================================

/**
 * Retrieves paginated compliance audit trail events
 * @param {Object} [params]
 * @param {number} [params.page=0] - 0-indexed page number
 * @param {number} [params.size=50] - Page size
 * @returns {Promise<{content: Array<Object>, totalElements: number, totalPages: number, number: number, size: number}>} Page of AuditLogResponse
 */
export const getAuditLogs = async (params = {}) => {
  const cleanParams = {
    page: params.page ?? 0,
    size: params.size ?? 50,
  };
  const response = await api.get('/api/v1/admin/audit-logs', { params: cleanParams });
  return response.data;
};

export default {
  // Staff (1)
  createStaff,
  // Categories (4)
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  // Menu (6)
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  updateMenuPrice,
  toggleMenuAvailability,
  uploadMenuPhoto,
  // Bills (2)
  getBills,
  cancelBill,
  // Reports (1)
  getDashboardReport,
  // Settings (2)
  getSettings,
  updateSettings,
  // Audit Logs (1)
  getAuditLogs,
};
