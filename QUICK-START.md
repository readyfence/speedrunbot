# Quick Start Guide - Run Server & Bot

## 🚀 Fastest Way to Get Everything Running

### Step 1: Start Minecraft Server

Open **Terminal 1** and run:

```bash
cd /Users/Huxley/minecraft-server
./start-server.sh
```

**Wait for:** You'll see "Done" in the logs when the server is ready (takes ~30-60 seconds on first start).

**Keep this terminal open!** The server needs to keep running.

### Step 2: Start the Bot

Open **Terminal 2** (new terminal window) and run:

```bash
cd /Users/Huxley/minecraft-speedrun-ai
npm run start-simple
```

**Or for AI-enhanced version:**
```bash
npm run start-ai
```

The bot will automatically connect to `localhost:25565`.

## ✅ What You Should See

### Server Terminal:
```
[INFO] Starting minecraft server version 1.20.4
[INFO] Starting Minecraft server on localhost:25565
[INFO] Done (XX.XXXs)! For help, type "help"
```

### Bot Terminal:
```
🤖 Minecraft Speedrun AI Bot
Connecting to server...
✅ Bot spawned! Starting actions...
🚀 Main loop started!
🌳 Looking for trees...
```

## 🎮 Verify It's Working

1. **In Minecraft client:** Connect to `localhost:25565` (version 1.20.4)
2. **You should see:** "SpeedrunBot" in the player list
3. **Watch the bot:** It should start moving and gathering resources

## 🛑 Stopping Everything

### Stop the Bot:
- Press `Ctrl+C` in the bot terminal

### Stop the Server:
- Press `Ctrl+C` in the server terminal
- Or type `stop` in the server console

## 📝 Troubleshooting

### "Connection refused"
- Make sure the server is running first
- Check server logs for errors
- Verify server is on port 25565

### "Bot not moving"
- Check bot terminal for errors
- Make sure server allows bots
- Verify bot spawned successfully

### "Port already in use"
- Another server might be running
- Kill it: `lsof -ti:25565 | xargs kill`
- Or change port in `server.properties`

### "Java not found"
- Server script should auto-detect Java
- If not, check: `/Library/Java/JavaVirtualMachines/`

## 🎯 Different Bot Versions

### Simple Bot (Recommended for testing):
```bash
npm run start-simple
```
- Basic automation
- No AI features needed
- Fastest to start

### AI-Enhanced Bot:
```bash
npm run start-ai
```
- Requires Ollama (optional)
- Uses LLM + Reinforcement Learning
- More intelligent decisions

### Original Bot:
```bash
npm start
```
- Full-featured version
- More complex logic

## 💡 Pro Tips

1. **Run server in background:**
   ```bash
   cd /Users/Huxley/minecraft-server
   nohup ./start-server.sh > server.log 2>&1 &
   ```

2. **View server logs:**
   ```bash
   tail -f /Users/Huxley/minecraft-server/logs/latest.log
   ```

3. **Check if server is running:**
   ```bash
   lsof -i :25565
   ```

4. **Multiple bots:**
   - Just run `npm run start-simple` in multiple terminals
   - Each will connect as a different bot

## 🎉 You're Ready!

Once both are running, the bot will:
- Connect automatically
- Start gathering resources
- Follow the speedrun strategy
- Attempt to beat the game in <15 minutes!

Enjoy watching your AI bot play Minecraft! 🚀
