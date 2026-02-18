# Bot Commands

You can control the speedrun bot using commands in Minecraft chat!

## How to Use

Type commands in Minecraft chat. The bot will respond to commands that start with `!bot` or `bot`.

## Available Commands

### Information Commands

**`!bot status`** or **`bot status`**
- Shows current bot status (phase, position, health, wood count)

**`!bot phase`**
- Shows current phase (gathering_wood, crafting_tools, mining_stone, etc.)

**`!bot inventory`**
- Lists all items in bot's inventory

**`!bot health`**
- Shows bot's current health

**`!bot pos`** or **`!bot position`**
- Shows bot's current coordinates

### Control Commands

**`!bot goto <x> <y> <z>`**
- Makes bot move to specific coordinates
- Example: `!bot goto 100 64 200`

**`!bot explore`**
- Makes bot explore the area

**`!bot fight`** or **`!bot attack`**
- Makes bot attack nearby hostile mobs

**`!bot gather`** or **`!bot wood`**
- Forces bot to gather wood phase

**`!bot craft`**
- Forces bot to crafting phase

**`!bot mine`**
- Forces bot to mining phase

### Help

**`!bot help`** or **`!bot commands`**
- Lists all available commands

## Examples

```
!bot status
!bot goto 100 64 200
!bot inventory
!bot fight
!bot explore
```

## Notes

- Commands are case-insensitive
- Bot responds in chat so you can see the results
- Some commands may take a moment to execute
- Bot will continue its normal speedrun strategy after manual commands

## Tips

- Use `!bot status` frequently to monitor progress
- Use `!bot goto` to guide bot to specific locations
- Use `!bot fight` if you see a monster the bot missed
- Use `!bot explore` if bot seems stuck

Enjoy controlling your speedrun bot! 🎮
