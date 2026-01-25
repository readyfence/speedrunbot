# Setup Instructions

## Required: Install Node.js

The code requires Node.js to run. Here are installation options:

### Option 1: Install via Official Website (Recommended)
1. Visit: https://nodejs.org/
2. Download the LTS version for macOS
3. Run the installer
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Option 2: Install via Homebrew (if you have it)
```bash
brew install node
```

### Option 3: Install via nvm (Node Version Manager)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
nvm use --lts
```

## After Installing Node.js

1. Install project dependencies:
   ```bash
   cd /Users/Huxley/minecraft-speedrun-ai
   npm install
   ```

2. **IMPORTANT**: You need a Minecraft server running to connect to!

   Options:
   - Run a local Minecraft server on `localhost:25565`
   - Use a server hosting service
   - Connect to an existing server that allows bots

3. Run the AI:
   ```bash
   npm start
   ```

   Or specify a server:
   ```bash
   node index.js your-server.com 25565 BotName
   ```

## Testing Without a Server

The code will attempt to connect to a Minecraft server. Without one running, you'll see a connection error. This is expected - the AI needs an active Minecraft server to interact with.

## Quick Test

Once Node.js is installed, you can test the setup:
```bash
cd /Users/Huxley/minecraft-speedrun-ai
npm install
node -e "console.log('Node.js is working!')"
```
