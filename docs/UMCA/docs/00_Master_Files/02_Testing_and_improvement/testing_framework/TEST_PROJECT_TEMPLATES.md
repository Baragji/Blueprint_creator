# 🛠️ Test Project Templates for UMCA Validation

These are the exact files you'll need in your `umca-testing/test-project/` directory to validate all UMCA components.

---

## 📦 **package.json**
```json
{
  "name": "umca-test-project",
  "version": "1.0.0",
  "description": "Test project for UMCA system validation",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint src test",
    "lint:fix": "eslint src test --fix",
    "type-check": "echo 'Type check placeholder - add TypeScript if needed'"
  },
  "keywords": ["umca", "testing"],
  "author": "UMCA Testing",
  "license": "MIT",
  "devDependencies": {
    "jest": "^29.0.0",
    "eslint": "^8.0.0",
    "@eslint/js": "^8.0.0"
  },
  "dependencies": {
    "lodash": "^4.17.21"
  },
  "jest": {
    "testEnvironment": "node",
    "collectCoverageFrom": [
      "src/**/*.js"
    ],
    "coverageReporters": [
      "text",
      "json-summary",
      "html",
      "lcov"
    ],
    "coverageThreshold": {
      "global": {
        "lines": 85,
        "functions": 85,
        "branches": 85,
        "statements": 85
      }
    }
  }
}
```

---

## 🎯 **src/index.js** (Main Application)
```javascript
const { calculateSum, validateEmail, processData } = require('./utils');

/**
 * Main application entry point
 * Demonstrates basic functionality for UMCA testing
 */
function main() {
  console.log('🧪 UMCA Test Application Starting...');
  
  // Test mathematical operations
  const numbers = [1, 2, 3, 4, 5];
  const sum = calculateSum(numbers);
  console.log(`Sum of [${numbers.join(', ')}] = ${sum}`);
  
  // Test email validation
  const emails = ['test@example.com', 'invalid-email', 'user@domain.org'];
  emails.forEach(email => {
    const isValid = validateEmail(email);
    console.log(`Email "${email}" is ${isValid ? 'valid' : 'invalid'}`);
  });
  
  // Test data processing
  const testData = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 },
    { id: 3, name: 'Charlie', age: 35 }
  ];
  
  const processed = processData(testData);
  console.log('Processed data:', processed);
  
  console.log('✅ UMCA Test Application Complete');
  return { success: true, results: { sum, processed } };
}

// Export for testing
module.exports = { main };

// Run if called directly
if (require.main === module) {
  main();
}
```

---

## 🔧 **src/utils.js** (Utility Functions)
```javascript
const _ = require('lodash');

/**
 * Calculate sum of numbers array
 * @param {number[]} numbers - Array of numbers to sum
 * @returns {number} Sum of all numbers
 */
function calculateSum(numbers) {
  if (!Array.isArray(numbers)) {
    throw new Error('Input must be an array');
  }
  
  if (numbers.length === 0) {
    return 0;
  }
  
  return numbers.reduce((sum, num) => {
    if (typeof num !== 'number') {
      throw new Error('All elements must be numbers');
    }
    return sum + num;
  }, 0);
}

/**
 * Validate email format using simple regex
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function validateEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Process data array with lodash
 * @param {Object[]} data - Array of objects to process
 * @returns {Object} Processed data summary
 */
function processData(data) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }
  
  const ages = _.map(data, 'age').filter(age => typeof age === 'number');
  const names = _.map(data, 'name').filter(name => typeof name === 'string');
  
  return {
    count: data.length,
    averageAge: ages.length > 0 ? _.mean(ages) : 0,
    names: _.sortBy(names),
    oldestPerson: _.maxBy(data, 'age'),
    youngestPerson: _.minBy(data, 'age')
  };
}

/**
 * Intentional function with potential security issue for testing
 * This should be caught by SAST scanning
 * @param {string} userInput - User provided input
 * @returns {string} Processed input
 */
function processUserInput(userInput) {
  // This eval() should trigger security scan alerts
  // WARNING: This is intentionally insecure for testing purposes
  if (userInput.includes('eval:')) {
    return eval(userInput.replace('eval:', ''));  // SECURITY ISSUE
  }
  
  return userInput;
}

module.exports = {
  calculateSum,
  validateEmail,
  processData,
  processUserInput
};
```

---

## 🧪 **test/index.test.js** (Main Tests)
```javascript
const { main } = require('../src/index');

describe('Main Application', () => {
  test('should run main function successfully', () => {
    const result = main();
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('results');
    expect(result.results).toHaveProperty('sum');
    expect(result.results).toHaveProperty('processed');
  });
  
  test('should calculate correct sum in main function', () => {
    const result = main();
    
    // Sum of [1,2,3,4,5] should be 15
    expect(result.results.sum).toBe(15);
  });
  
  test('should process data correctly in main function', () => {
    const result = main();
    
    expect(result.results.processed).toHaveProperty('count', 3);
    expect(result.results.processed).toHaveProperty('averageAge');
    expect(result.results.processed).toHaveProperty('names');
    expect(result.results.processed.names).toEqual(['Alice', 'Bob', 'Charlie']);
  });
});
```

---

## 🔬 **test/utils.test.js** (Utility Tests)
```javascript
const { calculateSum, validateEmail, processData, processUserInput } = require('../src/utils');

describe('Utility Functions', () => {
  describe('calculateSum', () => {
    test('should calculate sum of positive numbers', () => {
      expect(calculateSum([1, 2, 3, 4, 5])).toBe(15);
    });
    
    test('should handle empty array', () => {
      expect(calculateSum([])).toBe(0);
    });
    
    test('should handle negative numbers', () => {
      expect(calculateSum([-1, -2, -3])).toBe(-6);
    });
    
    test('should handle mixed positive and negative numbers', () => {
      expect(calculateSum([10, -5, 3])).toBe(8);
    });
    
    test('should throw error for non-array input', () => {
      expect(() => calculateSum('not an array')).toThrow('Input must be an array');
    });
    
    test('should throw error for non-numeric elements', () => {
      expect(() => calculateSum([1, 'two', 3])).toThrow('All elements must be numbers');
    });
  });
  
  describe('validateEmail', () => {
    test('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.org')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });
    
    test('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
    
    test('should handle non-string input', () => {
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
      expect(validateEmail(123)).toBe(false);
    });
    
    test('should trim whitespace', () => {
      expect(validateEmail('  test@example.com  ')).toBe(true);
    });
  });
  
  describe('processData', () => {
    const sampleData = [
      { id: 1, name: 'Alice', age: 30 },
      { id: 2, name: 'Bob', age: 25 },
      { id: 3, name: 'Charlie', age: 35 }
    ];
    
    test('should process data correctly', () => {
      const result = processData(sampleData);
      
      expect(result.count).toBe(3);
      expect(result.averageAge).toBe(30);
      expect(result.names).toEqual(['Alice', 'Bob', 'Charlie']);
      expect(result.oldestPerson.name).toBe('Charlie');
      expect(result.youngestPerson.name).toBe('Bob');
    });
    
    test('should handle empty array', () => {
      const result = processData([]);
      
      expect(result.count).toBe(0);
      expect(result.averageAge).toBe(0);
      expect(result.names).toEqual([]);
    });
    
    test('should handle data with missing fields', () => {
      const incompleteData = [
        { id: 1, name: 'Alice' }, // missing age
        { id: 2, age: 25 },       // missing name
        { id: 3, name: 'Bob', age: 30 }
      ];
      
      const result = processData(incompleteData);
      
      expect(result.count).toBe(3);
      expect(result.averageAge).toBe(27.5); // (25 + 30) / 2
      expect(result.names).toEqual(['Alice', 'Bob']);
    });
    
    test('should throw error for non-array input', () => {
      expect(() => processData('not an array')).toThrow('Data must be an array');
    });
  });
  
  describe('processUserInput', () => {
    test('should return input unchanged for safe strings', () => {
      expect(processUserInput('hello world')).toBe('hello world');
    });
    
    test('should handle eval input (security test)', () => {
      // This test might fail in CI due to security scanning
      // That's expected behavior - the security scanner should catch this
      expect(() => processUserInput('eval:1+1')).not.toThrow();
    });
  });
});
```

---

## ⚙️ **eslint.config.js** (ESLint Configuration)
```javascript
const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        Buffer: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
      'indent': ['error', 2],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'no-eval': 'warn'  // Should catch the security issue but not fail
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    }
  }
];
```

---

## 📋 **README.md** (Test Project README)
```markdown
# UMCA Test Project

This is a simple Node.js project designed to test all components of the UMCA system.

## Purpose

- Validate CI/CD pipeline functionality
- Test coverage enforcement  
- Trigger security scans
- Verify SBOM generation
- Test helper scripts

## Setup

```bash
npm install
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run linting
npm run lint
```

## Expected Test Results

- **High Coverage**: Tests should achieve >85% coverage
- **Security Issues**: Contains intentional security issue (eval) for testing
- **Lint Issues**: Should pass linting with warnings about security issues

## Files

- `src/index.js` - Main application
- `src/utils.js` - Utility functions (includes security issue for testing)
- `test/*.test.js` - Comprehensive test suite
- `package.json` - Dependencies and scripts
- `eslint.config.js` - Linting configuration
```

---

## 🎯 **Coverage Test Scenarios**

To test the coverage enforcement script, you can modify the tests:

### **High Coverage Scenario** (Should Pass)
- Keep all existing tests
- Coverage should be >90%

### **Low Coverage Scenario** (Should Fail)  
- Comment out half the tests in `utils.test.js`
- Coverage should drop below 85%
- `check-coverage.mjs` should fail

---

## 🔒 **Security Test Scenarios**

The code includes intentional security issues:

### **SAST Should Detect**
- `eval()` usage in `processUserInput` function
- This should trigger Semgrep security warnings

### **Secrets Test** (Add to test)
```javascript
// Add this to any file to test secret detection
const apiKey = 'sk-1234567890abcdef1234567890abcdef'; // Should trigger Gitleaks
const dbPassword = 'password123'; // Should trigger Gitleaks  
```

---

## ✅ **Quick Setup Commands**

```bash
# Create the test project structure
mkdir -p umca-testing/test-project/{src,test}

# Copy all the templates above into their respective files
# Then run:
cd umca-testing/test-project
npm install
npm test
npm run lint
```

**This gives you a complete test project to validate every aspect of the UMCA system!** 🧪