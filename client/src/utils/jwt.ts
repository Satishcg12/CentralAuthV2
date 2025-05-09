// JWT decoder utility to extract user information from access tokens

/**
 * User information extracted from JWT token
 */
export interface DecodedUser {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles?: string[];
  permissions?: string[];
  exp: number;
  iat: number;
}

/**
 * Decodes a JWT token without verification
 * This is safe for client-side use to extract user information
 * 
 * @param token JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function decodeJwt(token: string): DecodedUser | null {
  try {
    if (!token) return null;
    
    // Split the token into parts
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (middle part)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
}

/**
 * Checks if a token is expired
 * 
 * @param decodedToken The decoded token containing expiration time
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(decodedToken: DecodedUser | null): boolean {
  if (!decodedToken?.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Math.floor(Date.now() / 1000);
  return decodedToken.exp < currentTime;
}

/**
 * Gets the full name of the user from the decoded token
 * 
 * @param decodedToken The decoded user token
 * @returns The full name or username if no name is available
 */
export function getUserFullName(decodedToken: DecodedUser | null): string {
  if (!decodedToken) return '';
  
  if (decodedToken.first_name || decodedToken.last_name) {
    return `${decodedToken.first_name} ${decodedToken.last_name}`.trim();
  }
  
  return decodedToken.username;
}

/**
 * Checks if user has a specific role
 * 
 * @param decodedToken The decoded user token
 * @param role The role to check
 * @returns true if user has the role, false otherwise
 */
export function hasRole(decodedToken: DecodedUser | null, role: string): boolean {
  if (!decodedToken?.roles) return false;
  return decodedToken.roles.includes(role);
}

/**
 * Checks if user has a specific permission
 * 
 * @param decodedToken The decoded user token
 * @param permission The permission to check
 * @returns true if user has the permission, false otherwise
 */
export function hasPermission(decodedToken: DecodedUser | null, permission: string): boolean {
  if (!decodedToken?.permissions) return false;
  
  // Special case: 'all' permission grants access to everything
  if (decodedToken.permissions.includes('all')) return true;
  
  return decodedToken.permissions.includes(permission);
}