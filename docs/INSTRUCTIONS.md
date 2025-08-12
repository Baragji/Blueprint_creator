# How to Access All Functions in the AI-First Blueprint Interface

## 🚨 IMPORTANT: You're Missing the Advanced Functions!

The interface has **many more functions** than just "Create Plan Pack from Idea". Here's how to access them:

## 1. Opening the Interface
```bash
# Option 1: Direct file opening
open /Users/Yousef_1/Dokumenter/Ai_Coding/Blueprint_creator/Ai_first_blueprint_v4.html

# Option 2: Local server (recommended)
cd /Users/Yousef_1/Dokumenter/Ai_Coding/Blueprint_creator
python3 -m http.server 8080
# Then open: http://localhost:8080/Ai_first_blueprint_v4.html
```

## 2. Accessing Hidden Advanced Functions

### Step 1: Scroll to "Pre-Phase Planning" Section
- Look for the purple timeline with P0, P1, P2, P3, P4, P5, P6

### Step 2: Click on Timeline Items to Expand
- **Click on P2** → You'll see "✨ Draft Architecture ADR" button
- **Click on P3** → You'll see "✨ Draft NFRs" button  
- **Click on G0** → You'll see "✨ Brainstorm Risks" button
- **Click on G3** → You'll see "✨ Draft Acceptance Criteria" button

### Step 3: Use Individual Functions
Each expanded timeline item has its own AI function:
- **P2**: Architecture Decision Records
- **P3**: Non-Functional Requirements  
- **G0**: Risk Analysis
- **G3**: Acceptance Criteria
- **Friday section**: Weekly Update drafting

## 3. Why You Only See One Function

The interface is designed as a **progressive disclosure** system:
1. **Main function**: "Create Plan Pack" (full pipeline)
2. **Individual functions**: Hidden in timeline expansions
3. **Advanced functions**: Require clicking to reveal

## 4. Current Issues with the Interface

### ✅ What Works:
- Ollama integration (confirmed working)
- Full P0-P6 pipeline 
- Individual step functions
- Quality scoring system
- ZIP download with proper structure

### ❌ What Needs Fixing:
- Still has "Gemini" references in UI (confusing)
- No real-time progress indicators
- Slow performance (60-90s per generation)
- Limited error handling

## 5. How I Tested Step-by-Step

I used **command-line tools**, not the web interface:
```bash
# Direct API testing
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "llama3", "prompt": "test", "stream": false}'

# Node.js test script
node test_pipeline.js
```

This gave me real-time timing and step-by-step control that the web interface doesn't show.

## 6. Next Steps

1. **Try the hidden functions**: Click on timeline items to expand them
2. **Test individual steps**: Use the blue "✨" buttons in expanded sections  
3. **Report specific issues**: Tell me which functions don't work
4. **Consider command-line testing**: For more control and debugging

The advanced functions ARE there - they're just hidden behind the timeline interaction design!