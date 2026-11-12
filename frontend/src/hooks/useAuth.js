import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Custom hook to access authentication state and operations
 * @returns {{
 *   user: Object|null,
 *   token: string|null,
 *   loading: boolean,
 *   error: string|null,
 *   isAuthenticated: boolean,
 *   isAdmin: boolean,
 *   isCashier: boolean,
 *   login: (username: string, password: string) => Promise<Object>,
 *   logout: () => Promise<void>,
 *   clearSession: () => void
 * }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
