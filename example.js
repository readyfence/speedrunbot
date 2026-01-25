/**
 * Example usage of the Minecraft Speedrun AI
 * This demonstrates how to use the modular components
 */

import { SpeedrunStrategy } from './strategy.js';
import { ActionExecutor } from './actions.js';
import mineflayer from 'mineflayer';
import pathfinder from 'mineflayer-pathfinder';
import pvp from 'mineflayer-pvp';

const { Movements } = pathfinder;

// Example: Using the modular components
async function runSpeedrun(host = 'localhost', port = 25565, username = 'SpeedrunBot') {
  console.log('Creating bot...');
  
  const bot = mineflayer.createBot({
    host,
    port,
    username,
    version: '1.20.4' // Match server version
  });

  // Load plugins
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(pvp);

  // Set up pathfinder
  const defaultMove = new Movements(bot);
  defaultMove.canDig = true;
  bot.pathfinder.setMovements(defaultMove);

  // Initialize strategy and actions
  const strategy = new SpeedrunStrategy(bot);
  const executor = new ActionExecutor(bot);

  const startTime = Date.now();
  const goalTime = 15 * 60 * 1000; // 15 minutes

  bot.once('spawn', async () => {
    console.log('Bot spawned! Starting speedrun...');
    
    while (Date.now() - startTime < goalTime) {
      const elapsedTime = Date.now() - startTime;
      const currentPhase = strategy.getCurrentPhase(elapsedTime);
      const nextTask = strategy.getNextTask(currentPhase);
      
      if (nextTask) {
        console.log(`[Phase: ${currentPhase}] Executing: ${nextTask.action}`);
        await executor.executeAction(nextTask.action, nextTask);
        
        // Small delay to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        console.log('All tasks completed!');
        break;
      }
    }
    
    const elapsed = (Date.now() - startTime) / 1000 / 60;
    console.log(`\nSpeedrun completed in ${elapsed.toFixed(2)} minutes`);
  });

  bot.on('error', (err) => {
    console.error('Bot error:', err);
  });
}

// Run if executed directly
const args = process.argv.slice(2);
if (args.length > 0 || process.argv[1].endsWith('example.js')) {
  runSpeedrun(args[0], parseInt(args[1]) || 25565, args[2] || 'SpeedrunBot')
    .catch(console.error);
}

export { runSpeedrun };
