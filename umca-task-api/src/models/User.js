import bcrypt from 'bcryptjs';

// In-memory mock database for demo purposes
// In production, this would use PostgreSQL
let mockUsers = [];
let mockRefreshTokens = [];

export class User {
  static async create({ username, email, password }) {
    // Check for username conflict first (explicit priority)
    const existingUserByUsername = mockUsers.find(u => u.username === username);
    if (existingUserByUsername) {
      const error = new Error('Username already exists');
      error.code = 'DUPLICATE_KEY';
      throw error;
    }
    
    // Check for email conflict second
    const existingUserByEmail = mockUsers.find(u => u.email === email);
    if (existingUserByEmail) {
      const error = new Error('Email already exists');
      error.code = 'DUPLICATE_KEY';
      throw error;
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username,
      email,
      password_hash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockUsers.push(user);

    // Return user without password hash
    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async findByUsername(username) {
    const user = mockUsers.find(u => u.username === username);
    return user || null;
  }

  static async findById(id) {
    const user = mockUsers.find(u => u.id === id);
    if (user) {
      const { password_hash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  static async validatePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  static async createRefreshToken({ userId, tokenHash, expiresAt }) {
    const refreshToken = {
      id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      token_hash: tokenHash,
      user_id: userId,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    };

    mockRefreshTokens.push(refreshToken);
    return refreshToken;
  }

  static async findRefreshToken(tokenHash) {
    return mockRefreshTokens.find(t => t.token_hash === tokenHash) || null;
  }

  static async deleteRefreshToken(tokenHash) {
    const index = mockRefreshTokens.findIndex(t => t.token_hash === tokenHash);
    if (index !== -1) {
      mockRefreshTokens.splice(index, 1);
      return true;
    }
    return false;
  }

  // Test helper methods
  static clearMockData() {
    mockUsers = [];
    mockRefreshTokens = [];
  }

  static getMockUsers() {
    return mockUsers;
  }
}