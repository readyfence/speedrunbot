# Ollama Status

## ✅ What's Working

- ✅ Homebrew installed (5.0.11)
- ✅ Ollama installed (0.15.0)
- ✅ Ollama server running on http://127.0.0.1:11434

## ⚠️ What's Missing

- ⚠️ No models downloaded yet

## Next Steps

### Download a Model

Since `ollama serve` is running in one terminal, open a **new terminal window** and run:

```bash
ollama pull llama3.2
```

This will download the Llama 3.2 model (about 2GB). It may take a few minutes.

### Alternative Models

If you want a smaller/faster model:
```bash
ollama pull mistral      # Smaller, faster
ollama pull llama3.2:1b   # Very small (1B parameters)
```

### Verify It Works

After downloading, test with:
```bash
ollama run llama3.2 "Hello, how are you?"
```

Or use the test script:
```bash
cd /Users/Huxley/minecraft-speedrun-ai
node test-ollama.js
```

## Running the AI Bot

Once the model is downloaded:

1. **Keep Ollama server running** (in one terminal):
   ```bash
   ollama serve
   ```

2. **Run the AI bot** (in another terminal):
   ```bash
   cd /Users/Huxley/minecraft-speedrun-ai
   npm run start-ai
   ```

The bot will automatically detect Ollama and use LLM features!

## Background Service (Optional)

Instead of running `ollama serve` manually, you can run it as a background service:

```bash
brew services start ollama
```

Then Ollama will start automatically on login.
