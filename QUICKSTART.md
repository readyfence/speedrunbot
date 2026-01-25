# Quick Start Guide

## Prerequisites Checklist

- [ ] Node.js installed (v16+)
- [ ] Minecraft Java Edition server running
- [ ] Server allows bot connections

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd minecraft-speedrun-ai
npm install
```

### Step 2: Start Your Minecraft Server
Make sure your server is running and accessible. For local testing:
- Use a local server on `localhost:25565`
- Or use a server hosting service

### Step 3: Run the AI
```bash
npm start
```

Or specify a server:
```bash
node index.js your-server.com 25565 BotName
```

## Expected Behavior

1. **Bot connects** to the server
2. **Gathers resources** (wood, stone, iron, diamonds)
3. **Crafts tools** automatically
4. **Enters Nether** and finds fortress
5. **Gets Ender Pearls** from Endermen
6. **Locates Stronghold** using Ender Eyes
7. **Fights Ender Dragon**

## Monitoring Progress

Watch the console output for:
- Current phase (e.g., "Phase: gathering_wood")
- Resource counts
- Time elapsed
- Actions being executed

Example output:
```
[2.5m] Phase: mining_iron | Wood: 8 | Stone: 20 | Iron: 5 | Diamonds: 0
```

## Troubleshooting

### Bot Won't Connect
- Check server is running: `telnet localhost 25565`
- Verify firewall isn't blocking
- Check server allows bots

### Bot Stuck
- Check if bot has proper permissions
- Verify world isn't in peaceful mode (need hostile mobs)
- Check console for error messages

### Slow Performance
- Server lag affects timing
- World generation RNG can slow progress
- Some phases may take longer than expected

## Tips for Best Results

1. **Use a fast server** - Low latency is crucial
2. **Pre-generated world** - Known resource locations help
3. **Single player mode** - Less lag than multiplayer
4. **Optimal settings** - Fast movement, instant mining (if allowed)

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize strategies in `strategy.js`
- Add custom actions in `actions.js`
- Monitor and optimize based on your server

## Support

If you encounter issues:
1. Check console for error messages
2. Verify all dependencies installed: `npm list`
3. Test server connection manually
4. Review server logs for bot activity

Good luck with your speedrun! 🎮
