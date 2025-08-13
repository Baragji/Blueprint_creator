#!/usr/bin/env python3

"""
Context Update Script for Master Coordinator AI
Updates project state and evidence log after task completion
Usage: python3 scripts/update_context.py "description of changes"

Auto-detects project structure and state file locations
Supports multiple deployment patterns and configurations
"""

import os
import sys
import json
from datetime import datetime, timezone
from pathlib import Path

def find_project_root():
    """Auto-detect project root by looking for common markers"""
    current_dir = Path.cwd()
    
    # Common project root indicators
    root_markers = [
        '.git',
        'package.json', 
        'pyproject.toml',
        'Cargo.toml',
        'pom.xml',
        'build.gradle',
        '.project',
        'README.md'
    ]
    
    # Start from current directory and walk up
    for path in [current_dir] + list(current_dir.parents):
        for marker in root_markers:
            if (path / marker).exists():
                return path
    
    # Fallback to current directory
    return current_dir

def find_state_directory():
    """Auto-detect state directory in common UMCA locations"""
    project_root = find_project_root()
    
    candidate_dirs = [
        # Environment variable override
        Path(os.environ['UMCA_STATE_DIR']) if 'UMCA_STATE_DIR' in os.environ else None,
        
        # UMCA standard locations
        project_root / 'docs' / 'UMCA' / 'state',
        project_root / 'docs' / 'execution' / 'state', 
        project_root / '.umca' / 'state',
        project_root / 'state',
        
        # Alternative patterns
        project_root / 'docs' / 'state',
        project_root / 'umca' / 'state',
    ]
    
    # Remove None values and find existing directories
    candidate_dirs = [d for d in candidate_dirs if d is not None]
    
    for candidate_dir in candidate_dirs:
        if candidate_dir.exists():
            print(f"📁 Using state directory: {candidate_dir}")
            return candidate_dir
    
    # Create first viable directory
    for candidate_dir in candidate_dirs:
        try:
            candidate_dir.mkdir(parents=True, exist_ok=True)
            print(f"📁 Created state directory: {candidate_dir}")
            return candidate_dir
        except PermissionError:
            continue
    
    # Final fallback
    fallback_dir = project_root / '.umca-state'
    fallback_dir.mkdir(exist_ok=True)
    print(f"📁 Using fallback state directory: {fallback_dir}")
    return fallback_dir

def find_evidence_directory():
    """Auto-detect evidence directory for context snapshots"""
    project_root = find_project_root()
    
    candidate_dirs = [
        # Environment variable override
        Path(os.environ['UMCA_EVIDENCE_DIR']) if 'UMCA_EVIDENCE_DIR' in os.environ else None,
        
        # UMCA standard locations
        project_root / 'docs' / 'UMCA' / 'execution' / 'evidence',
        project_root / 'docs' / 'execution' / 'evidence',
        project_root / '.umca' / 'evidence',
        
        # Alternative patterns
        project_root / 'evidence',
        project_root / 'artifacts' / 'evidence',
    ]
    
    # Remove None values
    candidate_dirs = [d for d in candidate_dirs if d is not None]
    
    for candidate_dir in candidate_dirs:
        if candidate_dir.exists():
            print(f"📁 Using evidence directory: {candidate_dir}")
            return candidate_dir
    
    # Create first viable directory
    for candidate_dir in candidate_dirs:
        try:
            candidate_dir.mkdir(parents=True, exist_ok=True)
            print(f"📁 Created evidence directory: {candidate_dir}")
            return candidate_dir
        except PermissionError:
            continue
            
    # Final fallback
    fallback_dir = project_root / '.umca-evidence'
    fallback_dir.mkdir(exist_ok=True)
    print(f"📁 Using fallback evidence directory: {fallback_dir}")
    return fallback_dir

# Dynamic configuration based on auto-detection
PROJECT_ROOT = find_project_root()
STATE_DIR = find_state_directory()
EVIDENCE_DIR = find_evidence_directory()

def update_current_state(change_description):
    """Update the CURRENT_STATE.md file with the latest change"""
    state_file = STATE_DIR / "CURRENT_STATE.md"
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    
    if not state_file.exists():
        print(f"❌ State file not found: {state_file}")
        return False
    
    try:
        content = state_file.read_text(encoding='utf-8')
        
        # Find the "Recent Activity" section
        lines = content.split('\n')
        new_lines = []
        activity_section_found = False
        activity_section_updated = False
        
        for i, line in enumerate(lines):
            if "## Recent Activity" in line:
                activity_section_found = True
                new_lines.append(line)
                new_lines.append("")
                # Add the new activity entry
                new_lines.append(f"### {datetime.now(timezone.utc).strftime('%Y-%m-%d')} - Context Update")
                new_lines.append(f"- 🔄 **{timestamp}**: {change_description}")
                new_lines.append("")
                activity_section_updated = True
                continue
            elif activity_section_found and line.startswith("### ") and not activity_section_updated:
                # This is the start of an existing activity entry
                new_lines.append(f"### {datetime.now(timezone.utc).strftime('%Y-%m-%d')} - Context Update") 
                new_lines.append(f"- 🔄 **{timestamp}**: {change_description}")
                new_lines.append("")
                new_lines.append(line)
                activity_section_updated = True
                continue
            
            new_lines.append(line)
        
        # Update the "Last Updated" timestamp at the top
        for i, line in enumerate(new_lines):
            if line.startswith("**Last Updated**:"):
                new_lines[i] = f"**Last Updated**: {datetime.now(timezone.utc).strftime('%Y-%m-%d')}"
                break
        
        # Write updated content
        state_file.write_text('\n'.join(new_lines), encoding='utf-8')
        print(f"✅ Updated CURRENT_STATE.md with: {change_description}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to update state file: {e}")
        return False

def update_evidence_log(change_description):
    """Update the EVIDENCE_LOG.md file with context change evidence"""
    evidence_file = STATE_DIR / "EVIDENCE_LOG.md"
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    
    if not evidence_file.exists():
        print(f"❌ Evidence log not found: {evidence_file}")
        return False
    
    try:
        content = evidence_file.read_text(encoding='utf-8')
        
        # Find the Evidence Registry section
        lines = content.split('\n')
        new_lines = []
        registry_found = False
        
        for i, line in enumerate(lines):
            if "## Evidence Registry" in line:
                registry_found = True
                new_lines.append(line)
                new_lines.append("")
                # Add new evidence entry
                new_lines.append(f"### {datetime.now(timezone.utc).strftime('%Y-%m-%d')} - Context Update Evidence")
                new_lines.append("")
                new_lines.append("#### Project State Update")
                new_lines.append(f"- **Artifact**: Context Update - {change_description}")
                new_lines.append("- **Type**: State Management")
                new_lines.append(f"- **Timestamp**: {timestamp}")
                new_lines.append(f"- **Location**: `{(STATE_DIR / 'CURRENT_STATE.md').relative_to(PROJECT_ROOT)}`")
                new_lines.append("- **Validation**: Automated context persistence")
                new_lines.append("- **Status**: ✅ LOGGED")
                new_lines.append("")
                continue
            elif registry_found and line.startswith("### ") and "Context Update Evidence" not in line:
                # This is an existing entry - add our new entry before it
                new_lines.append(f"### {datetime.now(timezone.utc).strftime('%Y-%m-%d')} - Context Update Evidence")
                new_lines.append("")
                new_lines.append("#### Project State Update") 
                new_lines.append(f"- **Artifact**: Context Update - {change_description}")
                new_lines.append("- **Type**: State Management")
                new_lines.append(f"- **Timestamp**: {timestamp}")
                new_lines.append(f"- **Location**: `{(STATE_DIR / 'CURRENT_STATE.md').relative_to(PROJECT_ROOT)}`")
                new_lines.append("- **Validation**: Automated context persistence")
                new_lines.append("- **Status**: ✅ LOGGED")
                new_lines.append("")
                new_lines.append(line)
                continue
                
            new_lines.append(line)
        
        # Update the "Last Updated" timestamp at the top
        for i, line in enumerate(new_lines):
            if line.startswith("**Last Updated**:"):
                new_lines[i] = f"**Last Updated**: {datetime.now(timezone.utc).strftime('%Y-%m-%d')}"
                break
        
        # Write updated content
        evidence_file.write_text('\n'.join(new_lines), encoding='utf-8')
        print(f"✅ Updated EVIDENCE_LOG.md with context change evidence")
        return True
        
    except Exception as e:
        print(f"❌ Failed to update evidence log: {e}")
        return False

def create_context_snapshot(change_description):
    """Create a timestamped context snapshot for audit trail"""
    evidence_context_dir = EVIDENCE_DIR / "context-snapshots"
    evidence_context_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now(timezone.utc)
    snapshot_file = evidence_context_dir / f"context-{timestamp.strftime('%Y%m%d-%H%M%S')}.json"
    
    snapshot = {
        "timestamp": timestamp.isoformat(),
        "change_description": change_description,
        "git_info": get_git_info(),
        "project_state": {
            "current_phase": "G0 (Strategy & Risk Scoping)",  # This would be dynamic
            "active_tasks": [],  # This would be populated from actual task tracking
            "recent_changes": change_description
        }
    }
    
    try:
        with open(snapshot_file, 'w', encoding='utf-8') as f:
            json.dump(snapshot, f, indent=2, ensure_ascii=False)
        
        print(f"📸 Context snapshot created: {snapshot_file.name}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to create context snapshot: {e}")
        return False

def get_git_info():
    """Get current git information for context"""
    try:
        import subprocess
        
        # Get current commit hash
        commit = subprocess.run(['git', 'rev-parse', 'HEAD'], 
                              capture_output=True, text=True, cwd=PROJECT_ROOT)
        
        # Get current branch
        branch = subprocess.run(['git', 'branch', '--show-current'], 
                              capture_output=True, text=True, cwd=PROJECT_ROOT)
        
        return {
            "commit": commit.stdout.strip() if commit.returncode == 0 else "unknown",
            "branch": branch.stdout.strip() if branch.returncode == 0 else "unknown"
        }
    except Exception:
        return {"commit": "unknown", "branch": "unknown"}

def main():
    """Main function to handle context updates"""
    if len(sys.argv) < 2:
        print("❌ Usage: python3 update_context.py \"description of changes\"")
        print("   Example: python3 update_context.py \"Completed RA-MarketAnalysis task\"")
        sys.exit(1)
    
    change_description = sys.argv[1]
    
    print(f"🔄 Updating context: {change_description}")
    
    # Directories are already created by auto-detection functions
    
    success = True
    
    # Update state file
    if not update_current_state(change_description):
        success = False
    
    # Update evidence log
    if not update_evidence_log(change_description):
        success = False
    
    # Create context snapshot
    if not create_context_snapshot(change_description):
        success = False
    
    if success:
        print("✅ Context update completed successfully")
        print("📋 State tracking files updated and evidence logged")
    else:
        print("⚠️ Context update completed with some errors")
        sys.exit(1)

if __name__ == "__main__":
    main()