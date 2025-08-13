#!/usr/bin/env node

/**
 * Coverage Threshold Enforcement Script
 * Validates that test coverage meets minimum thresholds
 * Usage: node scripts/check-coverage.mjs [threshold]
 * 
 * Auto-detects coverage files and evidence directories
 * Supports multiple project structures and configurations
 */

import fs from 'fs';
import path from 'path';

const DEFAULT_THRESHOLD = 85;

/**
 * Auto-detect coverage file in common locations
 */
function findCoverageFile() {
  const candidatePaths = [
    // Environment variable override
    process.env.COVERAGE_FILE,
    
    // Common Jest locations
    'coverage/coverage-summary.json',
    'coverage/lcov-report/coverage-summary.json',
    
    // Common NYC/Istanbul locations
    'coverage/coverage-final.json',
    '.nyc_output/coverage-summary.json',
    
    // Common alternative locations
    'reports/coverage/coverage-summary.json',
    'test-results/coverage/coverage-summary.json',
    
    // Monorepo patterns
    'packages/coverage/coverage-summary.json',
    'apps/coverage/coverage-summary.json'
  ].filter(Boolean); // Remove undefined/null values

  for (const candidatePath of candidatePaths) {
    if (fs.existsSync(candidatePath)) {
      console.log(`📄 Found coverage file: ${candidatePath}`);
      return candidatePath;
    }
  }
  
  return null;
}

/**
 * Auto-detect evidence directory for artifact storage
 */
function findEvidenceDirectory() {
  const candidateDirs = [
    // Environment variable override
    process.env.EVIDENCE_DIR,
    
    // UMCA standard locations
    'docs/UMCA/execution/evidence/coverage',
    'docs/execution/evidence/coverage',
    '.umca/evidence/coverage',
    
    // Common CI/artifact locations
    'artifacts/coverage',
    'reports/evidence/coverage',
    'evidence/coverage',
    
    // Fallback - create in coverage dir
    'coverage/evidence'
  ].filter(Boolean);

  // Try to find existing directory first
  for (const candidateDir of candidateDirs) {
    if (fs.existsSync(candidateDir)) {
      console.log(`📁 Using existing evidence directory: ${candidateDir}`);
      return candidateDir;
    }
  }
  
  // Create first viable directory
  for (const candidateDir of candidateDirs) {
    try {
      fs.mkdirSync(candidateDir, { recursive: true });
      console.log(`📁 Created evidence directory: ${candidateDir}`);
      return candidateDir;
    } catch (error) {
      continue; // Try next location
    }
  }
  
  // Final fallback
  const fallbackDir = 'coverage-evidence';
  fs.mkdirSync(fallbackDir, { recursive: true });
  console.log(`📁 Using fallback evidence directory: ${fallbackDir}`);
  return fallbackDir;
}

function checkCoverage(threshold = DEFAULT_THRESHOLD) {
  console.log(`🧪 Enforcing coverage threshold: ${threshold}%`);
  
  // Auto-detect coverage file
  const coverageFile = findCoverageFile();
  if (!coverageFile) {
    console.error('❌ No coverage file found in standard locations');
    console.error('   Searched locations:');
    console.error('   - coverage/coverage-summary.json');
    console.error('   - coverage/lcov-report/coverage-summary.json'); 
    console.error('   - reports/coverage/coverage-summary.json');
    console.error('   - .nyc_output/coverage-summary.json');
    console.error('');
    console.error('💡 Solutions:');
    console.error('   1. Run tests with coverage: npm test -- --coverage');
    console.error('   2. Set COVERAGE_FILE environment variable');
    console.error('   3. Ensure your test runner generates coverage-summary.json');
    process.exit(1);
  }

  let coverage;
  try {
    const coverageData = fs.readFileSync(coverageFile, 'utf8');
    coverage = JSON.parse(coverageData);
  } catch (error) {
    console.error(`❌ Failed to read coverage file: ${error.message}`);
    process.exit(1);
  }

  const total = coverage.total;
  const metrics = ['lines', 'statements', 'functions', 'branches'];
  let failed = false;
  let results = [];

  console.log('\n📊 Coverage Report:');
  console.log('==================');

  metrics.forEach(metric => {
    const pct = total[metric].pct;
    const covered = total[metric].covered;
    const totalCount = total[metric].total;
    const status = pct >= threshold ? '✅' : '❌';
    
    console.log(`${status} ${metric.padEnd(12)}: ${pct}% (${covered}/${totalCount})`);
    
    results.push({
      metric,
      percentage: pct,
      covered,
      total: totalCount,
      passed: pct >= threshold
    });
    
    if (pct < threshold) {
      failed = true;
    }
  });

  console.log('==================');

  if (failed) {
    console.log(`\n❌ Coverage check FAILED - Some metrics below ${threshold}% threshold\n`);
    
    const failedMetrics = results.filter(r => !r.passed);
    console.log('Failed metrics:');
    failedMetrics.forEach(metric => {
      const needed = Math.ceil((threshold * metric.total / 100) - metric.covered);
      console.log(`   ${metric.metric}: ${metric.percentage}% (need ${needed} more covered)`);
    });
    
    console.log('\n💡 To fix: Write more tests to cover untested code paths');
    process.exit(1);
  }

  console.log(`\n✅ Coverage check PASSED - All metrics meet ${threshold}% threshold`);
  
  // Write coverage summary for evidence collection
  const evidenceDir = findEvidenceDirectory();
  
  const evidenceSummary = {
    timestamp: new Date().toISOString(),
    threshold: threshold,
    passed: true,
    metrics: results,
    summary: {
      total_lines: total.lines.total,
      covered_lines: total.lines.covered,
      overall_percentage: total.lines.pct
    }
  };
  
  fs.writeFileSync(
    path.join(evidenceDir, 'coverage-evidence.json'),
    JSON.stringify(evidenceSummary, null, 2)
  );
  
  console.log(`📄 Coverage evidence saved to: ${evidenceDir}/coverage-evidence.json`);
}

// Parse command line arguments
const threshold = process.argv[2] ? parseInt(process.argv[2], 10) : DEFAULT_THRESHOLD;

if (isNaN(threshold) || threshold < 0 || threshold > 100) {
  console.error('❌ Invalid threshold. Must be a number between 0-100');
  process.exit(1);
}

checkCoverage(threshold);