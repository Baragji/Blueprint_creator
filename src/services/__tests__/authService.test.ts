/**
 * Authentication Service Tests
 * 
 * TDD Phase: RED - Writing failing tests first
 * 
 * These tests define the expected behavior of the authentication service
 * before implementation. Following TDD methodology, these tests should fail
 * initially and guide the implementation.
 */

import { authService } from '../authService'
import { LoginCredentials, RegisterCredentials, User, AuthResponse } from '../../types/auth'

// Mock fetch for API calls
global.fetch = jest.fn()

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      }
      
      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          organizationId: 'org1'
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      // Act
      const result = await authService.login(credentials)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })
    })

    it('should throw error for invalid credentials', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid credentials' })
      })

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials')
    })

    it('should validate email format', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        email: 'invalid-email',
        password: 'password123'
      }

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow('Invalid email format')
    })

    it('should validate password length', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: '123' // Too short
      }

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow('Password must be at least 6 characters')
    })
  })

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      const credentials: RegisterCredentials = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        organizationName: 'Test Org'
      }

      const mockResponse: AuthResponse = {
        user: {
          id: '2',
          email: 'newuser@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'owner',
          organizationId: 'org2'
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      // Act
      const result = await authService.register(credentials)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })
    })

    it('should throw error for existing email', async () => {
      // Arrange
      const credentials: RegisterCredentials = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        organizationName: 'Test Org'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ message: 'Email already exists' })
      })

      // Act & Assert
      await expect(authService.register(credentials)).rejects.toThrow('Email already exists')
    })

    it('should validate required fields', async () => {
      // Arrange
      const incompleteCredentials = {
        email: 'test@example.com',
        password: 'password123'
        // Missing firstName, lastName, organizationName
      } as RegisterCredentials

      // Act & Assert
      await expect(authService.register(incompleteCredentials)).rejects.toThrow('All fields are required')
    })
  })

  describe('logout', () => {
    it('should successfully logout user', async () => {
      // Arrange
      localStorage.setItem('auth_token', 'mock-token')
      localStorage.setItem('refresh_token', 'mock-refresh-token')

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      })

      // Act
      await authService.logout()

      // Assert
      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
      expect(fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock-token'
        }
      })
    })

    it('should clear local storage even if API call fails', async () => {
      // Arrange
      localStorage.setItem('auth_token', 'mock-token')
      localStorage.setItem('refresh_token', 'mock-refresh-token')

      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      // Act
      await authService.logout()

      // Assert
      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user when token is valid', async () => {
      // Arrange
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        organizationId: 'org1'
      }

      localStorage.setItem('auth_token', 'valid-token')

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser })
      })

      // Act
      const result = await authService.getCurrentUser()

      // Assert
      expect(result).toEqual(mockUser)
      expect(fetch).toHaveBeenCalledWith('/api/auth/me', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })
    })

    it('should return null when no token exists', async () => {
      // Arrange
      localStorage.removeItem('auth_token')

      // Act
      const result = await authService.getCurrentUser()

      // Assert
      expect(result).toBeNull()
      expect(fetch).not.toHaveBeenCalled()
    })

    it('should return null when token is invalid', async () => {
      // Arrange
      localStorage.setItem('auth_token', 'invalid-token')

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      // Act
      const result = await authService.getCurrentUser()

      // Assert
      expect(result).toBeNull()
      expect(localStorage.getItem('auth_token')).toBeNull() // Should clear invalid token
    })
  })

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      // Arrange
      localStorage.setItem('refresh_token', 'valid-refresh-token')

      const mockResponse = {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token'
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      // Act
      const result = await authService.refreshToken()

      // Assert
      expect(result).toEqual(mockResponse)
      expect(localStorage.getItem('auth_token')).toBe('new-access-token')
      expect(localStorage.getItem('refresh_token')).toBe('new-refresh-token')
    })

    it('should throw error when refresh token is invalid', async () => {
      // Arrange
      localStorage.setItem('refresh_token', 'invalid-refresh-token')

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      // Act & Assert
      await expect(authService.refreshToken()).rejects.toThrow('Refresh token expired')
      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when valid token exists', () => {
      // Arrange
      localStorage.setItem('auth_token', 'valid-token')

      // Act
      const result = authService.isAuthenticated()

      // Assert
      expect(result).toBe(true)
    })

    it('should return false when no token exists', () => {
      // Arrange
      localStorage.removeItem('auth_token')

      // Act
      const result = authService.isAuthenticated()

      // Assert
      expect(result).toBe(false)
    })
  })

  describe('getToken', () => {
    it('should return stored token', () => {
      // Arrange
      localStorage.setItem('auth_token', 'stored-token')

      // Act
      const result = authService.getToken()

      // Assert
      expect(result).toBe('stored-token')
    })

    it('should return null when no token stored', () => {
      // Arrange
      localStorage.removeItem('auth_token')

      // Act
      const result = authService.getToken()

      // Assert
      expect(result).toBeNull()
    })
  })
})