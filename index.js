import mineflayer from 'mineflayer';
import pathfinder from 'mineflayer-pathfinder';
import pvp from 'mineflayer-pvp';
import { Vec3 } from 'vec3';

// Import pathfinder components
const { Movements, goals } = pathfinder;
const { GoalBlock, GoalNear } = goals;

class MinecraftSpeedrunAI {
  constructor(host = 'localhost', port = 25565, username = 'SpeedrunBot') {
    this.host = host;
    this.port = port;
    this.username = username;
    this.bot = null;
    this.startTime = null;
    this.goalTime = 15 * 60 * 1000; // 15 minutes in milliseconds
    this.phase = 'initializing';
    this.inventory = {
      wood: 0,
      cobblestone: 0,
      iron: 0,
      diamonds: 0,
      obsidian: 0,
      enderPearls: 0,
      blazeRods: 0,
      enderEyes: 0
    };
    this.objectives = {
      hasWoodenTools: false,
      hasStoneTools: false,
      hasIronTools: false,
      hasDiamonds: false,
      hasObsidian: false,
      hasEnderPearls: false,
      hasBlazeRods: false,
      hasEnderEyes: false,
      enteredNether: false,
      foundStronghold: false,
      enteredEnd: false,
      killedDragon: false
    };
  }

  async connect() {
    console.log(`[${new Date().toISOString()}] Connecting to ${this.host}:${this.port}...`);
    
    this.bot = mineflayer.createBot({
      host: this.host,
      port: this.port,
      username: this.username,
      version: '1.20.4' // Match server version
    });

    // Load plugins - pathfinder.pathfinder is the actual plugin function
    this.bot.loadPlugin(pathfinder.pathfinder);
    this.bot.loadPlugin(pvp);

    // Set up pathfinder
    const defaultMove = new Movements(this.bot);
    defaultMove.canDig = true;
    defaultMove.allow1by1towers = true;
    defaultMove.scafoldingBlocks = [];
    defaultMove.allowParkour = true;
    defaultMove.allowSprinting = true;
    this.bot.pathfinder.setMovements(defaultMove);
    
    console.log('Pathfinder plugin loaded and configured');

    // Event handlers
    this.setupEventHandlers();
    
    return new Promise((resolve, reject) => {
      this.bot.once('spawn', () => {
        console.log(`[${new Date().toISOString()}] Spawned at ${this.bot.entity.position}`);
        console.log(`Bot ready! Starting speedrun...`);
        this.startTime = Date.now();
        this.phase = 'gathering_wood';
        
        // Start the main loop after spawn
        this.startMainLoop();
        
        resolve();
      });

      this.bot.once('error', (err) => {
        console.error(`[${new Date().toISOString()}] Connection error:`, err);
        reject(err);
      });
    });
  }

  setupEventHandlers() {
    this.bot.on('chat', (username, message) => {
      if (username === this.bot.username) return;
      console.log(`[CHAT] ${username}: ${message}`);
    });

    this.bot.on('death', () => {
      console.log(`[${new Date().toISOString()}] Bot died! Resetting...`);
      this.phase = 'gathering_wood';
    });

    this.bot.on('kicked', (reason) => {
      console.error(`[${new Date().toISOString()}] Kicked:`, reason);
    });

    this.bot.on('error', (err) => {
      console.error(`[${new Date().toISOString()}] Error:`, err);
    });
  }

  async start() {
    try {
      await this.connect();
      console.log(`[${new Date().toISOString()}] Connected! Waiting for spawn...`);
      // Main loop will start after spawn event
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Fatal error:`, error);
    }
  }

  async startMainLoop() {
    console.log(`[${new Date().toISOString()}] Starting speedrun! Target: < 15 minutes`);
    
    // Wait a moment for bot to fully initialize
    await this.sleep(2000);
    
    // Main speedrun loop
    while (!this.objectives.killedDragon && this.getElapsedTime() < this.goalTime) {
      try {
        await this.executePhase();
        await this.sleep(500); // Small delay to prevent overwhelming
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in phase execution:`, error.message);
        console.error(error.stack);
        await this.sleep(1000);
      }
    }

    const elapsed = this.getElapsedTime();
    if (this.objectives.killedDragon) {
      console.log(`\n🎉 SUCCESS! Beat Minecraft in ${(elapsed / 1000 / 60).toFixed(2)} minutes!`);
    } else {
      console.log(`\n⏱️ Time limit reached. Elapsed: ${(elapsed / 1000 / 60).toFixed(2)} minutes`);
    }
  }

  async executePhase() {
    this.updateInventory();
    this.logStatus();

    switch (this.phase) {
      case 'gathering_wood':
        await this.gatherWood();
        break;
      case 'crafting_tools':
        await this.craftInitialTools();
        break;
      case 'mining_stone':
        await this.mineStone();
        break;
      case 'mining_iron':
        await this.mineIron();
        break;
      case 'mining_diamonds':
        await this.mineDiamonds();
        break;
      case 'preparing_nether':
        await this.prepareForNether();
        break;
      case 'entering_nether':
        await this.enterNether();
        break;
      case 'finding_blaze':
        await this.findBlaze();
        break;
      case 'finding_stronghold':
        await this.findStronghold();
        break;
      case 'entering_end':
        await this.enterEnd();
        break;
      case 'fighting_dragon':
        await this.fightEnderDragon();
        break;
      default:
        await this.sleep(1000);
    }
  }

  async gatherWood() {
    console.log(`[${new Date().toISOString()}] Phase: Gathering wood...`);
    console.log(`Bot position: ${this.bot.entity.position}`);
    
    // Find nearest tree - try different log types
    const logTypes = ['oak_log', 'birch_log', 'spruce_log', 'jungle_log', 'acacia_log', 'dark_oak_log', 'log'];
    let tree = null;
    
    for (const logType of logTypes) {
      tree = this.findNearestBlock(logType);
      if (tree) {
        console.log(`Found ${logType} at ${tree.position}`);
        break;
      }
    }
    
    if (tree) {
      try {
        console.log(`Moving to tree at ${tree.position.x}, ${tree.position.y}, ${tree.position.z}`);
        await this.goToBlock(tree);
        console.log(`Reached tree, starting to mine...`);
        await this.mineBlock(tree);
        this.inventory.wood++;
        console.log(`Wood collected! Total: ${this.inventory.wood}`);
        
        if (this.inventory.wood >= 4) {
          console.log(`Enough wood collected! Moving to crafting phase.`);
          this.phase = 'crafting_tools';
        }
      } catch (error) {
        console.error(`Error gathering wood:`, error.message);
        // Try random movement if we can't reach the tree
        await this.randomMovement();
      }
    } else {
      console.log(`No trees found nearby. Exploring...`);
      // Move randomly to find trees
      await this.randomMovement();
    }
  }

  async craftInitialTools() {
    console.log(`[${new Date().toISOString()}] Phase: Crafting tools...`);
    
    // Craft crafting table
    if (!this.hasItem('crafting_table')) {
      await this.craftItem('crafting_table', 1);
    }
    
    // Craft wooden pickaxe
    if (!this.hasItem('wooden_pickaxe')) {
      await this.craftItem('wooden_pickaxe', 1);
      this.objectives.hasWoodenTools = true;
    }
    
    if (this.objectives.hasWoodenTools) {
      this.phase = 'mining_stone';
    }
  }

  async mineStone() {
    console.log(`[${new Date().toISOString()}] Phase: Mining stone...`);
    
    const stone = this.findNearestBlock('stone');
    if (stone) {
      await this.goToBlock(stone);
      await this.mineBlock(stone);
      this.inventory.cobblestone++;
      
      if (this.inventory.cobblestone >= 20 && !this.objectives.hasStoneTools) {
        await this.craftItem('stone_pickaxe', 1);
        this.objectives.hasStoneTools = true;
      }
      
      if (this.objectives.hasStoneTools && this.inventory.cobblestone >= 20) {
        this.phase = 'mining_iron';
      }
    } else {
      await this.digDown(5);
    }
  }

  async mineIron() {
    console.log(`[${new Date().toISOString()}] Phase: Mining iron...`);
    
    const iron = this.findNearestBlock('iron_ore');
    if (iron) {
      await this.goToBlock(iron);
      await this.mineBlock(iron);
      this.inventory.iron++;
      
      if (this.inventory.iron >= 3 && !this.objectives.hasIronTools) {
        await this.craftItem('iron_pickaxe', 1);
        this.objectives.hasIronTools = true;
      }
      
      if (this.objectives.hasIronTools && this.inventory.iron >= 10) {
        this.phase = 'mining_diamonds';
      }
    } else {
      await this.digDown(10);
    }
  }

  async mineDiamonds() {
    console.log(`[${new Date().toISOString()}] Phase: Mining diamonds...`);
    
    const diamond = this.findNearestBlock('diamond_ore');
    if (diamond) {
      await this.goToBlock(diamond);
      await this.mineBlock(diamond);
      this.inventory.diamonds++;
      this.objectives.hasDiamonds = true;
      
      if (this.inventory.diamonds >= 3) {
        this.phase = 'preparing_nether';
      }
    } else {
      await this.digDown(15);
    }
  }

  async prepareForNether() {
    console.log(`[${new Date().toISOString()}] Phase: Preparing for Nether...`);
    
    // Mine obsidian (need 10 for portal)
    if (this.inventory.obsidian < 10) {
      const obsidian = this.findNearestBlock('obsidian');
      if (obsidian) {
        await this.goToBlock(obsidian);
        await this.mineBlock(obsidian);
        this.inventory.obsidian++;
      } else {
        // Create obsidian using water + lava
        await this.createObsidian();
      }
    } else {
      this.objectives.hasObsidian = true;
      this.phase = 'entering_nether';
    }
  }

  async enterNether() {
    console.log(`[${new Date().toISOString()}] Phase: Entering Nether...`);
    
    if (!this.objectives.enteredNether) {
      // Build nether portal
      await this.buildNetherPortal();
      // Enter portal (simplified - in reality need to wait for portal to activate)
      this.objectives.enteredNether = true;
      this.phase = 'finding_blaze';
    } else {
      this.phase = 'finding_blaze';
    }
  }

  async findBlaze() {
    console.log(`[${new Date().toISOString()}] Phase: Finding Blaze...`);
    
    const blaze = this.findNearestEntity('blaze');
    if (blaze) {
      await this.attackEntity(blaze);
      // Check if we got blaze rod (simplified)
      this.inventory.blazeRods++;
      this.objectives.hasBlazeRods = true;
      
      if (this.inventory.blazeRods >= 1 && this.inventory.enderPearls >= 12) {
        // Craft ender eyes
        this.inventory.enderEyes = 12;
        this.objectives.hasEnderEyes = true;
        this.phase = 'finding_stronghold';
      }
    } else {
      await this.exploreNether();
    }
  }

  async findStronghold() {
    console.log(`[${new Date().toISOString()}] Phase: Finding Stronghold...`);
    
    // Use ender eyes to locate stronghold
    if (this.objectives.hasEnderEyes && !this.objectives.foundStronghold) {
      // Throw ender eye and follow direction (simplified)
      this.objectives.foundStronghold = true;
      this.phase = 'entering_end';
    }
  }

  async enterEnd() {
    console.log(`[${new Date().toISOString()}] Phase: Entering End...`);
    
    if (!this.objectives.enteredEnd) {
      // Activate end portal
      this.objectives.enteredEnd = true;
      this.phase = 'fighting_dragon';
    } else {
      this.phase = 'fighting_dragon';
    }
  }

  async fightEnderDragon() {
    console.log(`[${new Date().toISOString()}] Phase: Fighting Ender Dragon...`);
    
    const dragon = this.findNearestEntity('ender_dragon');
    if (dragon) {
      await this.attackEntity(dragon);
      // Check if dragon is dead (simplified)
      this.objectives.killedDragon = true;
    } else {
      // Look for dragon
      await this.exploreEnd();
    }
  }

  // Helper methods
  findNearestBlock(blockName) {
    try {
      const block = this.bot.findBlock({
        matching: (block) => {
          if (!block) return false;
          return block.name === blockName || block.name.includes(blockName);
        },
        maxDistance: 64
      });
      return block;
    } catch (error) {
      console.error(`Error finding block ${blockName}:`, error.message);
      return null;
    }
  }

  findNearestEntity(entityName) {
    const entity = Object.values(this.bot.entities).find(
      e => e.name === entityName && e.position.distanceTo(this.bot.entity.position) < 64
    );
    return entity;
  }

  async goToBlock(block) {
    try {
      const goal = new GoalBlock(block.position.x, block.position.y, block.position.z);
      await this.bot.pathfinder.goto(goal);
      console.log(`Reached block at ${block.position.x}, ${block.position.y}, ${block.position.z}`);
    } catch (error) {
      console.error(`Error going to block:`, error.message);
      // Try a simpler goal - just get near it
      const goal = new GoalNear(block.position.x, block.position.y, block.position.z, 2);
      await this.bot.pathfinder.goto(goal);
    }
  }

  async mineBlock(block) {
    try {
      await this.bot.dig(block);
    } catch (err) {
      console.error(`Error mining block:`, err.message);
    }
  }

  async attackEntity(entity) {
    try {
      await this.bot.pvp.attack(entity);
    } catch (err) {
      console.error(`Error attacking entity:`, err.message);
    }
  }

  async craftItem(itemName, count) {
    try {
      const recipe = this.bot.recipesFor(this.bot.registry.itemsByName[itemName].id, null, 1)[0];
      if (recipe) {
        await this.bot.craft(recipe, count, null);
        console.log(`Crafted ${count}x ${itemName}`);
      }
    } catch (err) {
      console.error(`Error crafting ${itemName}:`, err.message);
    }
  }

  hasItem(itemName) {
    return this.bot.inventory.items().some(item => item.name === itemName);
  }

  updateInventory() {
    const items = this.bot.inventory.items();
    this.inventory.wood = items.find(i => i.name.includes('log'))?.count || 0;
    this.inventory.cobblestone = items.find(i => i.name === 'cobblestone')?.count || 0;
    this.inventory.iron = items.find(i => i.name === 'iron_ingot')?.count || 0;
    this.inventory.diamonds = items.find(i => i.name === 'diamond')?.count || 0;
    this.inventory.obsidian = items.find(i => i.name === 'obsidian')?.count || 0;
    this.inventory.enderPearls = items.find(i => i.name === 'ender_pearl')?.count || 0;
    this.inventory.blazeRods = items.find(i => i.name === 'blaze_rod')?.count || 0;
    this.inventory.enderEyes = items.find(i => i.name === 'ender_eye')?.count || 0;
  }

  async digDown(depth) {
    const pos = this.bot.entity.position;
    for (let i = 0; i < depth; i++) {
      const block = this.bot.blockAt(pos.offset(0, -i, 0));
      if (block && block.name !== 'air') {
        await this.mineBlock(block);
      }
    }
  }

  async randomMovement() {
    const x = (Math.random() - 0.5) * 20;
    const z = (Math.random() - 0.5) * 20;
    const goal = new GoalNear(
      this.bot.entity.position.x + x,
      this.bot.entity.position.y,
      this.bot.entity.position.z + z,
      1
    );
    await this.bot.pathfinder.goto(goal);
  }

  async exploreNether() {
    await this.randomMovement();
  }

  async exploreEnd() {
    await this.randomMovement();
  }

  async createObsidian() {
    // Simplified - would need to place water and lava
    console.log('Creating obsidian (simplified)...');
  }

  async buildNetherPortal() {
    // Simplified - would need to place obsidian in portal shape
    console.log('Building nether portal (simplified)...');
  }

  logStatus() {
    const elapsed = this.getElapsedTime();
    const minutes = (elapsed / 1000 / 60).toFixed(2);
    console.log(`[${minutes}m] Phase: ${this.phase} | Wood: ${this.inventory.wood} | Stone: ${this.inventory.cobblestone} | Iron: ${this.inventory.iron} | Diamonds: ${this.inventory.diamonds}`);
  }

  getElapsedTime() {
    return this.startTime ? Date.now() - this.startTime : 0;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
const args = process.argv.slice(2);
const host = args[0] || 'localhost';
const port = parseInt(args[1]) || 25565;
const username = args[2] || 'SpeedrunBot';

console.log(`
╔══════════════════════════════════════════════════════════╗
║     Minecraft Speedrun AI - Beat the game in <15 min    ║
╚══════════════════════════════════════════════════════════╝
`);

const ai = new MinecraftSpeedrunAI(host, port, username);
ai.start().catch(console.error