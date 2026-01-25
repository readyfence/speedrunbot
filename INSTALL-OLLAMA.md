# Installing Ollama

## Quick Start (If You Have Homebrew)

If you have Homebrew installed:
```bash
brew install ollama
ollama pull llama3.2
ollama serve
```

**Don't have Homebrew?** See `INSTALL-HOMEBREW.md` to install it first, or use the methods below.

## Alternative Methods (Without Homebrew)

## Option 1: Direct Download (Easiest)

1. **Download Ollama:**
   - Visit: https://ollama.ai/download
   - Download the macOS installer (.dmg file)
   - Open the .dmg and drag Ollama to Applications

2. **Start Ollama:**
   - Open Applications folder
   - Double-click Ollama
   - Or run from terminal: `/Applications/Ollama.app/Contents/MacOS/Ollama`

3. **Download a model:**
   ```bash
   /Applications/Ollama.app/Contents/Resources/ollama pull llama3.2
   ```

## Option 2: Manual Installation

1. **Download binary:**
   ```bash
   curl -L https://ollama.ai/download/ollama-darwin -o /usr/local/bin/ollama
   chmod +x /usr/local/bin/ollama
   ```

2. **Start Ollama:**
   ```bash
   ollama serve
   ```

3. **In another terminal, download model:**
   ```bash
   ollama pull llama3.2
   ```

## Option 3: Install Homebrew First

If you want to use Homebrew:

1. **Install Homebrew:**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Then install Ollama:**
   ```bash
   brew install ollama
   ollama pull llama3.2
   ollama serve
   ```

## Verify Installation

After installing, test with:
```bash
ollama list
ollama run llama3.2 "Hello, how are you?"
```

## Running with the Bot

Once Ollama is installed and running:

```bash
# Terminal 1: Start Ollama server
ollama serve

# Terminal 2: Run the AI bot
cd /Users/Huxley/minecraft-speedrun-ai
npm run start-ai
```

The bot will automatically detect Ollama and use LLM features!

## Troubleshooting

**"Command not found: ollama"**
- Make sure Ollama is in your PATH
- Or use full path: `/Applications/Ollama.app/Contents/Resources/ollama`

**"Connection refused"**
- Make sure Ollama server is running
- Check: `curl http://localhost:11434/api/tags`

**"No models found"**
- Download a model: `ollama pull llama3.2`
- Or: `ollama pull mistral` (smaller, faster)
