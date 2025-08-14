# TASK BRIEF 02: P0 PLANNING ASSISTANT

**Date**: 2025-01-27  
**Target**: AI Assistant (Surgical Precision Standard)  
**Scope**: Create the P0 Planning Assistant prompt that generates Plan Packs  
**Deliverable**: Single AI assistant prompt file (≤200 lines)

---

## 🎯 SINGLE TASK FOCUS

**Create**: `P0_PLANNING_ASSISTANT.md` - The P0 phase planning assistant prompt

**Success Criteria**: 
- ≤200 lines total (including instructions and examples)
- Generates valid PLAN_PACK.schema.json compliant outputs
- Operates at "Phase 0: Problem Definition" level
- Ready for immediate deployment

---

## 📋 REQUIRED SOURCE MATERIALS

**You MUST reference these exact files**:

### Primary Requirements:
- `PLAN_PACK.schema.json` (just delivered) - Output format specification
- `02b_FINAL_ROADMAP_EXCELLENCE_BRIEF.md` - Lines 33-47 specify P0-P6 requirements
- `HTML_Proof_of_Concept.html` - Shows P0 planning scope visually

### Excellence Standard:
- `EXCELLENCE_METHODOLOGY_ANALYSIS_AND_REFERENCE.md` - Surgical precision methodology
- `01_Plan_Pack_validation.md` - Validation pattern that worked

### Integration Pattern:
- **PRIMARY REFERENCE**: `8_SYSTEM_PROMPTS/UNIFIED_MASTER_COORDINATOR_AI_PROMPT.md` (497 lines - comprehensive)
  - Use for: Structure, deliverable formats, quality gates, handoff protocols, G0-G8 integration
- **PRECISION METHODOLOGY**: `8_SYSTEM_PROMPTS/08_master_coordinator_assistant_excellence_system_prompt.md` (151 lines)  
  - Use for: Binary pass/fail criteria, edge-case protocols, surgical precision principles
- **SYNTHESIS**: Unified's comprehensive coverage + Excellence's operational precision methodology

---

## 🎯 P0 PLANNING PHASE SCOPE

**P0 Focus**: Problem Definition and Initial Planning

**Core Responsibilities**:
1. **Problem Brief**: Extract context, goals, scope, non-goals from user input
2. **Initial Constraints**: Identify business/technical/policy constraints  
3. **Stakeholder Mapping**: Define who's involved and success metrics
4. **Compliance Baseline**: Determine applicable frameworks (ISO 42001, etc.)
5. **Risk Identification**: Surface initial risks requiring mitigation
6. **Acceptance Criteria**: Define measurable success conditions

**NOT in P0 scope**: Detailed options analysis, technical architecture, implementation decisions

---

## 📖 OUTPUT FORMAT REQUIREMENT

**Must generate JSON conforming to PLAN_PACK.schema.json**:

```json
{
  "planPackId": "p0-[timestamp]",
  "version": "1.0.0",
  "problemBrief": { /* P0 focus area */ },
  "constraints": { /* P0 identifies */ },
  "optionsMatrix": [], /* Empty - P1 responsibility */
  "decisionRecord": { /* Minimal - problem definition decisions only */ },
  "risks": [ /* Initial risks identified */ ],
  "acceptanceCriteria": [ /* Success definitions */ ],
  "operatingModel": { /* Basic workflow only */ },
  "complianceBaseline": { /* Framework requirements */ },
  "artifacts": [ /* References to supporting docs */ ],
  "checksums": { /* SHA-256 of any referenced files */ }
}
```

---

## ⚡ ASSISTANT PROMPT STRUCTURE

**Follow the 8 system prompts pattern**:

1. **Role Definition** - What the P0 assistant does
2. **Input Requirements** - What user must provide  
3. **Processing Instructions** - How to analyze and structure
4. **Output Format** - PLAN_PACK.schema.json compliant JSON
5. **Validation Steps** - Self-check before delivery
6. **Integration Notes** - How P1 will consume this output

---

## 🔍 INTEGRATION REQUIREMENTS

**Input**: User problem description, project context, initial requirements  
**Output**: Plan Pack JSON (P0 components populated)  
**Handoff**: P1 Planning Assistant consumes this Plan Pack and adds options analysis

**Critical**: Must populate `artifacts.targetRoles` and `artifacts.gateInputs` for development handoff to G0-G8 gates.

---

## 🚨 CONSTRAINTS

- **≤200 lines** total markdown file
- **Single assistant prompt** - no additional files  
- **Self-contained** - all instructions in one prompt
- **Immediately deployable** - ready to use as AI assistant prompt
- **JSON output only** - generates PLAN_PACK.schema.json compliant data

---

## 📋 DELIVERY FORMAT

1. **Single file**: `P0_PLANNING_ASSISTANT.md`
2. **Brief commentary** (≤50 words) on design decisions  
3. **Example interaction** showing input → JSON output

---

## 🎯 VALIDATION TEST

Your assistant must handle this input:
```
"We need a user authentication system for our web application. 
Users complain current login is slow and unreliable. 
We have 10k daily active users, need GDPR compliance, 
budget is $50k, deadline is Q2 2025."
```

And produce valid PLAN_PACK JSON with P0 components properly populated.

---

**FOCUS**: This is surgical precision. One assistant prompt. One phase (P0). Reference the exact source files listed above.

**Next**: After this succeeds, we'll tackle P1 Planning Assistant separately.