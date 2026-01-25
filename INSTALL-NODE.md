# Installing Node.js for the AI Bot

## Quick Installation

Node.js is required to run the AI bot. Here's the fastest way to install it:

### Option 1: Official Installer (Easiest - Recommended)

1. **Download Node.js:**
   - Visit: https://nodejs.org/
   - Click "Download Node.js (LTS)" - this is the recommended version
   - The download will start automatically

2. **Install:**
   - Open the downloaded `.pkg` file
   - Follow the installation wizard
   - No admin password needed for standard installation

3. **Verify:**
   ```bash
   node --version
   npm --version
   ```

### Option 2: Using Homebrew (if you have it)

```bash
brew install node
```

### Option 3: Using nvm (Node Version Manager)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.zshrc

# Install Node.js
nvm install --lts
nvm use --lts
```

## After Installation

Once Node.js is installed:

```bash
cd /Users/Huxley/minecraft-speedrun-ai
npm install
npm start
```

## Troubleshooting

**"command not found: npm"**
- Node.js isn't installed or not in PATH
- Try restarting your terminal after installation
- Verify with: `which node` and `which npm`

**Installation says "can't be installed"**
- Check your Mac architecture: `uname -m`
- For Apple Silicon (M1/M2): Download ARM64 version
- For Intel Mac: Download x64 version

## What Gets Installed

- **Node.js**: JavaScript runtime
- **npm**: Package manager (comes with Node.js)
- Both are needed to run the AI bot
