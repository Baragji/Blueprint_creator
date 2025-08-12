/**
 * Authentication Service
 * 
 * TDD Phase: GREEN - Implementing the service to make tests pass
 * 
 * This service handles all authentication-related operations including
 * login, registration, logout, token management, and user validation.
 */

import { 
  LoginCredentials, 
  RegisterCredentials, 
  User, 
  AuthResponse, 
  TokenRefreshResponse,
  ValidationRules 
} from '../types/auth'

class AuthService {
  private readonly API_BASE_URL = '/api/auth'
  private readonly TOKEN_KEY = 'auth_token'
  private readonly REFRESH_TOKEN_KEY = 'refresh_token'

  /**
   * Validates email format
   */
  private validateEmail(email: string): void {
    if (!ValidationRules.email.pattern.test(email)) {
      throw new Error(ValidationRules.email.message)
    }
  }

  /**
   * Validates password length
   */
  private validatePassword(password: string): void {
    if (password.length < ValidationRules.password.minLength) {
      throw new Error(ValidationRules.password.message)
    }
  }

  /**
   * Validates required fields for registration
   */
  private validateRegistrationFields(credentials: RegisterCredentials): void {
    const requiredFields = ['email', 'password', 'firstName', 'lastName', 'organizationName']
    const missingFields = requiredFields.filter(field => !credentials[field as keyof RegisterCredentials])
    
    if (missingFields.length > 0) {
      throw new Error('All fields are required')
    }
  }

  /**
   * Makes an authenticated API request
   */
  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken()
    
    // Normalize headers to a plain object so tests can assert header contents
    const normalizeHeaders = (h?: HeadersInit): Record<string, string> => {
      if (!h) return {}
      if (h instanceof Headers) {
        const obj: Record<string, string> = {}
        h.forEach((value, key) => { obj[key] = value })
        return obj
      }
      if (Array.isArray(h)) {
        return h.reduce((acc, [k, v]) => { acc[k] = v; return acc }, {} as Record<string, string>)
      }
      return { ...(h as Record<string, string>) }
    }

    const headers: Record<string, string> = normalizeHeaders(options.headers)

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Only add Content-Type if there's a body
    if (options.body) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json'
    }

    return fetch(url, {
      ...options,
      headers
    })
  }

  /**
   * Handles API response and throws errors for non-ok responses
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An error occurred' }))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }
    
    return response.json()
  }

  /**
   * Stores authentication tokens in localStorage
   */
  private storeTokens(token: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, token)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
  }

  /**
   * Clears authentication tokens from localStorage
   */
  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  /**
   * Authenticates user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Validate input
    this.validateEmail(credentials.email)
    this.validatePassword(credentials.password)

    // Make API request
    const response = await fetch(`${this.API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    const authResponse = await this.handleResponse<AuthResponse>(response)
    
    // Store tokens
    this.storeTokens(authResponse.token, authResponse.refreshToken)
    
    return authResponse
  }

  /**
   * Registers a new user and organization
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    // Validate input
    this.validateRegistrationFields(credentials)
    this.validateEmail(credentials.email)
    this.validatePassword(credentials.password)

    // Make API request
    const response = await fetch(`${this.API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    const authResponse = await this.handleResponse<AuthResponse>(response)
    
    // Store tokens
    this.storeTokens(authResponse.token, authResponse.refreshToken)
    
    return authResponse
  }

  /**
   * Logs out the current user
   */
  async logout(): Promise<void> {
    try {
      // Attempt to notify server of logout
      await this.makeAuthenticatedRequest(`${this.API_BASE_URL}/logout`, {
        method: 'POST'
      })
    } catch (error) {
      // Continue with logout even if server request fails
      console.warn('Logout request failed:', error)
    } finally {
      // Always clear local tokens
      this.clearTokens()
    }
  }

  /**
   * Gets the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken()
    
    if (!token) {
      return null
    }

    try {
      const response = await this.makeAuthenticatedRequest(`${this.API_BASE_URL}/me`)
      
      if (!response.ok) {
        // Token is invalid, clear it
        this.clearTokens()
        return null
      }
      
      const data = await response.json()
      return data.user
    } catch (error) {
      // Token is invalid or network error
      this.clearTokens()
      return null
    }
  }

  /**
   * Refreshes the authentication token
   */
  async refreshToken(): Promise<TokenRefreshResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY)
    
    if (!refreshToken) {
      this.clearTokens()
      throw new Error('Refresh token expired')
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      })

      if (!response.ok) {
        // Refresh token is invalid
        this.clearTokens()
        throw new Error('Refresh token expired')
      }

      const tokenResponse = await this.handleResponse<TokenRefreshResponse>(response)
      
      // Store new tokens
      this.storeTokens(tokenResponse.token, tokenResponse.refreshToken)
      
      return tokenResponse
    } catch (error) {
      // Clear tokens on any error
      this.clearTokens()
      throw error
    }
  }

  /**
   * Checks if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  /**
   * Gets the current authentication token
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY)
    } catch (error) {
      return null
    }
  }

  /**
   * Gets the current refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  /**
   * Validates if a token is expired (basic check)
   */
  isTokenExpired(token?: string): boolean {
    const authToken = token || this.getToken()
    
    if (!authToken) {
      return true
    }

    try {
      // Basic JWT expiration check
      const payload = JSON.parse(atob(authToken.split('.')[1]))
      const currentTime = Date.now() / 1000
      
      return payload.exp < currentTime
    } catch (error) {
      // If we can't parse the token, consider it expired
      return true
    }
  }

  /**
   * Automatically refreshes token if needed
   */
  async ensureValidToken(): Promise<string | null> {
    const token = this.getToken()
    
    if (!token) {
      return null
    }

    if (this.isTokenExpired(token)) {
      try {
        const refreshResponse = await this.refreshToken()
        return refreshResponse.token
      } catch (error) {
        // Refresh failed, user needs to login again
        return null
      }
    }

    return token
  }
}

// Export singleton instance
export const authService = new AuthService()
export default authService