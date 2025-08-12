// Quick Pipeline Test for Ollama Quality Evaluation
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

function scoreContent(md, keywords = []) {
    let score = 0;
    const lower = md.toLowerCase();
    if (md && md.length > 300) score += 30;
    const headings = (md.match(/^#+\s/mg) || []).length; 
    if (headings >= 3) score += 20; // Lower threshold
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
    
    const result = await response.json();
    return result?.response;
}

async function quickTest() {
    console.log('🚀 Quick Ollama Pipeline Test');
    
    const tests = [
        {
            name: 'One-Pager',
            prompt: 'Create a brief One-Pager for "A project management tool for remote teams". Include Problem, Target Users, and Success Criteria sections.',
            keywords: ['problem', 'target users', 'success'],
            target: 60
        },
        {
            name: 'Risk Analysis',
            prompt: 'List 5 key risks for "A project management tool for remote teams" startup. Format as markdown with categories.',
            keywords: ['risk', 'security', 'business'],
            target: 60
        }
    ];
    
    const results = [];
    
    for (const test of tests) {
        console.log(`\n=== ${test.name} ===`);
        const start = Date.now();
        
        try {
            const response = await callOllama(test.prompt);
            const duration = (Date.now() - start) / 1000;
            const score = scoreContent(response, test.keywords);
            
            console.log(`⏱️  ${duration.toFixed(1)}s`);
            console.log(`📊 Score: ${score}/100`);
            console.log(`📝 Length: ${response.length} chars`);
            console.log(`🎯 Keywords: ${test.keywords.filter(k => response.toLowerCase().includes(k.toLowerCase())).join(', ')}`);
            console.log(`${score >= test.target ? '✅ PASS' : '❌ FAIL'}`);
            console.log(`📄 Preview: ${response.substring(0, 150)}...`);
            
            results.push({
                name: test.name,
                score: score,
                duration: duration,
                passed: score >= test.target
            });
            
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
            results.push({
                name: test.name,
                score: 0,
                duration: 0,
                passed: false
            });
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(40));
    console.log('📊 SUMMARY');
    console.log('='.repeat(40));
    
    const passed = results.filter(r => r.passed).length;
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    
    console.log(`✅ Passed: ${passed}/${results.length}`);
    console.log(`📊 Avg Score: ${avgScore.toFixed(1)}/100`);
    console.log(`⏱️  Avg Time: ${avgDuration.toFixed(1)}s`);
    
    if (avgScore >= 70) {
        console.log('🟢 GOOD: Ollama quality acceptable for enterprise use');
    } else if (avgScore >= 60) {
        console.log('🟡 FAIR: Ollama needs prompt tuning');
    } else {
        console.log('🔴 POOR: Consider larger model');
    }
}

quickTest().catch(console.error);