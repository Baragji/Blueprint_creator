import axios from 'axios';

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

class OllamaService {
  private baseURL = 'http://localhost:11434';
  private defaultModel = 'llama3:latest';

  async generateResponse(prompt: string, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    context?: number[];
  }): Promise<string> {
    try {
      const request: OllamaRequest = {
        model: options?.model || this.defaultModel,
        prompt,
        stream: false,
        context: options?.context,
        options: {
          temperature: options?.temperature || 0.7,
          num_predict: options?.maxTokens || 2000,
        },
      };

      const response = await axios.post<OllamaResponse>(
        `${this.baseURL}/api/generate`,
        request,
        {
          timeout: 60000, // 60 second timeout
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.response) {
        return response.data.response.trim();
      }

      throw new Error('No response received from Ollama');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Ollama server is not running. Please start Ollama first.');
        }
        throw new Error(`Ollama API error: ${error.message}`);
      }
      throw error;
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

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`);
      if (response.data && response.data.models) {
        return response.data.models.map((model: any) => model.name);
      }
      return [];
    } catch {
      return [];
    }
  }

  // Specialized methods for different AI tasks
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

  async generatePlanPack(projectDescription: string): Promise<{
    analysis: string;
    aiAgents: string;
    workflow: string;
    summary: string;
  }> {
    try {
      // Step 1: Analyze the project
      const analysis = await this.analyzeProject(projectDescription);
      
      // Step 2: Recommend AI agents based on analysis
      const aiAgents = await this.recommendAIAgents(analysis);
      
      // Step 3: Generate workflow incorporating AI agents
      const workflow = await this.generateWorkflow(analysis, aiAgents);
      
      // Step 4: Generate executive summary
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
      
      return {
        analysis,
        aiAgents,
        workflow,
        summary,
      };
    } catch (error) {
      throw new Error(`Failed to generate plan pack: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const ollamaService = new OllamaService();
export default ollamaService;