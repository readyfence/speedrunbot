# Debugging the Bot

## Quick Test - Simple Version

Try the simplified bot that should actually work:

```bash
cd /Users/Huxley/minecraft-speedrun-ai
npm run start-simple
```

Or:
```bash
node index-simple.js localhost 25565 SpeedrunBot
```

## What Should Happen

You should see:
1. "Bot spawned! Starting actions..."
2. "Main loop started!"
3. "Looking for trees..."
4. Bot moving around
5. Bot mining blocks

## If Bot Still Does Nothing

### Check 1: Is the bot actually connected?
- Look for "Bot spawned!" message
- Check if bot appears in Minecraft server

### Check 2: Are there errors?
- Check the console output
- Look for error messages

### Check 3: Test basic movement
Add this to test if bot can move at all:

```javascript
// In the spawn event, add:
bot.setControlState('forward', true);
setTimeout(() => bot.setControlState('forward', false), 2000);
```

## Common Issues

1. **Pathfinder not working**: Bot might be stuck trying to pathfind
2. **No blocks found**: World might not have trees nearby
3. **Silent errors**: Errors might be caught but not logged

## Next Steps

If the simple version works, we can enhance it. If it doesn't, we need to debug the connection and basic movement first.
