# Installing Homebrew

Homebrew is a package manager for macOS that makes it easy to install software like Ollama.

## Why You Need It

The `brew` command wasn't found because Homebrew isn't installed on your system yet. Once installed, you'll be able to run:
```bash
brew install ollama
ollama pull llama3.2
ollama serve
```

## Installation

### Step 1: Install Homebrew

Run this command in your terminal:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**What this does:**
- Downloads the Homebrew installation script
- Installs Homebrew to `/opt/homebrew` (Apple Silicon) or `/usr/local` (Intel)
- Sets up the necessary directories and permissions

**During installation, you may be asked to:**
- Enter your password (for sudo access)
- Press Enter to continue
- Install Xcode Command Line Tools (if not already installed)

### Step 2: Add Homebrew to Your PATH

After installation, you'll see instructions like:

```bash
# For Apple Silicon Macs:
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
eval "$(/opt/homebrew/bin/brew shellenv)"

# For Intel Macs:
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc
eval "$(/usr/local/bin/brew shellenv)"
```

**Run the appropriate commands for your Mac type.**

### Step 3: Verify Installation

```bash
brew --version
```

You should see something like: `Homebrew 4.x.x`

### Step 4: Now Install Ollama

```bash
brew install ollama
ollama pull llama3.2
ollama serve
```

## Alternative: Install Ollama Without Homebrew

If you don't want to install Homebrew, you can install Ollama directly:

1. **Download from website:**
   - Visit: https://ollama.ai/download
   - Download the macOS .dmg file
   - Open and drag Ollama to Applications

2. **Or use the binary:**
   ```bash
   curl -L https://ollama.ai/download/ollama-darwin -o ~/ollama
   chmod +x ~/ollama
   ~/ollama serve
   ```

## Troubleshooting

### "Permission denied"
- Make sure you're using your admin password when prompted
- You may need to run: `sudo chown -R $(whoami) /opt/homebrew` (for Apple Silicon)

### "Command not found" after installation
- Make sure you added Homebrew to your PATH (Step 2)
- Restart your terminal or run: `source ~/.zshrc`

### "Xcode Command Line Tools needed"
- Run: `xcode-select --install`
- Wait for installation to complete
- Then retry Homebrew installation

## Why Use Homebrew?

- **Easy installation**: One command installs software
- **Automatic updates**: `brew upgrade` updates everything
- **Clean removal**: `brew uninstall` removes everything
- **Huge ecosystem**: Thousands of packages available

## After Installing Homebrew

You can install many useful tools:
```bash
brew install node          # Node.js (if not already installed)
brew install git           # Git (if not already installed)
brew install ollama        # Ollama for LLM
brew install python        # Python
# ... and many more
```

Once Homebrew is installed, you'll be able to run all those `brew` commands!
