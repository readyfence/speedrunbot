import mineflayer from 'mineflayer';
import pathfinderPlugin from 'mineflayer-pathfinder';
import * as pvpModule from 'mineflayer-pvp';

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

bot.once('spawn', () => {
  console.log('✅ Bot spawned! Starting actions...');
  console.log(`Position: ${bot.entity.position}`);
  
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

bot.on('chat', (username, message) => {
  if (username === bot.username) return;
  console.log(`[CHAT] ${username}: ${message}`);
});

bot.on('error', (err) => {
  console.error('Bot error:', err);
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
  const hasPickaxeNow = itemsAfterTable.some(item => item.name.includes('pickaxe'));
  
  // Craft pickaxe if needed
  if (!hasPickaxeNow) {
    console.log('Crafting wooden pickaxe...');
    try {
      const pickaxeItem = bot.registry.itemsByName['wooden_pickaxe'];
      if (!pickaxeItem) {
        console.error('Wooden pickaxe not found in registry!');
        return;
      }
      
      const pickaxeRecipes = bot.recipesFor(pickaxeItem.id, null, 1);
      if (pickaxeRecipes && pickaxeRecipes.length > 0) {
        const pickaxeRecipe = pickaxeRecipes[0];
        console.log('Found recipe, attempting to craft pickaxe...');
        await bot.craft(pickaxeRecipe, 1, null);
        console.log('✅ Wooden pickaxe crafted!');
        // Wait a moment for inventory to update
        await sleep(500);
        phase = 'mining_stone';
      } else {
        console.error('No recipe found for wooden pickaxe!');
        return;
      }
    } catch (error) {
      console.error(`Crafting pickaxe error: ${error.message}`);
      return; // Exit if crafting fails
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

console.log('🤖 Minecraft Speedrun AI Bot');
console.log('Connecting to server...');
