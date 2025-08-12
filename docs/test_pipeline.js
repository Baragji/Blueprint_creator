// Pipeline Test Script for Ollama Quality Evaluation
// Run with: node test_pipeline.js

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Scoring function from the HTML
function scoreContent(md, keywords = []) {
    let score = 0;
    const lower = md.toLowerCase();
    if (md && md.length > 300) score += 30; // length heuristic
    const headings = (md.match(/^#+\s/mg) || []).length; 
    if (headings >= 5) score += 20;
    keywords.forEach(k => { 
        if (lower.includes(k.toLowerCase())) score += Math.floor(50/keywords.length); 
    });
    return Math.min(100, score);
}

async function callOllama(prompt) {
    const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'llama3',
            prompt: prompt,
            stream: false
        })
    });
    
    if (!response.ok) {
        throw new Error(`Ollama request failed with status ${response.status}`);
    }
    
    const result = await response.json();
    return result?.response;
}

async function testPipelineStep(stepName, prompt, keywords, expectedMinScore = 70) {
    console.log(`\n=== Testing ${stepName} ===`);
    console.log(`Prompt: ${prompt.substring(0, 100)}...`);
    
    const startTime = Date.now();
    
    try {
        const response = await callOllama(prompt);
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        const score = scoreContent(response, keywords);
        const wordCount = response.split(' ').length;
        const headingCount = (response.match(/^#+\s/mg) || []).length;
        
        console.log(`✅ Response received in ${duration.toFixed(1)}s`);
        console.log(`📊 Score: ${score}/100 (Target: ${expectedMinScore}+)`);
        console.log(`📝 Length: ${response.length} chars, ${wordCount} words`);
        console.log(`📋 Headings: ${headingCount}`);
        console.log(`🎯 Keywords found: ${keywords.filter(k => response.toLowerCase().includes(k.toLowerCase())).join(', ')}`);
        
        if (score >= expectedMinScore) {
            console.log(`✅ PASS: Score ${score} meets target ${expectedMinScore}`);
        } else {
            console.log(`❌ FAIL: Score ${score} below target ${expectedMinScore}`);
        }
        
        // Show first 200 chars of response
        console.log(`📄 Preview: ${response.substring(0, 200)}...`);
        
        return {
            step: stepName,
            score: score,
            duration: duration,
            length: response.length,
            wordCount: wordCount,
            headingCount: headingCount,
            passed: score >= expectedMinScore,
            response: response
        };
        
    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        return {
            step: stepName,
            score: 0,
            duration: 0,
            length: 0,
            wordCount: 0,
            headingCount: 0,
            passed: false,
            error: error.message
        };
    }
}

async function runFullPipelineTest() {
    console.log('🚀 Starting Full Pipeline Test with Ollama');
    console.log('Test Idea: "A project management tool for remote teams"');
    
    const testIdea = "A project management tool for remote teams";
    const results = [];
    
    // P0 - One-Pager
    results.push(await testPipelineStep(
        'P0 - One-Pager',
        `Based on the following product idea, create a structured One-Pager in markdown format. The One-Pager should include sections for Problem, Target Users, Constraints, Success Criteria, a rough Timeline, and a Budget Hint. Product Idea: "${testIdea}"`,
        ['problem', 'target users', 'constraints', 'success', 'timeline', 'budget'],
        70
    ));
    
    // P1 - Risk Analysis
    results.push(await testPipelineStep(
        'P1 - Risk Analysis',
        `Based on the following product idea, identify and categorize potential business, technical, regulatory, and security risks for an early-stage startup. Present the risks in markdown format with clear headings for each category. Product idea: "${testIdea}"`,
        ['risk', 'mitigation', 'security', 'regulatory', 'financial'],
        70
    ));
    
    // P2 - Architecture ADR
    results.push(await testPipelineStep(
        'P2 - Architecture ADR',
        `Draft a concise Architecture Decision Record (ADR) in markdown format for the following architecture option. Include sections for Status (Proposed), Context, Decision, Rationale (including trade-offs), and Consequences. Architecture Option: "A serverless architecture using AWS Lambda for compute, S3 for storage, and API Gateway for the frontend."`,
        ['adr', 'context', 'decision', 'rationale', 'trade-offs', 'consequences'],
        70
    ));
    
    // P3 - NFRs
    results.push(await testPipelineStep(
        'P3 - NFRs',
        `For a product described as "${testIdea}", draft a set of non-functional requirements (NFRs) in markdown list format. Cover Reliability, Performance, Security, Privacy, Scalability, Cost, and Accessibility (WCAG 2.2 AA).`,
        ['reliability', 'performance', 'security', 'privacy', 'scalability', 'cost', 'accessibility'],
        70
    ));
    
    // P5 - FinOps CSV
    results.push(await testPipelineStep(
        'P5 - FinOps CSV',
        `For product: "${testIdea}", produce a FinOps cost model in CSV with headers: item,unit,qty,unit_cost_usd,monthly_cost_usd,notes. Include cloud/GPU/LLM/API/storage/bandwidth lines and assumptions.`,
        ['csv', 'cloud', 'storage', 'bandwidth', 'cost'],
        60 // Lower threshold for CSV format
    ));
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 PIPELINE TEST SUMMARY');
    console.log('='.repeat(60));
    
    const totalSteps = results.length;
    const passedSteps = results.filter(r => r.passed).length;
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / totalSteps;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalSteps;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    
    console.log(`✅ Passed: ${passedSteps}/${totalSteps} steps`);
    console.log(`📊 Average Score: ${avgScore.toFixed(1)}/100`);
    console.log(`⏱️  Average Duration: ${avgDuration.toFixed(1)}s per step`);
    console.log(`⏱️  Total Duration: ${totalDuration.toFixed(1)}s`);
    
    results.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${result.step}: ${result.score}/100 (${result.duration.toFixed(1)}s)`);
    });
    
    // Quality Assessment
    console.log('\n📋 QUALITY ASSESSMENT:');
    if (avgScore >= 80) {
        console.log('🟢 EXCELLENT: Ollama producing high-quality enterprise content');
    } else if (avgScore >= 70) {
        console.log('🟡 GOOD: Ollama meeting minimum quality standards');
    } else if (avgScore >= 60) {
        console.log('🟠 FAIR: Ollama needs prompt refinement or larger model');
    } else {
        console.log('🔴 POOR: Consider switching to larger model or different approach');
    }
    
    // Performance Assessment
    if (avgDuration <= 15) {
        console.log('🟢 FAST: Response times excellent for interactive use');
    } else if (avgDuration <= 30) {
        console.log('🟡 ACCEPTABLE: Response times suitable for batch processing');
    } else {
        console.log('🔴 SLOW: Response times may impact user experience');
    }
    
    return results;
}

// Run the test
runFullPipelineTest().catch(console.error);