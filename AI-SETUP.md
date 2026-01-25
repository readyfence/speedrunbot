# AI Features Setup Guide

This bot now includes **LLM intelligence** and **Reinforcement Learning** capabilities!

## Features

### 1. LLM Agent (Local)
- Uses **Ollama** for local LLM inference
- No API keys needed - runs completely locally
- Provides intelligent decision-making and strategy
- Learns from context and experience

### 2. Reinforcement Learning Agent
- Uses **TensorFlow.js** for local Q-learning
- Learns optimal strategies through trial and error
- Saves and loads trained models
- Improves performance over time

## Setup Instructions

### Option 1: LLM Only (Easiest)

1. **Install Ollama:**
   ```bash
   # macOS
   brew install ollama
   # Or download from https://ollama.ai
   ```

2. **Download a model:**
   ```bash
   ollama pull llama3.2
   # Or
   ollama pull mistral
   ```

3. **Start Ollama:**
   ```bash
   ollama serve
   ```

4. **Run the AI bot:**
   ```bash
   npm run start-ai
   ```

### Option 2: Full AI (LLM + RL)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Ollama** (see Option 1)

3. **Run the bot:**
   ```bash
   npm run start-ai
   ```

The bot will automatically:
- Detect if Ollama is available (LLM features)
- Initialize TensorFlow.js (RL features)
- Use the best available AI method
- Fall back to rule-based if AI unavailable

## How It Works

### LLM Agent
- Analyzes current game state
- Makes strategic decisions
- Provides reasoning for actions
- Learns from past experiences

### RL Agent
- Builds Q-network for action selection
- Learns from rewards (progress, objectives)
- Explores vs exploits (epsilon-greedy)
- Saves learned models for future runs

### Combined Approach
1. **RL** suggests actions based on learned patterns
2. **LLM** provides strategic reasoning
3. **Rule-based** fallback ensures basic functionality
4. All three work together for optimal performance

## Model Files

RL models are saved to `./models/rl-model/`:
- Automatically saved on exit (Ctrl+C)
- Automatically loaded on startup
- Improves with each run

## Configuration

Edit `index-ai.js` to customize:
- `ollamaUrl`: Change Ollama server URL (default: localhost:11434)
- `model`: Change LLM model name
- `epsilon`: RL exploration rate
- `learningRate`: RL learning speed
- `gamma`: RL discount factor

## Troubleshooting

### "Ollama not available"
- Make sure Ollama is installed and running
- Check: `ollama list` should show models
- Bot will fall back to rule-based behavior

### "RL Agent failed to initialize"
- TensorFlow.js should install automatically
- Check Node.js version (needs v16+)
- Bot will work without RL, just slower learning

### Model not learning
- RL needs many episodes to learn
- Try running for longer sessions
- Check that rewards are being calculated
- Increase `epsilonDecay` for faster learning

## Performance Tips

1. **For faster learning:**
   - Reduce `epsilonDecay` (explore more)
   - Increase `learningRate` (learn faster)
   - Run longer training sessions

2. **For better decisions:**
   - Use larger LLM models (llama3.1 70B)
   - Train RL for more episodes
   - Combine both approaches

3. **For speed:**
   - Use smaller LLM models (llama3.2 3B)
   - Disable RL if not needed
   - Use rule-based fallback

## Next Steps

- Train the RL agent over multiple runs
- Fine-tune LLM prompts for better decisions
- Add more sophisticated reward functions
- Implement multi-agent learning

Enjoy your AI-powered Minecraft speedrun bot! 🚀
