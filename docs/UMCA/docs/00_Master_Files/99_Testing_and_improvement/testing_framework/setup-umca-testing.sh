#!/bin/bash

# 🧪 UMCA Testing Repo Setup Script
# This script helps you quickly set up the UMCA testing environment

set -e  # Exit on any error

echo "🧪 Setting up UMCA Testing Environment..."

# Check if we're in the right directory
if [[ ! -d "docs/UMCA" ]]; then
  echo "❌ Error: Please run this script from the Blueprint_creator repository root"
  echo "   The docs/UMCA directory should be present"
  exit 1
fi

# Create testing repository structure
echo "📁 Creating testing directory structure..."
mkdir -p umca-testing/{docs,test-project/{src,test},ai-tests}

# Copy UMCA system
echo "📋 Copying UMCA system..."
cp -r docs/UMCA umca-testing/docs/

# Copy testing plans
echo "📝 Copying testing plans..."
cp UMCA_TESTING_PLAN.md umca-testing/
cp TEST_PROJECT_TEMPLATES.md umca-testing/

# Create test project files from templates
echo "🛠️  Creating test project..."

# package.json
cat > umca-testing/test-project/package.json << 'EOF'
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
EOF

# Main application file (simplified for script)
cat > umca-testing/test-project/src/index.js << 'EOF'
const { calculateSum, validateEmail, processData } = require('./utils');

function main() {
  console.log('🧪 UMCA Test Application Starting...');
  
  const numbers = [1, 2, 3, 4, 5];
  const sum = calculateSum(numbers);
  console.log(`Sum of [${numbers.join(', ')}] = ${sum}`);
  
  const emails = ['test@example.com', 'invalid-email', 'user@domain.org'];
  emails.forEach(email => {
    const isValid = validateEmail(email);
    console.log(`Email "${email}" is ${isValid ? 'valid' : 'invalid'}`);
  });
  
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

module.exports = { main };

if (require.main === module) {
  main();
}
EOF

# Utility functions (simplified)
cat > umca-testing/test-project/src/utils.js << 'EOF'
const _ = require('lodash');

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

function validateEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

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

// Intentional security issue for testing
function processUserInput(userInput) {
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
EOF

# Basic tests
cat > umca-testing/test-project/test/utils.test.js << 'EOF'
const { calculateSum, validateEmail, processData } = require('../src/utils');

describe('Utility Functions', () => {
  describe('calculateSum', () => {
    test('should calculate sum of positive numbers', () => {
      expect(calculateSum([1, 2, 3, 4, 5])).toBe(15);
    });
    
    test('should handle empty array', () => {
      expect(calculateSum([])).toBe(0);
    });
    
    test('should throw error for non-array input', () => {
      expect(() => calculateSum('not an array')).toThrow('Input must be an array');
    });
  });
  
  describe('validateEmail', () => {
    test('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.org')).toBe(true);
    });
    
    test('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });
});
EOF

# Main test
cat > umca-testing/test-project/test/index.test.js << 'EOF'
const { main } = require('../src/index');

describe('Main Application', () => {
  test('should run main function successfully', () => {
    const result = main();
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('results');
    expect(result.results.sum).toBe(15);
  });
});
EOF

# ESLint config
cat > umca-testing/test-project/eslint.config.js << 'EOF'
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
        module: 'readonly',
        require: 'readonly',
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'error',
      'no-eval': 'warn'
    }
  }
];
EOF

# Test project README
cat > umca-testing/test-project/README.md << 'EOF'
# UMCA Test Project

Simple Node.js project for testing UMCA system components.

## Setup
```bash
npm install
```

## Testing
```bash
npm test              # Run tests
npm run test:coverage # Run with coverage
npm run lint          # Run linting
```

## Expected Results
- High test coverage (>85%)
- Some security warnings from ESLint
- All tests should pass
EOF

# Main testing README
cat > umca-testing/README.md << 'EOF'
# 🧪 UMCA System Testing

This repository contains systematic testing of the Unified Master Coordinator AI system.

## Quick Start

1. **Set up test project**:
   ```bash
   cd test-project
   npm install
   npm test
   ```

2. **Test Master Coordinator prompt**:
   - Copy `docs/UMCA/UNIFIED_MASTER_COORDINATOR_AI_PROMPT.md` to your AI assistant
   - Try the test scenarios in `ai-tests/`

3. **Test CI/CD pipeline**:
   - Copy `.github/workflows/enterprise-ci.yml` to GitHub repo
   - Push code to trigger pipeline

## Files
- `docs/UMCA/` - Complete UMCA system
- `test-project/` - Node.js project for testing
- `UMCA_TESTING_PLAN.md` - Detailed test plan
- `TEST_PROJECT_TEMPLATES.md` - Complete file templates

## Test Results
Document your findings in `TEST_RESULTS.md`
EOF

# Create AI test templates
cat > umca-testing/ai-tests/prompt-test.md << 'EOF'
# Master Coordinator Prompt Test

## Test 1: Basic Prompt Acceptance
Copy the entire UNIFIED_MASTER_COORDINATOR_AI_PROMPT.md to your AI assistant.

**Expected**: AI acknowledges role and explains capabilities

## Test 2: Simple Task
Request: "Quick task: add a hello world function with tests"

**Expected**: AI generates IA task brief with TDD methodology

## Test 3: Enterprise Workflow  
Request: "Initialize enterprise workflow for umca-test-project"

**Expected**: AI begins G0 phase, references state files
EOF

echo ""
echo "✅ UMCA Testing Environment Setup Complete!"
echo ""
echo "📁 Created: ./umca-testing/"
echo "   ├── docs/UMCA/                    # Complete UMCA system"  
echo "   ├── test-project/                 # Node.js test project"
echo "   ├── ai-tests/                     # AI coordination tests"
echo "   ├── UMCA_TESTING_PLAN.md          # Test plan"
echo "   └── README.md                     # Getting started guide"
echo ""
echo "🚀 Next Steps:"
echo "1. cd umca-testing/test-project && npm install"
echo "2. npm test  # Should pass with high coverage"
echo "3. Follow the test plan in UMCA_TESTING_PLAN.md"
echo ""
echo "🧪 Ready to validate the UMCA system!"