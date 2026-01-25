/**
 * Enhanced AI Bot with LLM and Reinforcement Learning
 * Combines rule-based, LLM, and RL approaches
 */

import mineflayer from 'mineflayer';
import pathfinderPlugin from 'mineflayer-pathfinder';
import * as pvpModule from 'mineflayer-pvp';
import { LLMAgent } from './llm-agent.js';
import { RLAgent } from './rl-agent.js';

const { Movements, goals } = pathfinderPlugin;
const { GoalBlock, GoalNear } = goals;

// Enhanced bot with AI
const bot = mineflayer.createBot({
  host: process.argv[2] || 'localhost',
  port: parseInt(process.argv[3]) || 25565,
  username: process.argv[4] || 'SpeedrunBot',
  version: '1.20.4'
});

// Load plugins
bot.loadPlugin(pathfinderPlugin.pathfinder);
if (pvpModule.plugin && typeof pvpModule.plugin === 'function') {
  bot.loadPlugin(pvpModule.plugin);
}

// Initialize AI agents
const llmAgent = new LLMAgent();
const rlAgent = new RLAgent();

let woodCount = 0;
let phase = 'gathering_wood';
let startTime = null;
let previousSituation = null;
let useLLM = false;
let useRL = false;

// Game state tracking
const gameState = {
  inventory: {
    wood: 0,
    cobblestone: 0,
    iron: 0,
    diamonds: 0,
    obsidian: 0,
    enderPearls: 0,
    blazeRods: 0,
    enderEyes: 0
  },
  objectives: {
    hasWoodenTools: false,
    hasStoneTools: false,
    hasIronTools: false,
    hasDiamonds: false,
    enteredNether: false,
    foundStronghold: false,
    enteredEnd: false,
    killedDragon: false
  }
};

bot.once('spawn', async () => {
  console.log('✅ Bot spawned! Initializing AI...');
  console.log(`Position: ${bot.entity.position}`);
  
  startTime = Date.now();
  
  // Initialize AI agents
  useLLM = await llmAgent.initialize();
  useRL = await rlAgent.initialize();
  
  if (useRL) {
    // Try to load saved model
    await rlAgent.loadModel();
  }
  
  // Configure pathfinder
  const defaultMove = new Movements(bot);
  defaultMove.canDig = true;
  defaultMove.allow1by1towers = true;
  defaultMove.allowParkour = true;
  defaultMove.allowSprinting = true;
  bot.pathfinder.setMovements(defaultMove);
  console.log('✅ Pathfinder configured');
  
  // Start the main loop
  setTimeout(() => {
    startMainLoop();
  }, 2000);
});

bot.on('chat', (username, message) => {
  if (username === bot.username) return;
  console.log(`[CHAT] ${username}: ${message}`);
});

bot.on('error', (err) => {
  console.error('Bot error:', err);
});

function updateGameState() {
  const items = bot.inventory.items();
  gameState.inventory.wood = items.filter(i => i.name.includes('log')).reduce((sum, i) => sum + i.count, 0);
  gameState.inventory.cobblestone = items.filter(i => i.name === 'cobblestone').reduce((sum, i) => sum + i.count, 0);
  gameState.inventory.iron = items.filter(i => i.name === 'iron_ingot').reduce((sum, i) => sum + i.count, 0);
  gameState.inventory.diamonds = items.filter(i => i.name === 'diamond').reduce((sum, i) => sum + i.count, 0);
  gameState.inventory.obsidian = items.filter(i => i.name === 'obsidian').reduce((sum, i) => sum + i.count, 0);
  gameState.inventory.enderPearls = items.filter(i => i.name === 'ender_pearl').reduce((sum, i) => sum + i.count, 0);
  gameState.inventory.blazeRods = items.filter(i => i.name === 'blaze_rod').reduce((sum, i) => sum + i.count, 0);
  gameState.inventory.enderEyes = items.filter(i => i.name === 'ender_eye').reduce((sum, i) => sum + i.count, 0);
  
  gameState.objectives.hasWoodenTools = items.some(i => i.name === 'wooden_pickaxe');
  gameState.objectives.hasStoneTools = items.some(i => i.name === 'stone_pickaxe');
  gameState.objectives.hasIronTools = items.some(i => i.name === 'iron_pickaxe');
  gameState.objectives.hasDiamonds = gameState.inventory.diamonds > 0;
}

async function startMainLoop() {
  console.log('🚀 Main loop started!');
  console.log(`AI Features: LLM=${useLLM}, RL=${useRL}`);
  
  while (true) {
    try {
      updateGameState();
      await executePhase();
      await sleep(1000);
      
      // Train RL agent periodically
      if (useRL && previousSituation) {
        await rlAgent.replay();
      }
    } catch (error) {
      console.error('Error in main loop:', error);
      await sleep(2000);
    }
  }
}

async function executePhase() {
  const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
  const situation = {
    phase,
    position: bot.entity.position,
    inventory: { ...gameState.inventory },
    objectives: { ...gameState.objectives },
    timeElapsed
  };
  
  // Get AI decision
  let action = null;
  
  if (useRL && rlAgent.model) {
    // Use RL agent
    const state = rlAgent.getState(bot, situation);
    const availableActions = getAvailableActions();
    action = rlAgent.getAction(state, availableActions);
    console.log(`🤖 RL Action: ${action}`);
  } else if (useLLM) {
    // Use LLM agent
    const decision = await llmAgent.makeDecision(situation);
    action = decision.action;
    console.log(`🧠 LLM Action: ${action} (${decision.reason})`);
  } else {
    // Fallback to rule-based
    action = getRuleBasedAction();
  }
  
  // Execute action
  const previousState = { ...situation };
  await executeAction(action);
  
  // Update for RL learning
  if (useRL && previousSituation) {
    const currentState = rlAgent.getState(bot, situation);
    const previousStateVec = rlAgent.getState(bot, previousSituation);
    const reward = rlAgent.calculateReward(situation, previousSituation, action);
    const done = situation.objectives.killedDragon;
    
    rlAgent.remember(previousStateVec, action, reward, currentState, done);
  }
  
  previousSituation = { ...situation };
}

function getAvailableActions() {
  return [
    'gather_wood',
    'craft_tools',
    'mine_stone',
    'mine_iron',
    'mine_diamonds',
    'explore',
    'craft_item',
    'enter_nether',
    'find_blaze',
    'find_stronghold'
  ];
}

function getRuleBasedAction() {
  switch (phase) {
    case 'gathering_wood':
      return 'gather_wood';
    case 'crafting_tools':
      return 'craft_tools';
    case 'mining_stone':
      return 'mine_stone';
    default:
      return 'explore';
  }
}

async function executeAction(action) {
  switch (action) {
    case 'gather_wood':
      await gatherWood();
      break;
    case 'craft_tools':
      await craftTools();
      break;
    case 'mine_stone':
      await mineStone();
      break;
    case 'explore':
      await explore();
      break;
    default:
      console.log(`Unknown action: ${action}, exploring...`);
      await explore();
  }
}

// Action implementations (similar to index-simple.js but integrated)
async function gatherWood() {
  console.log('🌳 Looking for trees...');
  const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'jungle_log', 'acacia_log', 'dark_oak_log'];
  let tree = null;
  
  for (const logType of logTypes) {
    try {
      tree = bot.findBlock({
        matching: (block) => block && block.name === logType,
        maxDistance: 64
      });
      if (tree) break;
    } catch (e) {}
  }
  
  if (tree) {
    try {
      const goal = new GoalBlock(tree.position.x, tree.position.y, tree.position.z);
      await bot.pathfinder.goto(goal);
      await bot.dig(tree);
      woodCount++;
      console.log(`✅ Wood collected! Total: ${woodCount}`);
      
      if (woodCount >= 4) {
        phase = 'crafting_tools';
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      await explore();
    }
  } else {
    await explore();
  }
}

async function craftTools() {
  console.log('🔨 Crafting tools...');
  const items = bot.inventory.items();
  const hasTable = items.some(item => item.name === 'crafting_table');
  const hasPickaxe = items.some(item => item.name.includes('pickaxe'));
  
  if (hasTable && hasPickaxe) {
    phase = 'mining_stone';
    return;
  }
  
  if (!hasTable) {
    try {
      const tableItem = bot.registry.itemsByName['crafting_table'];
      if (tableItem) {
        const recipes = bot.recipesFor(tableItem.id, null, 1);
        if (recipes && recipes.length > 0) {
          await bot.craft(recipes[0], 1, null);
          await sleep(500);
        }
      }
    } catch (error) {
      console.error(`Crafting error: ${error.message}`);
    }
  }
  
  if (!hasPickaxe) {
    try {
      const pickaxeItem = bot.registry.itemsByName['wooden_pickaxe'];
      if (pickaxeItem) {
        const recipes = bot.recipesFor(pickaxeItem.id, null, 1);
        if (recipes && recipes.length > 0) {
          await bot.craft(recipes[0], 1, null);
          await sleep(500);
          phase = 'mining_stone';
        }
      }
    } catch (error) {
      console.error(`Crafting error: ${error.message}`);
    }
  }
}

async function mineStone() {
  console.log('⛏️ Mining stone...');
  try {
    const stone = bot.findBlock({
      matching: (block) => block && (block.name === 'stone' || block.name === 'cobblestone'),
      maxDistance: 32
    });
    
    if (stone) {
      const goal = new GoalBlock(stone.position.x, stone.position.y, stone.position.z);
      await bot.pathfinder.goto(goal);
      await bot.dig(stone);
    } else {
      await digDown();
    }
  } catch (error) {
    console.error(`Mining error: ${error.message}`);
    await explore();
  }
}

async function explore() {
  const pos = bot.entity.position;
  const x = pos.x + (Math.random() - 0.5) * 20;
  const z = pos.z + (Math.random() - 0.5) * 20;
  const goal = new GoalNear(x, pos.y, z, 2);
  
  try {
    await bot.pathfinder.goto(goal);
  } catch (error) {
    console.error(`Exploration error: ${error.message}`);
  }
}

async function digDown() {
  const pos = bot.entity.position;
  const blockBelow = bot.blockAt(pos.offset(0, -1, 0));
  
  if (blockBelow && blockBelow.name !== 'air') {
    try {
      await bot.dig(blockBelow);
    } catch (error) {
      console.error(`Digging error: ${error.message}`);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Save model on exit
process.on('SIGINT', async () => {
  console.log('\n💾 Saving RL model...');
  if (useRL) {
    await rlAgent.saveModel();
  }
  process.exit(0);
});

console.log('🤖 Enhanced AI Minecraft Speedrun Bot');
console.log('Features: LLM + Reinforcement Learning');
console.log('Connecting to server...');
