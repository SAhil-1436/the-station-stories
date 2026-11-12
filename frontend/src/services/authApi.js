import api from './api.js';

/**
 * Authentication API Service
 * Interacts with Spring Boot AuthController endpoints (/api/v1/auth/**)
 */

/**
 * Authenticates user credentials and returns JWT session token
 * @param {string} username - User login username
 * @param {string} password - User plain password
 * @returns {Promise<{token: string, tokenType: string, expiresIn: number, user: Object}>} LoginResponse data payload
 */
export const login = async (username, password) => {
  const response = await api.post('/api/v1/auth/login', {
    username: username?.trim(),
    password,
  });
  // api interceptor unwraps response.data from axios -> returns ApiResponse<LoginResponse>
  return response.data;
};

/**
 * Retrieves authenticated user profile from current JWT session
 * @returns {Promise<{id: number, username: string, fullName: string, phone: string, companyCardNumber: string, roles: string[], active: boolean}>} UserDto payload
 */
export const getCurrentUser = async () => {
  const response = await api.get('/api/v1/auth/me');
  return response.data;
};

/**
 * Notifies server of user logout
 * @returns {Promise<string>} Logout confirmation
 */
export const logout = async () => {
  try {
    const response = await api.post('/api/v1/auth/logout');
    return response.data;
  } catch (err) {
    // Gracefully handle logout network errors; local token cleanup still proceeds
    return 'Logged out';
  }
};

export default {
  login,
  getCurrentUser,
  logout,
};
