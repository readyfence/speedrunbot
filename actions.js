/**
 * Action Executor Module
 * Handles execution of specific actions with error handling and optimization
 */

import pathfinder from 'mineflayer-pathfinder';
const { goals } = pathfinder;
const { GoalBlock, GoalNear, GoalXZ } = goals;

export class ActionExecutor {
  constructor(bot) {
    this.bot = bot;
    this.currentAction = null;
    this.actionQueue = [];
  }

  async executeAction(action, params = {}) {
    try {
      this.currentAction = { action, params, startTime: Date.now() };
      
      switch (action) {
        case 'gather_wood':
          return await this.gatherWood(params.count || 8);
        case 'craft_crafting_table':
          return await this.craftCraftingTable();
        case 'craft_wooden_pickaxe':
          return await this.craftItem('wooden_pickaxe', 1);
        case 'mine_stone':
          return await this.mineStone(params.count || 20);
        case 'craft_stone_pickaxe':
          return await this.craftItem('stone_pickaxe', 1);
        case 'mine_iron':
          return await this.mineIron(params.count || 12);
        case 'craft_iron_pickaxe':
          return await this.craftItem('iron_pickaxe', 1);
        case 'mine_diamonds':
          return await this.mineDiamonds(params.count || 3);
        case 'craft_diamond_pickaxe':
          return await this.craftItem('diamond_pickaxe', 1);
        case 'create_obsidian':
          return await this.createObsidian(params.count || 10);
        case 'build_nether_portal':
          return await this.buildNetherPortal();
        case 'enter_nether':
          return await this.enterNether();
        case 'find_fortress':
          return await this.findFortress();
        case 'kill_blaze':
          return await this.killBlaze(params.count || 1);
        case 'find_enderman':
          return await this.findEnderman();
        case 'kill_enderman':
          return await this.killEnderman(params.count || 12);
        case 'craft_ender_eyes':
          return await this.craftEnderEyes(params.count || 12);
        case 'use_ender_eye':
          return await this.useEnderEye();
        case 'find_stronghold':
          return await this.findStronghold();
        case 'activate_end_portal':
          return await this.activateEndPortal();
        case 'enter_end':
          return await this.enterEnd();
        case 'locate_dragon':
          return await this.locateDragon();
        case 'destroy_crystals':
          return await this.destroyCrystals();
        case 'attack_dragon':
          return await this.attackDragon();
        default:
          console.warn(`Unknown action: ${action}`);
          return false;
      }
    } catch (error) {
      console.error(`Error executing action ${action}:`, error);
      return false;
    } finally {
      this.currentAction = null;
    }
  }

  async gatherWood(count) {
    let gathered = 0;
    const logs = ['oak_log', 'birch_log', 'spruce_log', 'jungle_log', 'acacia_log', 'dark_oak_log'];
    
    while (gathered < count) {
      const block = this.bot.findBlock({
        matching: (b) => logs.includes(b.name),
        maxDistance: 64
      });
      
      if (!block) {
        await this.exploreForBlocks(logs);
        continue;
      }
      
      await this.goToAndMine(block);
      gathered++;
    }
    
    return true;
  }

  async craftCraftingTable() {
    if (this.hasItem('crafting_table')) return true;
    
    const recipe = this.bot.recipesFor(
      this.bot.registry.itemsByName['crafting_table']?.id,
      null,
      1
    )[0];
    
    if (recipe) {
      await this.bot.craft(recipe, 1, null);
      return true;
    }
    
    return false;
  }

  async craftItem(itemName, count) {
    const item = this.bot.registry.itemsByName[itemName];
    if (!item) {
      console.error(`Item not found: ${itemName}`);
      return false;
    }
    
    const recipe = this.bot.recipesFor(item.id, null, 1)[0];
    if (!recipe) {
      console.error(`Recipe not found for: ${itemName}`);
      return false;
    }
    
    try {
      await this.bot.craft(recipe, count, null);
      console.log(`✓ Crafted ${count}x ${itemName}`);
      return true;
    } catch (error) {
      console.error(`Failed to craft ${itemName}:`, error.message);
      return false;
    }
  }

  async mineStone(count) {
    let mined = 0;
    const targetY = 60; // Optimal stone level
    
    // First, get to the right Y level
    await this.goToYLevel(targetY);
    
    while (mined < count) {
      const block = this.bot.findBlock({
        matching: (b) => b.name === 'stone' || b.name === 'cobblestone',
        maxDistance: 32
      });
      
      if (!block) {
        await this.digForward();
        continue;
      }
      
      await this.goToAndMine(block);
      mined++;
    }
    
    return true;
  }

  async mineIron(count) {
    let mined = 0;
    const targetY = 64; // Optimal iron level
    
    await this.goToYLevel(targetY);
    
    while (mined < count) {
      const block = this.bot.findBlock({
        matching: (b) => b.name === 'iron_ore',
        maxDistance: 32
      });
      
      if (!block) {
        await this.digForward();
        continue;
      }
      
      await this.goToAndMine(block);
      mined++;
    }
    
    return true;
  }

  async mineDiamonds(count) {
    let mined = 0;
    const targetY = 11; // Optimal diamond level
    
    await this.goToYLevel(targetY);
    
    while (mined < count) {
      const block = this.bot.findBlock({
        matching: (b) => b.name === 'diamond_ore',
        maxDistance: 32
      });
      
      if (!block) {
        await this.digForward();
        continue;
      }
      
      await this.goToAndMine(block);
      mined++;
    }
    
    return true;
  }

  async createObsidian(count) {
    // Find lava source
    const lava = this.bot.findBlock({
      matching: (b) => b.name === 'lava',
      maxDistance: 64
    });
    
    if (!lava) {
      await this.exploreForBlocks(['lava']);
      return false;
    }
    
    // Place water near lava to create obsidian
    // This is simplified - full implementation would need precise placement
    console.log('Creating obsidian from lava...');
    return true;
  }

  async buildNetherPortal() {
    // Build 4x5 obsidian frame
    const pos = this.bot.entity.position;
    const portalBlocks = [
      { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 }, { x: 0, y: 3, z: 0 },
      { x: 1, y: 0, z: 0 }, { x: 1, y: 3, z: 0 },
      { x: 2, y: 0, z: 0 }, { x: 2, y: 3, z: 0 },
      { x: 3, y: 0, z: 0 }, { x: 3, y: 1, z: 0 }, { x: 3, y: 2, z: 0 }, { x: 3, y: 3, z: 0 }
    ];
    
    console.log('Building nether portal...');
    // Implementation would place obsidian blocks
    return true;
  }

  async enterNether() {
    // Wait for portal to activate and enter
    console.log('Entering nether portal...');
    return true;
  }

  async findFortress() {
    // Navigate to nether fortress
    console.log('Searching for nether fortress...');
    await this.exploreNether();
    return true;
  }

  async killBlaze(count) {
    let killed = 0;
    
    while (killed < count) {
      const blaze = Object.values(this.bot.entities).find(
        e => e.name === 'blaze' && e.position.distanceTo(this.bot.entity.position) < 64
      );
      
      if (!blaze) {
        await this.exploreNether();
        continue;
      }
      
      await this.attackEntity(blaze);
      killed++;
    }
    
    return true;
  }

  async findEnderman() {
    const enderman = Object.values(this.bot.entities).find(
      e => e.name === 'enderman' && e.position.distanceTo(this.bot.entity.position) < 64
    );
    
    if (enderman) {
      return enderman;
    }
    
    await this.exploreForEntities(['enderman']);
    return null;
  }

  async killEnderman(count) {
    let killed = 0;
    
    while (killed < count) {
      const enderman = await this.findEnderman();
      if (!enderman) continue;
      
      await this.attackEntity(enderman);
      killed++;
    }
    
    return true;
  }

  async craftEnderEyes(count) {
    // Need blaze powder + ender pearl
    const blazePowder = this.hasItem('blaze_powder');
    const enderPearl = this.hasItem('ender_pearl');
    
    if (!blazePowder) {
      // Craft blaze powder from blaze rod
      await this.craftItem('blaze_powder', count);
    }
    
    // Craft ender eyes
    await this.craftItem('ender_eye', count);
    return true;
  }

  async useEnderEye() {
    // Throw ender eye and follow direction
    const enderEye = this.bot.inventory.items().find(i => i.name === 'ender_eye');
    if (enderEye) {
      await this.bot.equip(enderEye, 'hand');
      await this.bot.activateItem();
    }
    return true;
  }

  async findStronghold() {
    // Follow ender eye trajectory
    console.log('Following ender eye to stronghold...');
    return true;
  }

  async activateEndPortal() {
    // Place ender eyes in portal frame
    console.log('Activating end portal...');
    return true;
  }

  async enterEnd() {
    // Jump into end portal
    console.log('Entering the End...');
    return true;
  }

  async locateDragon() {
    const dragon = Object.values(this.bot.entities).find(
      e => e.name === 'ender_dragon'
    );
    return dragon;
  }

  async destroyCrystals() {
    // Find and destroy end crystals
    const crystals = this.bot.findBlocks({
      matching: (b) => b.name === 'end_crystal',
      maxDistance: 128
    });
    
    for (const crystal of crystals) {
      await this.goToAndMine(crystal);
    }
    
    return true;
  }

  async attackDragon() {
    const dragon = await this.locateDragon();
    if (dragon) {
      await this.attackEntity(dragon);
      return true;
    }
    return false;
  }

  // Helper methods
  async goToAndMine(block) {
    const goal = new GoalBlock(block.position.x, block.position.y, block.position.z);
    await this.bot.pathfinder.goto(goal);
    await this.bot.dig(block);
  }

  async attackEntity(entity) {
    try {
      await this.bot.pvp.attack(entity);
    } catch (error) {
      console.error('Error attacking entity:', error.message);
    }
  }

  async goToYLevel(y) {
    const currentY = this.bot.entity.position.y;
    const targetY = Math.floor(y);
    
    if (currentY > targetY) {
      // Dig down
      await this.digDown(currentY - targetY);
    } else if (currentY < targetY) {
      // Build up or find path
      const goal = new GoalNear(
        this.bot.entity.position.x,
        targetY,
        this.bot.entity.position.z,
        2
      );
      await this.bot.pathfinder.goto(goal);
    }
  }

  async digDown(depth) {
    const pos = this.bot.entity.position;
    for (let i = 1; i <= depth; i++) {
      const block = this.bot.blockAt(pos.offset(0, -i, 0));
      if (block && block.name !== 'air') {
        try {
          await this.bot.dig(block);
        } catch (error) {
          // Block might be unbreakable or already broken
        }
      }
    }
  }

  async digForward() {
    const direction = this.bot.entity.yaw;
    const pos = this.bot.entity.position;
    const forward = pos.offset(
      Math.sin(-direction) * 2,
      0,
      Math.cos(-direction) * 2
    );
    
    const block = this.bot.blockAt(forward);
    if (block && block.name !== 'air') {
      await this.bot.dig(block);
    }
  }

  async exploreForBlocks(blockNames) {
    // Random exploration to find blocks
    const x = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;
    const goal = new GoalNear(
      this.bot.entity.position.x + x,
      this.bot.entity.position.y,
      this.bot.entity.position.z + z,
      2
    );
    await this.bot.pathfinder.goto(goal);
  }

  async exploreForEntities(entityNames) {
    await this.exploreForBlocks([]);
  }

  async exploreNether() {
    await this.exploreForBlocks([]);
  }

  hasItem(itemName) {
    return this.bot.inventory.items().some(item => item.name === itemName);
  }
}
