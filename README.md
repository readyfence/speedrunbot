# Minecraft Speedrun AI

An AI agent that attempts to beat Minecraft (defeat the Ender Dragon) in under 15 minutes using automated strategies and pathfinding.

## Features

- **Automated Resource Gathering**: Efficiently collects wood, stone, iron, and diamonds
- **Smart Crafting**: Automatically crafts necessary tools and items
- **Nether Navigation**: Finds and enters the Nether, locates fortresses
- **End Game Completion**: Locates stronghold, activates end portal, and fights the Ender Dragon
- **Time Tracking**: Monitors progress against 15-minute goal
- **Pathfinding**: Uses advanced pathfinding to navigate efficiently

## Prerequisites

1. **Minecraft Java Edition Server** (1.16+ recommended)
   - You can use a local server or connect to an existing one
   - Server must allow bots/automated clients

2. **Node.js** (v16 or higher)
   ```bash
   node --version
   ```

## Installation

1. Clone or navigate to this directory:
   ```bash
   cd minecraft-speedrun-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Basic Usage

Connect to a local Minecraft server:
```bash
npm start
```

### Custom Server

Connect to a specific server:
```bash
node index.js <host> <port> <username>
```

Example:
```bash
node index.js localhost 25565 SpeedrunBot
```

### Remote Server

```bash
node index.js example.com 25565 MyBot
```

## How It Works

The AI follows a 7-phase speedrun strategy:

1. **Initial Setup (0-2 min)**: Gather wood, craft basic tools
2. **Stone Tools (2-4 min)**: Mine stone, upgrade to stone tools
3. **Iron Tools (4-6 min)**: Mine iron, craft iron pickaxe
4. **Diamonds & Nether Prep (6-9 min)**: Get diamonds, create obsidian, build portal
5. **Nether (9-11 min)**: Enter Nether, find fortress, kill Blaze, get Ender Pearls
6. **Stronghold & End (11-13 min)**: Locate stronghold, activate end portal
7. **Ender Dragon (13-15 min)**: Destroy crystals, defeat the dragon

## Strategy Details

### Resource Gathering
- Optimizes mining depth:
- **Diamonds**: Y=11 (optimal spawn level)
- **Iron**: Y=64
- **Stone**: Y=60

### Pathfinding
- Uses Mineflayer's pathfinder for efficient navigation
- Prioritizes nearest resources
- Handles obstacles and terrain

### Combat
- Automated entity detection and combat
- Prioritizes dangerous mobs (Blaze, Enderman)
- Efficient dragon crystal destruction

## Limitations & Notes

⚠️ **Important**: This is a complex automation project. Real-world performance depends on:

1. **Server Settings**: 
   - Some servers may have anti-bot protection
   - Movement speed and mining speed affect timing
   - Server lag can impact performance

2. **World Generation**:
   - RNG plays a role (finding diamonds, structures)
   - Some runs may take longer due to unlucky spawns

3. **Current Implementation**:
   - Some features are simplified (obsidian creation, portal building)
   - Full implementation would require more complex block placement logic
   - Ender eye throwing and following needs refinement

4. **Legal/Ethical**:
   - Only use on servers that allow bots
   - Respect server rules and terms of service
   - Don't use on competitive speedrun servers without permission

## Customization

### Adjust Time Limits

Edit `index.js` to change the goal time:
```javascript
this.goalTime = 15 * 60 * 1000; // Change to desired minutes
```

### Modify Strategy

Edit `strategy.js` to customize phases and priorities:
```javascript
phase1: {
  targetTime: 2 * 60 * 1000,
  tasks: [
    // Add or modify tasks
  ]
}
```

### Add Custom Actions

Extend `actions.js` with new action methods:
```javascript
async myCustomAction(params) {
  // Your implementation
}
```

## Troubleshooting

### Connection Issues
- Ensure Minecraft server is running
- Check firewall settings
- Verify server allows bot connections

### Bot Not Moving
- Check if bot has proper permissions
- Verify pathfinder plugin is loaded
- Check for obstacles blocking movement

### Crafting Fails
- Ensure bot has required materials
- Check if crafting table is accessible
- Verify recipe availability for server version

## Performance Tips

1. **Use Fast Server**: Low latency improves performance
2. **Optimal World**: Pre-generated worlds with known resources
3. **Adjust Strategy**: Modify priorities based on world conditions
4. **Monitor Progress**: Watch console output for bottlenecks

## Future Improvements

- [ ] Advanced obsidian creation with water/lava placement
- [ ] Precise nether portal building
- [ ] Ender eye trajectory following
- [ ] Stronghold detection and navigation
- [ ] Optimized dragon fight strategy
- [ ] Multi-threaded resource gathering
- [ ] Machine learning for path optimization

## License

MIT License - Feel free to modify and use as needed.

## Disclaimer

This project is for educational and research purposes. Using automated bots may violate some server terms of service. Use responsibly and ethically.

## Credits

Built with:
- [Mineflayer](https://github.com/PrismarineJS/mineflayer) - Minecraft bot framework
- [mineflayer-pathfinder](https://github.com/PrismarineJS/mineflayer-pathfinder) - Pathfinding
- [mineflayer-pvp](https://github.com/PrismarineJS/mineflayer-pvp) - Combat system

## Contributing

Contributions welcome! Areas for improvement:
- Better pathfinding algorithms
- More efficient resource gathering
- Improved combat strategies
- World generation analysis
- Performance optimizations
