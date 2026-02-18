import mineflayer from 'mineflayer';
import pathfinderPlugin from 'mineflayer-pathfinder';
import * as pvpModule from 'mineflayer-pvp';
import { Vec3 } from 'vec3';

// Simple working bot that actually does things
const bot = mineflayer.createBot({
  host: process.argv[2] || 'localhost',
  port: parseInt(process.argv[3]) || 25565,
  username: process.argv[4] || 'SpeedrunBot',
  version: '1.20.4'
});

// Load plugins - pathfinder.pathfinder is the actual plugin function
// When using default import, pathfinder is an object with .pathfinder property
// Load plugins
bot.loadPlugin(pathfinderPlugin.pathfinder);
// PvP plugin is at pvpModule.plugin
if (pvpModule.plugin && typeof pvpModule.plugin === 'function') {
  bot.loadPlugin(pvpModule.plugin);
} else {
  console.warn('PvP plugin not found, continuing without it...');
}

// Import pathfinder utilities
const { Movements, goals } = pathfinderPlugin;
const { GoalBlock, GoalNear } = goals;

let woodCount = 0;
let phase = 'gathering_wood';
let startTime = null;
let lastLocationReport = 0;
const LOCATION_REPORT_INTERVAL = 10000; // Report location every 10 seconds

bot.once('spawn', () => {
  console.log('✅ Bot spawned! Starting actions...');
  console.log(`Position: ${bot.entity.position}`);
  startTime = Date.now();
  
  // Configure pathfinder after bot is ready
  const defaultMove = new Movements(bot);
  defaultMove.canDig = true;
  defaultMove.allow1by1towers = true;
  defaultMove.allowParkour = true;
  defaultMove.allowSprinting = true;
  bot.pathfinder.setMovements(defaultMove);
  console.log('✅ Pathfinder configured');
  
  // Test basic movement first
  testBasicMovement();
  
  // Start the main loop after a short delay
  setTimeout(() => {
    startMainLoop();
  }, 2000);
});

function testBasicMovement() {
  console.log('🧪 Testing basic movement...');
  
  // Try to move forward for 2 seconds
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  
  setTimeout(() => {
    bot.setControlState('forward', false);
    bot.setControlState('jump', false);
    console.log('✅ Basic movement test complete');
  }, 2000);
}

bot.on('chat', async (username, message) => {
  if (username === bot.username) return;
  console.log(`[CHAT] ${username}: ${message}`);
  
  // Check if message is a command for the bot
  if (message.startsWith('!bot ') || message.startsWith('bot ')) {
    const command = message.replace(/^(!bot |bot )/, '').toLowerCase().trim();
    await handleCommand(command, username);
  }
});

// Command handler
async function handleCommand(command, username) {
  console.log(`📝 Command from ${username}: ${command}`);
  
  const parts = command.split(' ');
  const cmd = parts[0];
  const args = parts.slice(1);
  
  switch (cmd) {
    case 'help':
    case 'commands':
      bot.chat('Commands: !bot status, !bot goto <x> <y> <z>, !bot phase, !bot stop, !bot resume, !bot inventory, !bot health, !bot fight, !bot explore');
      break;
      
    case 'status':
      const pos = bot.entity.position;
      bot.chat(`Status: Phase=${phase}, Wood=${woodCount}, Pos=(${Math.floor(pos.x)},${Math.floor(pos.y)},${Math.floor(pos.z)}), HP=${Math.floor(bot.health)}/${Math.floor(bot.maxHealth || 20)}`);
      break;
      
    case 'phase':
      bot.chat(`Current phase: ${phase}`);
      break;
      
    case 'inventory':
      const items = bot.inventory.items().filter(i => i.count > 0);
      const inv = items.map(i => `${i.name}:${i.count}`).join(', ');
      bot.chat(`Inventory: ${inv || 'Empty'}`);
      break;
      
    case 'health':
      bot.chat(`Health: ${Math.floor(bot.health)}/${Math.floor(bot.maxHealth || 20)}`);
      break;
      
    case 'goto':
      if (args.length >= 3) {
        const x = parseFloat(args[0]);
        const y = parseFloat(args[1]);
        const z = parseFloat(args[2]);
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          bot.chat(`Moving to (${x}, ${y}, ${z})...`);
          const goal = new GoalBlock(x, y, z);
          try {
            await bot.pathfinder.goto(goal);
            bot.chat(`✅ Arrived at (${x}, ${y}, ${z})`);
          } catch (error) {
            bot.chat(`❌ Could not reach (${x}, ${y}, ${z}): ${error.message}`);
          }
        } else {
          bot.chat('Usage: !bot goto <x> <y> <z>');
        }
      } else {
        bot.chat('Usage: !bot goto <x> <y> <z>');
      }
      break;
      
    case 'stop':
    case 'pause':
      bot.chat('⏸️ Bot paused. Use !bot resume to continue.');
      // Set a flag to pause (we'll need to add pause logic)
      break;
      
    case 'resume':
    case 'continue':
      bot.chat('▶️ Bot resumed.');
      break;
      
    case 'fight':
    case 'attack':
      const mob = findNearbyHostileMob();
      if (mob) {
        bot.chat(`⚔️ Fighting ${mob.name}...`);
        await fightMob(mob);
      } else {
        bot.chat('No hostile mobs nearby.');
      }
      break;
      
    case 'explore':
      bot.chat('🚶 Exploring...');
      await explore();
      break;
      
    case 'gather':
    case 'wood':
      bot.chat('🌳 Gathering wood...');
      phase = 'gathering_wood';
      break;
      
    case 'craft':
      bot.chat('🔨 Crafting tools...');
      phase = 'crafting_tools';
      break;
      
    case 'mine':
      bot.chat('⛏️ Mining...');
      phase = 'mining_stone';
      break;
      
    case 'pos':
    case 'position':
      const position = bot.entity.position;
      bot.chat(`Position: X=${Math.floor(position.x)} Y=${Math.floor(position.y)} Z=${Math.floor(position.z)}`);
      break;
      
    default:
      bot.chat(`Unknown command: ${cmd}. Type !bot help for commands.`);
  }
}

bot.on('error', (err) => {
  console.error('Bot error:', err);
});

// Combat system - fight nearby hostile mobs
bot.on('entityHurt', (entity) => {
  if (entity.type === 'player' && entity.username === bot.username) {
    console.log(`⚠️ Bot took damage! Health: ${bot.health}/${bot.maxHealth}`);
  }
});

bot.on('health', () => {
  if (bot.health < 10) {
    console.log(`⚠️ Low health! ${bot.health}/${bot.maxHealth} - Looking for safety...`);
  }
});

async function startMainLoop() {
  console.log('🚀 Main loop started!');
  
  while (true) {
    try {
      await executePhase();
      await sleep(1000); // Wait 1 second between actions
    } catch (error) {
      console.error('Error in main loop:', error);
      await sleep(2000);
    }
  }
}

async function executePhase() {
  // Check if bot has a sword - if yes, kill everything!
  const hasSword = bot.inventory.items().some(item => item.name.includes('sword'));
  
  if (hasSword) {
    // Aggressive mode: attack ALL nearby entities
    const target = findAnyNearbyEntity();
    if (target) {
      console.log(`⚔️ Sword equipped! Attacking ${target.name}...`);
      await fightMob(target);
      return; // Fight takes priority
    }
  } else {
    // Normal mode: only fight hostile mobs
    const nearbyHostile = findNearbyHostileMob();
    if (nearbyHostile) {
      console.log(`⚔️ Hostile mob detected: ${nearbyHostile.name} at distance ${Math.floor(bot.entity.position.distanceTo(nearbyHostile.position))}`);
      await fightMob(nearbyHostile);
      return; // Fight takes priority over other tasks
    }
  }
  
  // Report location periodically
  const now = Date.now();
  if (now - lastLocationReport > LOCATION_REPORT_INTERVAL) {
    const timeElapsed = Math.floor((now - (startTime || now)) / 1000);
    reportLocation(timeElapsed);
    lastLocationReport = now;
  }
  
  console.log(`\n[Phase: ${phase}] Wood: ${woodCount}`);
  
  switch (phase) {
    case 'gathering_wood':
      await gatherWood();
      break;
    case 'crafting_tools':
      await craftTools();
      break;
    case 'mining_stone':
      await mineStone();
      break;
    default:
      console.log('Unknown phase, exploring...');
      await explore();
  }
}

async function gatherWood() {
  console.log('🌳 Looking for trees...');
  
  // Try to find any type of log
  const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'jungle_log', 'acacia_log', 'dark_oak_log'];
  let tree = null;
  
  for (const logType of logTypes) {
    try {
      tree = bot.findBlock({
        matching: (block) => block && block.name === logType,
        maxDistance: 64
      });
      if (tree) {
        console.log(`Found ${logType} at ${tree.position}`);
        break;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  if (tree) {
    try {
      console.log(`Moving to tree at ${tree.position.x}, ${tree.position.y}, ${tree.position.z}`);
      const goal = new GoalBlock(tree.position.x, tree.position.y, tree.position.z);
      await bot.pathfinder.goto(goal);
      console.log('Reached tree! Mining...');
      
      await bot.dig(tree);
      woodCount++;
      console.log(`✅ Wood collected! Total: ${woodCount}`);
      
      if (woodCount >= 4) {
        console.log('Enough wood! Moving to crafting phase.');
        phase = 'crafting_tools';
      }
    } catch (error) {
      console.error(`Error with tree: ${error.message}`);
      await explore();
    }
  } else {
    console.log('No trees found nearby. Exploring...');
    await explore();
  }
}

async function craftTools() {
  console.log('🔨 Crafting tools...');
  
  // Check current inventory
  const items = bot.inventory.items();
  const hasTable = items.some(item => item.name === 'crafting_table');
  const hasPickaxe = items.some(item => item.name.includes('pickaxe'));
  
  console.log(`Inventory check - Table: ${hasTable}, Pickaxe: ${hasPickaxe}`);
  
  // If we already have both, move on
  if (hasTable && hasPickaxe) {
    console.log('✅ Already have crafting table and pickaxe! Moving to mining phase.');
    phase = 'mining_stone';
    return;
  }
  
  // Craft crafting table if needed
  if (!hasTable) {
    console.log('Crafting crafting table...');
    try {
      // Crafting table recipe: 4 planks in 2x2 grid
      // First, we need planks from logs
      const logs = bot.inventory.items().filter(item => item.name.includes('log'));
      if (logs.length === 0) {
        console.log('No logs available for crafting table! Need to gather wood.');
        phase = 'gathering_wood';
        return;
      }
      
      // Check if we have planks
      const planks = bot.inventory.items().filter(item => item.name.includes('planks'));
      if (planks.length === 0 || planks.reduce((sum, i) => sum + i.count, 0) < 4) {
        console.log('Converting logs to planks first...');
        // Craft planks from logs (1 log = 4 planks)
        const logItem = logs[0];
        const logType = logItem.name.replace('_log', '');
        const plankName = `${logType}_planks`;
        
        try {
          const plankItem = bot.registry.itemsByName[plankName];
          if (plankItem) {
            const plankRecipes = bot.recipesFor(plankItem.id, null, 1);
            if (plankRecipes && plankRecipes.length > 0) {
              await bot.craft(plankRecipes[0], 4, null);
              console.log('✅ Planks crafted!');
              await sleep(500);
            }
          }
        } catch (error) {
          console.error(`Error crafting planks: ${error.message}`);
        }
      }
      
      // Now craft crafting table
      const tableItem = bot.registry.itemsByName['crafting_table'];
      if (!tableItem) {
        console.error('Crafting table not found in registry!');
        return;
      }
      
      const tableRecipes = bot.recipesFor(tableItem.id, null, 1);
      if (tableRecipes && tableRecipes.length > 0) {
        const tableRecipe = tableRecipes[0];
        console.log('Found recipe, attempting to craft crafting table...');
        await bot.craft(tableRecipe, 1, null);
        console.log('✅ Crafting table crafted!');
        await sleep(500);
      } else {
        // Manual crafting: place 4 planks in 2x2 pattern
        console.log('Trying alternative crafting method...');
        // The bot.craft should work, but if not, we'll skip for now
        console.warn('Could not find recipe, but continuing...');
      }
    } catch (error) {
      console.error(`Crafting table error: ${error.message}`);
      console.error('Stack:', error.stack);
      // Don't return - try to continue
    }
  }
  
  // Check again after crafting table
  const itemsAfterTable = bot.inventory.items();
  const hasTableNow = itemsAfterTable.some(item => item.name === 'crafting_table');
  const hasPickaxeNow = itemsAfterTable.some(item => item.name.includes('pickaxe'));
  
  // Craft pickaxe if needed
  if (!hasPickaxeNow) {
    console.log('Crafting wooden pickaxe...');
    
    // First, place the crafting table if we have one
    if (hasTableNow) {
      console.log('Placing crafting table...');
      try {
        const tableItem = itemsAfterTable.find(item => item.name === 'crafting_table');
        if (tableItem) {
          const pos = bot.entity.position;
          const placePos = pos.offset(1, 0, 0);
          const blockAt = bot.blockAt(placePos);
          
          if (blockAt && blockAt.name === 'air') {
            await bot.equip(tableItem, 'hand');
            await bot.placeBlock(blockAt, new Vec3(1, 0, 0));
            console.log('✅ Crafting table placed!');
            await sleep(1000);
          }
        }
      } catch (error) {
        console.error(`Error placing table: ${error.message}`);
      }
    }
    
    try {
      // Check materials
      const currentItems = bot.inventory.items();
      const planks = currentItems.filter(item => item.name.includes('planks'));
      const sticks = currentItems.filter(item => item.name === 'stick');
      const totalPlanks = planks.reduce((sum, i) => sum + i.count, 0);
      const totalSticks = sticks.reduce((sum, i) => sum + i.count, 0);
      
      console.log(`Materials check: ${totalPlanks} planks, ${totalSticks} sticks (need 3 planks, 2 sticks)`);
      
      // Craft planks if needed
      if (totalPlanks < 3) {
        console.log('Crafting planks from logs...');
        const logs = currentItems.filter(item => item.name.includes('log'));
        if (logs.length > 0) {
          const logItem = logs[0];
          const logType = logItem.name.replace('_log', '');
          const plankName = `${logType}_planks`;
          
          try {
            const plankItem = bot.registry.itemsByName[plankName];
            if (plankItem) {
              const plankRecipes = bot.recipesFor(plankItem.id, null, 1);
              if (plankRecipes && plankRecipes.length > 0) {
                await bot.craft(plankRecipes[0], 4, null);
                console.log('✅ Planks crafted!');
                await sleep(1000);
              }
            }
          } catch (error) {
            console.error(`Error crafting planks: ${error.message}`);
          }
        } else {
          console.log('No logs! Going back to gather wood.');
          phase = 'gathering_wood';
          return;
        }
      }
      
      // Craft sticks if needed
      if (totalSticks < 2) {
        console.log('Crafting sticks...');
        try {
          const stickItem = bot.registry.itemsByName['stick'];
          if (stickItem) {
            const stickRecipes = bot.recipesFor(stickItem.id, null, 1);
            if (stickRecipes && stickRecipes.length > 0) {
              await bot.craft(stickRecipes[0], 2, null);
              console.log('✅ Sticks crafted!');
              await sleep(1000);
            }
          }
        } catch (error) {
          console.error(`Error crafting sticks: ${error.message}`);
        }
      }
      
      // Final check before crafting pickaxe
      const finalItems = bot.inventory.items();
      const finalPlanks = finalItems.filter(item => item.name.includes('planks')).reduce((sum, i) => sum + i.count, 0);
      const finalSticks = finalItems.filter(item => item.name === 'stick').reduce((sum, i) => sum + i.count, 0);
      
      if (finalPlanks >= 3 && finalSticks >= 2) {
        console.log('All materials ready! Crafting pickaxe...');
        const pickaxeItem = bot.registry.itemsByName['wooden_pickaxe'];
        if (pickaxeItem) {
          const pickaxeRecipes = bot.recipesFor(pickaxeItem.id, null, 1);
          if (pickaxeRecipes && pickaxeRecipes.length > 0) {
            await bot.craft(pickaxeRecipes[0], 1, null);
            console.log('✅ Wooden pickaxe crafted!');
            await sleep(1000);
            
            // Verify
            const hasPickaxe = bot.inventory.items().some(item => item.name.includes('pickaxe'));
            if (hasPickaxe) {
              phase = 'mining_stone';
            } else {
              console.log('Pickaxe crafting may have failed, but continuing...');
              phase = 'mining_stone'; // Try to continue anyway
            }
          } else {
            console.error('No recipe found! Trying to continue without pickaxe...');
            phase = 'mining_stone'; // Continue anyway
          }
        } else {
          console.error('Pickaxe item not in registry! Continuing...');
          phase = 'mining_stone';
        }
      } else {
        console.log(`Still need: ${Math.max(0, 3 - finalPlanks)} planks, ${Math.max(0, 2 - finalSticks)} sticks`);
        // Don't return - keep trying
      }
    } catch (error) {
      console.error(`Crafting error: ${error.message}`);
      // Continue anyway
      phase = 'mining_stone';
    }
  } else {
    console.log('✅ Already have pickaxe! Moving to mining phase.');
    phase = 'mining_stone';
  }
}

async function mineStone() {
  console.log('⛏️ Looking for stone...');
  
  try {
    const stone = bot.findBlock({
      matching: (block) => block && (block.name === 'stone' || block.name === 'cobblestone'),
      maxDistance: 32
    });
    
    if (stone) {
      console.log(`Found stone at ${stone.position}`);
      const goal = new GoalBlock(stone.position.x, stone.position.y, stone.position.z);
      await bot.pathfinder.goto(goal);
      await bot.dig(stone);
      console.log('✅ Stone mined!');
    } else {
      console.log('No stone found. Digging down...');
      await digDown();
    }
  } catch (error) {
    console.error(`Mining error: ${error.message}`);
    await explore();
  }
}

async function explore() {
  console.log('🚶 Exploring...');
  const pos = bot.entity.position;
  const x = pos.x + (Math.random() - 0.5) * 20;
  const z = pos.z + (Math.random() - 0.5) * 20;
  const goal = new GoalNear(x, pos.y, z, 2);
  
  try {
    await bot.pathfinder.goto(goal);
    console.log('Moved to new location');
  } catch (error) {
    console.error(`Exploration error: ${error.message}`);
  }
}

async function digDown() {
  console.log('⛏️ Digging down...');
  const pos = bot.entity.position;
  const blockBelow = bot.blockAt(pos.offset(0, -1, 0));
  
  if (blockBelow && blockBelow.name !== 'air') {
    try {
      await bot.dig(blockBelow);
      console.log('Dug down one block');
    } catch (error) {
      console.error(`Digging error: ${error.message}`);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function findNearbyHostileMob() {
  const hostileTypes = [
    'zombie', 'skeleton', 'spider', 'creeper', 'enderman',
    'witch', 'slime', 'zombie_pigman', 'blaze', 'ghast',
    'magma_cube', 'endermite', 'silverfish', 'cave_spider',
    'husk', 'stray', 'drowned', 'phantom', 'pillager',
    'vindicator', 'evoker', 'vex', 'village', 'ravager'
  ];
  
  const botPos = bot.entity.position;
  let closestHostile = null;
  let closestDistance = 16; // Only fight mobs within 16 blocks
  
  for (const entity of Object.values(bot.entities)) {
    if (!entity || !entity.position) continue;
    
    const distance = botPos.distanceTo(entity.position);
    
    // Check if it's a hostile mob
    if (hostileTypes.some(type => entity.name && entity.name.includes(type))) {
      // Make sure it's not dead
      if (entity.health > 0 && distance < closestDistance) {
        closestHostile = entity;
        closestDistance = distance;
      }
    }
  }
  
  return closestHostile;
}

function findAnyNearbyEntity() {
  // Find ANY nearby entity to attack (when bot has sword)
  const botPos = bot.entity.position;
  let closestEntity = null;
  let closestDistance = 20; // Attack range when aggressive
  
  for (const entity of Object.values(bot.entities)) {
    if (!entity || !entity.position) continue;
    
    // Skip self
    if (entity.id === bot.entity.id) continue;
    
    // Skip players (optional - comment out if you want to attack players too)
    if (entity.type === 'player') continue;
    
    const distance = botPos.distanceTo(entity.position);
    
    // Attack any living entity within range
    if (entity.health > 0 && distance < closestDistance) {
      closestEntity = entity;
      closestDistance = distance;
    }
  }
  
  return closestEntity;
}

async function fightMob(mob) {
  try {
    console.log(`⚔️ Fighting ${mob.name}...`);
    
    // Equip best weapon if available
    const weapons = bot.inventory.items().filter(item => 
      item.name.includes('sword') || 
      item.name.includes('axe') || 
      item.name.includes('pickaxe')
    );
    
    if (weapons.length > 0) {
      // Prefer sword, then axe, then pickaxe
      const sword = weapons.find(w => w.name.includes('sword'));
      const axe = weapons.find(w => w.name.includes('axe') && !w.name.includes('pickaxe'));
      const weapon = sword || axe || weapons[0];
      
      if (weapon) {
        await bot.equip(weapon, 'hand');
        console.log(`Equipped ${weapon.name}`);
      }
    }
    
    // Move closer if needed
    const distance = bot.entity.position.distanceTo(mob.position);
    if (distance > 3) {
      const goal = new GoalNear(mob.position.x, mob.position.y, mob.position.z, 2);
      await bot.pathfinder.goto(goal);
    }
    
    // Attack the mob
    try {
      // Try using PvP plugin if available
      if (bot.pvp) {
        await bot.pvp.attack(mob);
        console.log('Using PvP plugin to attack');
      } else {
        // Manual attack
        await bot.attack(mob);
        console.log('Manual attack');
      }
      
      // Keep attacking until mob is dead or out of range
      let attackCount = 0;
      const maxAttacks = 20;
      
      while (mob.isValid && mob.health > 0 && attackCount < maxAttacks) {
        const distance = bot.entity.position.distanceTo(mob.position);
        
        if (distance > 5) {
          // Too far, move closer
          const goal = new GoalNear(mob.position.x, mob.position.y, mob.position.z, 2);
          await bot.pathfinder.goto(goal);
        }
        
        if (bot.pvp) {
          await bot.pvp.attack(mob);
        } else {
          await bot.attack(mob);
        }
        
        await sleep(600); // Attack cooldown (slightly longer for safety)
        attackCount++;
        
        // Check if we're taking too much damage
        if (bot.health < 5 && attackCount > 5) {
          console.log('Taking too much damage! Retreating...');
          break;
        }
      }
      
      if (!mob.isValid || mob.health <= 0) {
        console.log(`✅ Defeated ${mob.name}!`);
      }
    } catch (error) {
      console.error(`Attack error: ${error.message}`);
      // If combat fails, try to escape if low health
      if (bot.health < 5) {
        console.log('Low health! Retreating...');
        await explore(); // Move away
      }
    }
    
    if (!mob.isValid || mob.health <= 0) {
      console.log(`✅ Defeated ${mob.name}!`);
    }
  } catch (error) {
    console.error(`Combat error: ${error.message}`);
    // If combat fails, try to escape
    if (bot.health < 5) {
      console.log('Low health! Retreating...');
      await explore(); // Move away
    }
  }
}

function reportLocation(timeElapsed) {
  const pos = bot.entity.position;
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  
  // Send to chat so it's visible in-game
  const message = `[${minutes}m ${seconds}s] Bot at X:${Math.floor(pos.x)} Y:${Math.floor(pos.y)} Z:${Math.floor(pos.z)} | Phase: ${phase} | Wood: ${woodCount} | HP: ${bot.health}/${bot.maxHealth}`;
  bot.chat(message);
  console.log(`📍 ${message}`);
  
  // Also log inventory summary
  const items = bot.inventory.items();
  const inventorySummary = items
    .filter(item => item.count > 0)
    .map(item => `${item.name}:${item.count}`)
    .join(', ');
  if (inventorySummary) {
    console.log(`   Inventory: ${inventorySummary}`);
  }
}

console.log('🤖 Minecraft Speedrun AI Bot');
console.log('Connecting to server...');
