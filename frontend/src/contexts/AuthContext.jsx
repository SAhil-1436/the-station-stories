import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../services/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('tss_token');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derived authorization flags
  const isAuthenticated = Boolean(token && user);
  const isAdmin = Boolean(
    user?.roles && Array.isArray(user.roles) && user.roles.includes('ROLE_ADMIN')
  );
  const isCashier = Boolean(
    user?.roles && Array.isArray(user.roles) && user.roles.includes('ROLE_CASHIER')
  );

  // Clear session helper
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem('tss_token');
    } catch {
      // Ignore storage errors in restricted contexts
    }
    setToken(null);
    setUser(null);
  }, []);

  // Restore authenticated session on initial mount
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const storedToken = (() => {
        try {
          return localStorage.getItem('tss_token');
        } catch {
          return null;
        }
      })();

      if (!storedToken) {
        if (isMounted) {
          clearSession();
          setLoading(false);
        }
        return;
      }

      try {
        const userData = await authApi.getCurrentUser();
        if (isMounted) {
          const isEligibleStaff = Boolean(
            userData &&
            userData.active === true &&
            Array.isArray(userData.roles) &&
            (userData.roles.includes('ROLE_ADMIN') || userData.roles.includes('ROLE_CASHIER'))
          );

          if (isEligibleStaff) {
            setUser(userData);
            setToken(storedToken);
          } else {
            clearSession();
          }
        }
      } catch (err) {
        // Token is invalid, expired, or network failure on session verify
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    // Listen for 401 token invalidation dispatched by api.js
    const handleAuthExpired = () => {
      if (isMounted) {
        clearSession();
        setError('Your session has expired. Please sign in again.');
      }
    };

    window.addEventListener('tss:auth:expired', handleAuthExpired);

    return () => {
      isMounted = false;
      window.removeEventListener('tss:auth:expired', handleAuthExpired);
    };
  }, [clearSession]);

  /**
   * Secure administrator login
   * Strictly enforces ROLE_ADMIN. Rejects ROLE_CASHIER accounts from admin portal.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{success: boolean, user?: Object, message?: string}>}
   */
  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const loginResponse = await authApi.login(username, password);
      const receivedToken = loginResponse.token;
      const receivedUser = loginResponse.user;

      // Verify user has authorized staff role (ROLE_ADMIN or ROLE_CASHIER)
      const hasStaffRole = Boolean(
        receivedUser?.active !== false &&
        receivedUser?.roles &&
        Array.isArray(receivedUser.roles) &&
        (receivedUser.roles.includes('ROLE_ADMIN') || receivedUser.roles.includes('ROLE_CASHIER'))
      );

      if (!hasStaffRole) {
        clearSession();
        setLoading(false);
        const deniedMsg = 'Access denied: Your account does not possess authorized staff credentials.';
        setError(deniedMsg);
        return { success: false, message: deniedMsg };
      }

      // Store verified admin JWT token
      try {
        localStorage.setItem('tss_token', receivedToken);
      } catch (storageErr) {
        // Private browsing warning
      }

      setToken(receivedToken);
      setUser(receivedUser);
      setLoading(false);

      return { success: true, user: receivedUser };
    } catch (err) {
      setLoading(false);
      const message = err.message || 'Authentication failed. Please check credentials.';
      setError(message);
      return {
        success: false,
        message,
        status: err.status,
        errors: err.errors,
      };
    }
  };

  /**
   * Terminates active session and clears stored token
   */
  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } catch (err) {
      // Disregard network errors on logout
    } finally {
      clearSession();
      setError(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isCashier,
    login,
    logout,
    clearSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
