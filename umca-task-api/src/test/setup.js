import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env' });

// Override NODE_ENV for tests
process.env.NODE_ENV = 'test';

// Test database configuration
process.env.DB_NAME = 'task_management_test';

// Mock external dependencies if needed
global.beforeEach = () => {
  // Clear any mocks or reset state before each test
};

global.afterEach = () => {
  // Clean up after each test
};