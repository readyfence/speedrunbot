/**
 * LLM Agent for Intelligent Decision Making
 * Uses local Ollama LLM for strategy and decision making
 */

import fetch from 'node-fetch';

export class LLMAgent {
  constructor(ollamaUrl = 'http://localhost:11434') {
    this.ollamaUrl = ollamaUrl;
    this.model = 'llama3.2' || 'mistral'; // Default to llama3.2, fallback to mistral
    this.context = [];
    this.maxContextLength = 20;
  }

  async initialize() {
    // Check if Ollama is available
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`);
      const data = await response.json();
      const availableModels = data.models?.map(m => m.name) || [];
      
      // Try to find a suitable model
      if (availableModels.some(m => m.includes('llama3'))) {
        this.model = availableModels.find(m => m.includes('llama3'));
      } else if (availableModels.some(m => m.includes('mistral'))) {
        this.model = availableModels.find(m => m.includes('mistral'));
      } else if (availableModels.length > 0) {
        this.model = availableModels[0];
      } else {
        console.warn('No Ollama models found. Install one with: ollama pull llama3.2');
        return false;
      }
      
      console.log(`✅ LLM Agent initialized with model: ${this.model}`);
      return true;
    } catch (error) {
      console.warn('⚠️  Ollama not available. LLM features disabled.');
      console.warn('   Install Ollama: https://ollama.ai');
      console.warn('   Then run: ollama pull llama3.2');
      return false;
    }
  }

  async makeDecision(situation) {
    const prompt = this.buildPrompt(situation);
    
    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 150
          }
        })
      });

      const data = await response.json();
      const decision = this.parseDecision(data.response);
      
      // Add to context
      this.addToContext(situation, decision);
      
      return decision;
    } catch (error) {
      console.error('LLM decision error:', error.message);
      return this.getFallbackDecision(situation);
    }
  }

  buildPrompt(situation) {
    return `You are a Minecraft speedrun AI. Your goal is to beat the game (defeat Ender Dragon) in under 15 minutes.

Current Situation:
- Phase: ${situation.phase}
- Position: ${situation.position}
- Inventory: ${JSON.stringify(situation.inventory)}
- Time elapsed: ${situation.timeElapsed} seconds
- Objectives: ${JSON.stringify(situation.objectives)}

Available Actions:
1. gather_wood - Collect wood from trees
2. craft_tools - Craft tools (pickaxe, etc.)
3. mine_stone - Mine stone/cobblestone
4. mine_iron - Mine iron ore
5. mine_diamonds - Mine diamond ore
6. explore - Move to new area
7. craft_item - Craft specific item

What should the bot do next? Respond with ONLY a JSON object:
{
  "action": "action_name",
  "reason": "brief explanation",
  "priority": 1-10
}`;
  }

  parseDecision(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: try to infer action from text
      const lowerResponse = response.toLowerCase();
      if (lowerResponse.includes('wood') || lowerResponse.includes('tree')) {
        return { action: 'gather_wood', reason: 'Need wood', priority: 8 };
      } else if (lowerResponse.includes('craft') || lowerResponse.includes('pickaxe')) {
        return { action: 'craft_tools', reason: 'Need tools', priority: 9 };
      } else if (lowerResponse.includes('stone') || lowerResponse.includes('mine')) {
        return { action: 'mine_stone', reason: 'Need stone', priority: 7 };
      } else if (lowerResponse.includes('explore') || lowerResponse.includes('move')) {
        return { action: 'explore', reason: 'Exploring', priority: 5 };
      }
    } catch (error) {
      console.error('Error parsing LLM response:', error);
    }
    
    return { action: 'explore', reason: 'Default action', priority: 5 };
  }

  getFallbackDecision(situation) {
    // Simple rule-based fallback
    if (situation.phase === 'gathering_wood' && situation.inventory.wood < 4) {
      return { action: 'gather_wood', reason: 'Need more wood', priority: 8 };
    } else if (situation.phase === 'crafting_tools') {
      return { action: 'craft_tools', reason: 'Crafting phase', priority: 9 };
    } else if (situation.phase === 'mining_stone') {
      return { action: 'mine_stone', reason: 'Mining phase', priority: 7 };
    }
    return { action: 'explore', reason: 'Exploring', priority: 5 };
  }

  addToContext(situation, decision) {
    this.context.push({ situation, decision, timestamp: Date.now() });
    if (this.context.length > this.maxContextLength) {
      this.context.shift();
    }
  }

  async learnFromExperience(experience) {
    // Store experience for RL training
    const prompt = `Learn from this experience:
Action: ${experience.action}
Result: ${experience.result}
Reward: ${experience.reward}
Time: ${experience.time}

What did we learn? How can we improve?`;
    
    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false
        })
      });

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('LLM learning error:', error.message);
      return null;
    }
  }
}
