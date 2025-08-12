#!/usr/bin/env python3
"""
TDD Context Management Script - Update Context

This script updates the development context based on the current state of the codebase,
test results, and development progress. It maintains context preservation as required
by the development guardrails framework.

Usage:
    python update_context.py [--phase <phase>] [--gate <gate>] [--force]
"""

import os
import sys
import json
import argparse
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

class ContextUpdater:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.context_file = self.project_root / '.trae' / 'context' / 'development_context.json'
        self.context_file.parent.mkdir(parents=True, exist_ok=True)
        
    def load_current_context(self) -> Dict[str, Any]:
        """Load the current development context."""
        if self.context_file.exists():
            with open(self.context_file, 'r') as f:
                return json.load(f)
        return self._get_default_context()
    
    def _get_default_context(self) -> Dict[str, Any]:
        """Get the default context structure."""
        return {
            'project_info': {
                'name': 'AI-First Enterprise Blueprint',
                'version': '1.0.0',
                'last_updated': datetime.now().isoformat()
            },
            'current_phase': 'setup',
            'current_gate': 'G1',
            'test_status': {
                'total_tests': 0,
                'passing_tests': 0,
                'failing_tests': 0,
                'coverage_percentage': 0.0,
                'last_run': None
            },
            'code_metrics': {
                'total_files': 0,
                'total_lines': 0,
                'typescript_files': 0,
                'component_files': 0
            },
            'development_state': {
                'features_completed': [],
                'features_in_progress': [],
                'features_planned': [],
                'blockers': [],
                'technical_debt': []
            },
            'quality_gates': {
                'G1': {'status': 'pending', 'requirements_validated': False},
                'G2': {'status': 'pending', 'architecture_approved': False},
                'G3': {'status': 'pending', 'implementation_complete': False},
                'G4': {'status': 'pending', 'testing_complete': False},
                'G5': {'status': 'pending', 'deployment_ready': False}
            },
            'tdd_cycle': {
                'current_cycle': 'RED',
                'cycles_completed': 0,
                'last_red_phase': None,
                'last_green_phase': None,
                'last_refactor_phase': None
            }
        }
    
    def run_tests(self) -> Dict[str, Any]:
        """Run the test suite and collect results."""
        try:
            # Check if package.json exists and has test script
            package_json = self.project_root / 'package.json'
            if not package_json.exists():
                return {'error': 'No package.json found'}
            
            with open(package_json, 'r') as f:
                package_data = json.load(f)
            
            scripts = package_data.get('scripts', {})
            if 'test' not in scripts:
                return {'error': 'No test script defined in package.json'}
            
            # Run tests
            result = subprocess.run(
                ['npm', 'test', '--', '--reporter=json'],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if result.returncode == 0:
                # Parse test results if available
                try:
                    test_output = json.loads(result.stdout)
                    return {
                        'total_tests': test_output.get('numTotalTests', 0),
                        'passing_tests': test_output.get('numPassedTests', 0),
                        'failing_tests': test_output.get('numFailedTests', 0),
                        'last_run': datetime.now().isoformat(),
                        'success': True
                    }
                except json.JSONDecodeError:
                    return {
                        'total_tests': 0,
                        'passing_tests': 0,
                        'failing_tests': 0,
                        'last_run': datetime.now().isoformat(),
                        'success': True,
                        'note': 'Tests ran but output not parseable'
                    }
            else:
                return {
                    'error': f'Tests failed with exit code {result.returncode}',
                    'stderr': result.stderr,
                    'last_run': datetime.now().isoformat(),
                    'success': False
                }
                
        except subprocess.TimeoutExpired:
            return {'error': 'Test execution timed out'}
        except Exception as e:
            return {'error': f'Failed to run tests: {str(e)}'}
    
    def analyze_codebase(self) -> Dict[str, Any]:
        """Analyze the current codebase metrics."""
        metrics = {
            'total_files': 0,
            'total_lines': 0,
            'typescript_files': 0,
            'component_files': 0,
            'test_files': 0
        }
        
        # Count files and lines
        for file_path in self.project_root.rglob('*'):
            if file_path.is_file() and not any(part.startswith('.') for part in file_path.parts):
                if file_path.suffix in ['.ts', '.tsx', '.js', '.jsx']:
                    metrics['total_files'] += 1
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            lines = len(f.readlines())
                            metrics['total_lines'] += lines
                    except (UnicodeDecodeError, PermissionError):
                        pass
                    
                    if file_path.suffix in ['.ts', '.tsx']:
                        metrics['typescript_files'] += 1
                    
                    if file_path.suffix in ['.tsx', '.jsx'] or 'component' in file_path.name.lower():
                        metrics['component_files'] += 1
                    
                    if 'test' in file_path.name.lower() or 'spec' in file_path.name.lower():
                        metrics['test_files'] += 1
        
        return metrics
    
    def update_context(self, phase: Optional[str] = None, gate: Optional[str] = None, 
                      force: bool = False) -> Dict[str, Any]:
        """Update the development context."""
        context = self.load_current_context()
        
        # Update timestamp
        context['project_info']['last_updated'] = datetime.now().isoformat()
        
        # Update phase and gate if provided
        if phase:
            context['current_phase'] = phase
        if gate:
            context['current_gate'] = gate
        
        # Update test status
        test_results = self.run_tests()
        if 'error' not in test_results:
            context['test_status'].update(test_results)
        else:
            context['test_status']['last_error'] = test_results['error']
            context['test_status']['last_run'] = datetime.now().isoformat()
        
        # Update code metrics
        context['code_metrics'] = self.analyze_codebase()
        
        # Calculate test coverage if possible
        if context['test_status']['total_tests'] > 0:
            coverage = (context['test_status']['passing_tests'] / 
                       context['test_status']['total_tests']) * 100
            context['test_status']['coverage_percentage'] = round(coverage, 2)
        
        # Update TDD cycle based on test results
        if context['test_status'].get('success'):
            if context['test_status']['failing_tests'] > 0:
                context['tdd_cycle']['current_cycle'] = 'RED'
                context['tdd_cycle']['last_red_phase'] = datetime.now().isoformat()
            elif context['test_status']['passing_tests'] > 0:
                if context['tdd_cycle']['current_cycle'] == 'RED':
                    context['tdd_cycle']['current_cycle'] = 'GREEN'
                    context['tdd_cycle']['last_green_phase'] = datetime.now().isoformat()
                elif context['tdd_cycle']['current_cycle'] == 'GREEN':
                    context['tdd_cycle']['current_cycle'] = 'REFACTOR'
                    context['tdd_cycle']['last_refactor_phase'] = datetime.now().isoformat()
                    context['tdd_cycle']['cycles_completed'] += 1
        
        # Save updated context
        with open(self.context_file, 'w') as f:
            json.dump(context, f, indent=2)
        
        return context
    
    def print_summary(self, context: Dict[str, Any]):
        """Print a summary of the current context."""
        print("\n=== Development Context Summary ===")
        print(f"Project: {context['project_info']['name']}")
        print(f"Current Phase: {context['current_phase']}")
        print(f"Current Gate: {context['current_gate']}")
        print(f"Last Updated: {context['project_info']['last_updated']}")
        
        print("\n--- Test Status ---")
        test_status = context['test_status']
        print(f"Total Tests: {test_status['total_tests']}")
        print(f"Passing: {test_status['passing_tests']}")
        print(f"Failing: {test_status['failing_tests']}")
        print(f"Coverage: {test_status['coverage_percentage']}%")
        
        print("\n--- Code Metrics ---")
        metrics = context['code_metrics']
        print(f"Total Files: {metrics['total_files']}")
        print(f"Total Lines: {metrics['total_lines']}")
        print(f"TypeScript Files: {metrics['typescript_files']}")
        print(f"Component Files: {metrics['component_files']}")
        
        print("\n--- TDD Cycle ---")
        tdd = context['tdd_cycle']
        print(f"Current Cycle: {tdd['current_cycle']}")
        print(f"Cycles Completed: {tdd['cycles_completed']}")
        
        if 'last_error' in test_status:
            print(f"\n--- Last Error ---")
            print(f"Error: {test_status['last_error']}")

def main():
    parser = argparse.ArgumentParser(description='Update TDD development context')
    parser.add_argument('--phase', help='Set the current development phase')
    parser.add_argument('--gate', help='Set the current quality gate')
    parser.add_argument('--force', action='store_true', help='Force update even if tests fail')
    parser.add_argument('--quiet', action='store_true', help='Suppress output')
    
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
    
    updater = ContextUpdater(str(project_root))
    
    try:
        context = updater.update_context(
            phase=args.phase,
            gate=args.gate,
            force=args.force
        )
        
        if not args.quiet:
            updater.print_summary(context)
            
        print(f"\nContext updated successfully: {updater.context_file}")
        
    except Exception as e:
        print(f"Error updating context: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()