#!/usr/bin/env python3
"""
TDD Context Management Script - Check Context

This script checks the current development context and validates compliance
with the development guardrails framework. It provides insights into the
current state and suggests next actions.

Usage:
    python check_context.py [--gate <gate>] [--validate] [--json]
"""

import os
import sys
import json
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple

class ContextChecker:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.context_file = self.project_root / '.trae' / 'context' / 'development_context.json'
        self.guardrails_config = self.project_root / '.trae' / 'guardrails' / 'config.yml'
        
    def load_context(self) -> Optional[Dict[str, Any]]:
        """Load the current development context."""
        if not self.context_file.exists():
            return None
        
        try:
            with open(self.context_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading context: {e}")
            return None
    
    def check_context_freshness(self, context: Dict[str, Any]) -> Tuple[bool, str]:
        """Check if the context is fresh (updated recently)."""
        last_updated_str = context['project_info'].get('last_updated')
        if not last_updated_str:
            return False, "No last updated timestamp found"
        
        try:
            last_updated = datetime.fromisoformat(last_updated_str.replace('Z', '+00:00'))
            now = datetime.now()
            
            # Consider context stale if older than 1 hour
            if now - last_updated > timedelta(hours=1):
                return False, f"Context is stale (last updated: {last_updated_str})"
            
            return True, "Context is fresh"
        except ValueError:
            return False, "Invalid timestamp format"
    
    def validate_tdd_compliance(self, context: Dict[str, Any]) -> List[Dict[str, str]]:
        """Validate TDD compliance based on current context."""
        issues = []
        
        tdd_cycle = context.get('tdd_cycle', {})
        test_status = context.get('test_status', {})
        
        # Check if we're following RED-GREEN-REFACTOR cycle
        current_cycle = tdd_cycle.get('current_cycle', 'UNKNOWN')
        
        if current_cycle == 'RED':
            if test_status.get('failing_tests', 0) == 0:
                issues.append({
                    'type': 'TDD_VIOLATION',
                    'severity': 'HIGH',
                    'message': 'In RED phase but no failing tests found. Write failing tests first.'
                })
        
        elif current_cycle == 'GREEN':
            if test_status.get('failing_tests', 0) > 0:
                issues.append({
                    'type': 'TDD_VIOLATION',
                    'severity': 'HIGH',
                    'message': 'In GREEN phase but failing tests exist. Fix failing tests before proceeding.'
                })
        
        elif current_cycle == 'REFACTOR':
            if test_status.get('failing_tests', 0) > 0:
                issues.append({
                    'type': 'TDD_VIOLATION',
                    'severity': 'CRITICAL',
                    'message': 'In REFACTOR phase but failing tests exist. All tests must pass before refactoring.'
                })
        
        # Check test coverage
        coverage = test_status.get('coverage_percentage', 0)
        if coverage < 80:
            issues.append({
                'type': 'COVERAGE_LOW',
                'severity': 'MEDIUM',
                'message': f'Test coverage is {coverage}%. Target is 80% minimum.'
            })
        
        # Check if tests have been run recently
        last_run = test_status.get('last_run')
        if not last_run:
            issues.append({
                'type': 'NO_TEST_RUN',
                'severity': 'HIGH',
                'message': 'No test runs recorded. Run tests to validate current state.'
            })
        else:
            try:
                last_run_time = datetime.fromisoformat(last_run.replace('Z', '+00:00'))
                if datetime.now() - last_run_time > timedelta(minutes=30):
                    issues.append({
                        'type': 'STALE_TESTS',
                        'severity': 'MEDIUM',
                        'message': 'Tests haven\'t been run recently. Consider running tests to ensure current state.'
                    })
            except ValueError:
                pass
        
        return issues
    
    def validate_quality_gates(self, context: Dict[str, Any], target_gate: Optional[str] = None) -> List[Dict[str, str]]:
        """Validate quality gate compliance."""
        issues = []
        quality_gates = context.get('quality_gates', {})
        current_gate = context.get('current_gate', 'G1')
        
        gate_order = ['G1', 'G2', 'G3', 'G4', 'G5']
        
        if target_gate:
            if target_gate not in gate_order:
                issues.append({
                    'type': 'INVALID_GATE',
                    'severity': 'HIGH',
                    'message': f'Invalid target gate: {target_gate}. Valid gates: {gate_order}'
                })
                return issues
            
            target_index = gate_order.index(target_gate)
            current_index = gate_order.index(current_gate) if current_gate in gate_order else 0
            
            # Check if we're trying to skip gates
            if target_index > current_index + 1:
                issues.append({
                    'type': 'GATE_SKIP',
                    'severity': 'CRITICAL',
                    'message': f'Cannot skip from {current_gate} to {target_gate}. Gates must be completed sequentially.'
                })
        
        # Validate current gate requirements
        if current_gate == 'G1':
            # Requirements validation
            if not quality_gates.get('G1', {}).get('requirements_validated', False):
                issues.append({
                    'type': 'GATE_REQUIREMENT',
                    'severity': 'HIGH',
                    'message': 'G1: Requirements not validated. Complete requirements analysis.'
                })
        
        elif current_gate == 'G2':
            # Architecture approval
            if not quality_gates.get('G2', {}).get('architecture_approved', False):
                issues.append({
                    'type': 'GATE_REQUIREMENT',
                    'severity': 'HIGH',
                    'message': 'G2: Architecture not approved. Complete architecture design and review.'
                })
        
        elif current_gate == 'G3':
            # Implementation requirements
            code_metrics = context.get('code_metrics', {})
            if code_metrics.get('total_files', 0) == 0:
                issues.append({
                    'type': 'GATE_REQUIREMENT',
                    'severity': 'HIGH',
                    'message': 'G3: No implementation files found. Begin implementation.'
                })
        
        elif current_gate == 'G4':
            # Testing requirements
            test_status = context.get('test_status', {})
            if test_status.get('total_tests', 0) == 0:
                issues.append({
                    'type': 'GATE_REQUIREMENT',
                    'severity': 'CRITICAL',
                    'message': 'G4: No tests found. Implement comprehensive test suite.'
                })
            elif test_status.get('failing_tests', 0) > 0:
                issues.append({
                    'type': 'GATE_REQUIREMENT',
                    'severity': 'CRITICAL',
                    'message': 'G4: Failing tests exist. All tests must pass for G4 completion.'
                })
        
        elif current_gate == 'G5':
            # Deployment readiness
            if not quality_gates.get('G5', {}).get('deployment_ready', False):
                issues.append({
                    'type': 'GATE_REQUIREMENT',
                    'severity': 'HIGH',
                    'message': 'G5: Deployment not ready. Complete deployment preparation.'
                })
        
        return issues
    
    def suggest_next_actions(self, context: Dict[str, Any], issues: List[Dict[str, str]]) -> List[str]:
        """Suggest next actions based on current context and issues."""
        suggestions = []
        
        # Critical issues first
        critical_issues = [i for i in issues if i['severity'] == 'CRITICAL']
        if critical_issues:
            suggestions.append("🚨 CRITICAL: Address critical issues before proceeding:")
            for issue in critical_issues:
                suggestions.append(f"   - {issue['message']}")
            return suggestions
        
        # TDD cycle suggestions
        tdd_cycle = context.get('tdd_cycle', {})
        current_cycle = tdd_cycle.get('current_cycle', 'RED')
        test_status = context.get('test_status', {})
        
        if current_cycle == 'RED':
            if test_status.get('failing_tests', 0) == 0:
                suggestions.append("📝 Write failing tests for the next feature")
            else:
                suggestions.append("✅ Implement minimal code to make failing tests pass (GREEN phase)")
        
        elif current_cycle == 'GREEN':
            if test_status.get('failing_tests', 0) == 0:
                suggestions.append("🔧 Refactor code while keeping tests green (REFACTOR phase)")
            else:
                suggestions.append("🐛 Fix failing tests before proceeding")
        
        elif current_cycle == 'REFACTOR':
            suggestions.append("📝 Start next TDD cycle: Write failing tests for next feature (RED phase)")
        
        # Quality gate suggestions
        current_gate = context.get('current_gate', 'G1')
        quality_gates = context.get('quality_gates', {})
        
        if current_gate == 'G1' and not quality_gates.get('G1', {}).get('requirements_validated', False):
            suggestions.append("📋 Complete requirements validation for G1 gate")
        elif current_gate == 'G2' and not quality_gates.get('G2', {}).get('architecture_approved', False):
            suggestions.append("🏗️ Complete architecture design and approval for G2 gate")
        
        # Coverage suggestions
        coverage = test_status.get('coverage_percentage', 0)
        if coverage < 80:
            suggestions.append(f"📊 Improve test coverage from {coverage}% to 80%+")
        
        # High priority issues
        high_issues = [i for i in issues if i['severity'] == 'HIGH']
        if high_issues:
            suggestions.append("⚠️ Address high priority issues:")
            for issue in high_issues[:3]:  # Limit to top 3
                suggestions.append(f"   - {issue['message']}")
        
        if not suggestions:
            suggestions.append("✨ Great! No immediate issues found. Continue with current development.")
        
        return suggestions
    
    def generate_report(self, context: Dict[str, Any], issues: List[Dict[str, str]], 
                       suggestions: List[str], as_json: bool = False) -> str:
        """Generate a comprehensive context report."""
        if as_json:
            report_data = {
                'timestamp': datetime.now().isoformat(),
                'context': context,
                'issues': issues,
                'suggestions': suggestions,
                'summary': {
                    'total_issues': len(issues),
                    'critical_issues': len([i for i in issues if i['severity'] == 'CRITICAL']),
                    'high_issues': len([i for i in issues if i['severity'] == 'HIGH']),
                    'medium_issues': len([i for i in issues if i['severity'] == 'MEDIUM'])
                }
            }
            return json.dumps(report_data, indent=2)
        
        # Text report
        report = []
        report.append("\n" + "=" * 60)
        report.append("         TDD CONTEXT VALIDATION REPORT")
        report.append("=" * 60)
        
        # Context summary
        report.append(f"\n📊 PROJECT STATUS")
        report.append(f"   Project: {context['project_info']['name']}")
        report.append(f"   Phase: {context.get('current_phase', 'Unknown')}")
        report.append(f"   Gate: {context.get('current_gate', 'Unknown')}")
        report.append(f"   TDD Cycle: {context.get('tdd_cycle', {}).get('current_cycle', 'Unknown')}")
        report.append(f"   Last Updated: {context['project_info'].get('last_updated', 'Unknown')}")
        
        # Test status
        test_status = context.get('test_status', {})
        report.append(f"\n🧪 TEST STATUS")
        report.append(f"   Total Tests: {test_status.get('total_tests', 0)}")
        report.append(f"   Passing: {test_status.get('passing_tests', 0)}")
        report.append(f"   Failing: {test_status.get('failing_tests', 0)}")
        report.append(f"   Coverage: {test_status.get('coverage_percentage', 0)}%")
        
        # Issues
        if issues:
            report.append(f"\n⚠️  ISSUES FOUND ({len(issues)})")
            for issue in issues:
                severity_icon = {
                    'CRITICAL': '🚨',
                    'HIGH': '⚠️',
                    'MEDIUM': '⚡',
                    'LOW': 'ℹ️'
                }.get(issue['severity'], '•')
                report.append(f"   {severity_icon} [{issue['severity']}] {issue['message']}")
        else:
            report.append(f"\n✅ NO ISSUES FOUND")
        
        # Suggestions
        if suggestions:
            report.append(f"\n💡 NEXT ACTIONS")
            for suggestion in suggestions:
                report.append(f"   {suggestion}")
        
        report.append("\n" + "=" * 60)
        
        return "\n".join(report)

def main():
    parser = argparse.ArgumentParser(description='Check TDD development context')
    parser.add_argument('--gate', help='Validate specific quality gate')
    parser.add_argument('--validate', action='store_true', help='Run full validation')
    parser.add_argument('--json', action='store_true', help='Output as JSON')
    parser.add_argument('--issues-only', action='store_true', help='Show only issues')
    
    args = parser.parse_args()
    
    # Find project root
    current_dir = Path.cwd()
    project_root = current_dir
    
    # Look for package.json to identify project root
    while project_root != project_root.parent:
        if (project_root / 'package.json').exists():
            break
        project_root = project_root.parent
    else:
        print("Error: Could not find project root (no package.json found)")
        sys.exit(1)
    
    checker = ContextChecker(str(project_root))
    
    # Load context
    context = checker.load_context()
    if not context:
        print("Error: No development context found. Run update_context.py first.")
        sys.exit(1)
    
    # Check freshness
    is_fresh, freshness_msg = checker.check_context_freshness(context)
    if not is_fresh and not args.json:
        print(f"Warning: {freshness_msg}")
    
    # Validate
    issues = []
    
    if args.validate or args.gate:
        issues.extend(checker.validate_tdd_compliance(context))
        issues.extend(checker.validate_quality_gates(context, args.gate))
    
    # Generate suggestions
    suggestions = checker.suggest_next_actions(context, issues) if not args.issues_only else []
    
    # Output
    if args.issues_only:
        if issues:
            for issue in issues:
                print(f"[{issue['severity']}] {issue['message']}")
        else:
            print("No issues found.")
    else:
        report = checker.generate_report(context, issues, suggestions, args.json)
        print(report)
    
    # Exit with error code if critical issues found
    critical_issues = [i for i in issues if i['severity'] == 'CRITICAL']
    if critical_issues:
        sys.exit(1)

if __name__ == '__main__':
    main()