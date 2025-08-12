import express, { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  context?: number[];
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
  };
}

interface PlanPackRequest {
  projectDescription: string;
  projectName?: string;
}

interface PlanPack {
  analysis: string;
  aiAgents: string;
  workflow: string;
  summary: string;
}

// Ollama service implementation
class OllamaService {
  private baseURL = 'http://localhost:11434';
  private defaultModel = 'llama3:latest';

  async generateResponse(prompt: string, options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    context?: number[];
  } = {}): Promise<string> {
    try {
      const request: OllamaRequest = {
        model: options.model || this.defaultModel,
        prompt,
        stream: false,
        context: options.context,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 2000,
        },
      };

      const response = await axios.post<OllamaResponse>(
        `${this.baseURL}/api/generate`,
        request,
        {
          timeout: 60000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.response) {
        return response.data.response.trim();
      }

      throw new Error('No response received from Ollama');
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama server is not running. Please start Ollama first.');
      }
      throw new Error(`Ollama API error: ${error.message}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async analyzeProject(projectDescription: string): Promise<string> {
    const prompt = `
As an AI project analyst, analyze the following project description and provide a comprehensive analysis:

Project Description:
${projectDescription}

Please provide:
1. Project scope and objectives
2. Key technical requirements
3. Potential challenges and risks
4. Recommended technology stack
5. Estimated complexity level (1-10)
6. Success criteria

Format your response as a structured analysis with clear sections.`;

    return this.generateResponse(prompt, { temperature: 0.3 });
  }

  async recommendAIAgents(projectAnalysis: string): Promise<string> {
    const prompt = `
Based on the following project analysis, recommend specific AI agents that would be beneficial for this project:

Project Analysis:
${projectAnalysis}

For each recommended AI agent, provide:
1. Agent name and type
2. Specific role and responsibilities
3. Integration points with the project
4. Expected benefits and outcomes
5. Implementation priority (High/Medium/Low)
6. Estimated setup complexity

Recommend 3-5 AI agents that would provide the most value for this project.`;

    return this.generateResponse(prompt, { temperature: 0.4 });
  }

  async generateWorkflow(projectAnalysis: string, aiAgents: string): Promise<string> {
    const prompt = `
Create a detailed workflow for the following project, incorporating the recommended AI agents:

Project Analysis:
${projectAnalysis}

Recommended AI Agents:
${aiAgents}

Generate a comprehensive workflow that includes:
1. Project phases and milestones
2. AI agent deployment timeline
3. Integration checkpoints
4. Quality gates and validation steps
5. Risk mitigation strategies
6. Success metrics for each phase
7. Resource allocation recommendations

Format the workflow as a step-by-step plan with clear dependencies and timelines.`;

    return this.generateResponse(prompt, { temperature: 0.3 });
  }

  async generatePlanPack(projectDescription: string): Promise<PlanPack> {
    try {
      console.log('Starting plan pack generation...');
      
      // Step 1: Analyze the project
      console.log('Step 1: Analyzing project...');
      const analysis = await this.analyzeProject(projectDescription);
      
      // Step 2: Recommend AI agents based on analysis
      console.log('Step 2: Recommending AI agents...');
      const aiAgents = await this.recommendAIAgents(analysis);
      
      // Step 3: Generate workflow incorporating AI agents
      console.log('Step 3: Generating workflow...');
      const workflow = await this.generateWorkflow(analysis, aiAgents);
      
      // Step 4: Generate executive summary
      console.log('Step 4: Creating executive summary...');
      const summaryPrompt = `
Create an executive summary for the following AI-First Enterprise Blueprint plan:

Project Analysis:
${analysis}

AI Agents:
${aiAgents}

Workflow:
${workflow}

Provide a concise executive summary that includes:
1. Project overview and objectives
2. Key AI capabilities and benefits
3. Implementation timeline and milestones
4. Expected ROI and success metrics
5. Risk assessment and mitigation
6. Next steps and recommendations

Keep the summary professional and suitable for executive presentation.`;
      
      const summary = await this.generateResponse(summaryPrompt, { temperature: 0.2 });
      
      console.log('Plan pack generation completed successfully!');
      
      return {
        analysis,
        aiAgents,
        workflow,
        summary,
      };
    } catch (error: any) {
      console.error('Plan pack generation failed:', error.message);
      throw new Error(`Failed to generate plan pack: ${error.message}`);
    }
  }
}

const ollamaService = new OllamaService();

// Check Ollama availability
router.get('/health', async (req: Request, res: Response) => {
  try {
    const isAvailable = await ollamaService.isAvailable();
    res.json({ 
      status: isAvailable ? 'healthy' : 'unavailable',
      ollama: isAvailable,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Generate plan pack
router.post('/generate', async (req: Request<{}, {}, PlanPackRequest>, res: Response) => {
  try {
    const { projectDescription, projectName } = req.body;
    
    if (!projectDescription) {
      return res.status(400).json({ 
        error: 'Project description is required' 
      });
    }

    // Check if Ollama is available
    const isAvailable = await ollamaService.isAvailable();
    if (!isAvailable) {
      return res.status(503).json({ 
        error: 'Ollama service is not available. Please ensure Ollama is running.' 
      });
    }

    console.log(`Generating plan pack for project: ${projectName || 'Unnamed Project'}`);
    
    // Generate the complete plan pack
    const planPack = await ollamaService.generatePlanPack(projectDescription);
    
    // Create timestamp for file naming
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `plan-pack-${projectName ? projectName.toLowerCase().replace(/\s+/g, '-') : 'project'}-${timestamp}.json`;
    
    // Save plan pack to repository
    const outputDir = path.join(__dirname, '../../plan-packs');
    await fs.mkdir(outputDir, { recursive: true });
    
    const planPackData = {
      metadata: {
        projectName: projectName || 'Unnamed Project',
        projectDescription,
        generatedAt: new Date().toISOString(),
        generatedBy: 'AI-First Blueprint Creator',
        version: '1.0.0'
      },
      ...planPack
    };
    
    const filePath = path.join(outputDir, fileName);
    await fs.writeFile(filePath, JSON.stringify(planPackData, null, 2), 'utf8');
    
    console.log(`Plan pack saved to: ${filePath}`);
    
    // Also save a markdown version for better readability
    const markdownContent = `# AI-First Enterprise Blueprint Plan Pack

**Project:** ${projectName || 'Unnamed Project'}  
**Generated:** ${new Date().toISOString()}  
**Description:** ${projectDescription}

## Executive Summary

${planPack.summary}

## Project Analysis

${planPack.analysis}

## AI Agent Recommendations

${planPack.aiAgents}

## Implementation Workflow

${planPack.workflow}

---

*Generated by AI-First Blueprint Creator using Ollama (llama3:latest)*
`;
    
    const markdownFileName = fileName.replace('.json', '.md');
    const markdownFilePath = path.join(outputDir, markdownFileName);
    await fs.writeFile(markdownFilePath, markdownContent, 'utf8');
    
    res.json({
      success: true,
      message: 'Plan pack generated successfully',
      planPack: planPackData,
      files: {
        json: filePath,
        markdown: markdownFilePath
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Plan pack generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate plan pack',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get list of generated plan packs
router.get('/list', async (req: Request, res: Response) => {
  try {
    const outputDir = path.join(__dirname, '../../plan-packs');
    
    try {
      const files = await fs.readdir(outputDir);
      const planPacks = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const stats = await fs.stat(path.join(outputDir, file));
          planPacks.push({
            filename: file,
            path: path.join(outputDir, file),
            createdAt: stats.birthtime,
            size: stats.size
          });
        }
      }
      
      planPacks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      res.json({ planPacks });
    } catch (dirError) {
      // Directory doesn't exist yet
      res.json({ planPacks: [] });
    }
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to list plan packs',
      message: error.message 
    });
  }
});

// Get specific plan pack
router.get('/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const outputDir = path.join(__dirname, '../../plan-packs');
    const filePath = path.join(outputDir, filename);
    
    const content = await fs.readFile(filePath, 'utf8');
    const planPack = JSON.parse(content);
    
    res.json(planPack);
  } catch (error: any) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      res.status(404).json({ error: 'Plan pack not found' });
    } else {
      res.status(500).json({ 
        error: 'Failed to retrieve plan pack',
        message: error.message 
      });
    }
  }
});

export default router;