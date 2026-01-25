/**
 * Reinforcement Learning Agent
 * Uses TensorFlow.js for local Q-learning
 */

import * as tf from '@tensorflow/tfjs-node';

export class RLAgent {
  constructor() {
    this.model = null;
    this.memory = [];
    this.maxMemorySize = 10000;
    this.batchSize = 32;
    this.epsilon = 1.0; // Exploration rate
    this.epsilonMin = 0.01;
    this.epsilonDecay = 0.995;
    this.learningRate = 0.001;
    this.gamma = 0.95; // Discount factor
    this.stateSize = 20; // Size of state vector
    this.actionSize = 10; // Number of possible actions
    this.training = false;
  }

  async initialize() {
    try {
      console.log('🧠 Initializing RL Agent...');
      
      // Create Q-network
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({
            inputShape: [this.stateSize],
            units: 128,
            activation: 'relu',
            name: 'dense1'
          }),
          tf.layers.dense({
            units: 128,
            activation: 'relu',
            name: 'dense2'
          }),
          tf.layers.dense({
            units: 64,
            activation: 'relu',
            name: 'dense3'
          }),
          tf.layers.dense({
            units: this.actionSize,
            activation: 'linear',
            name: 'output'
          })
        ]
      });

      this.model.compile({
        optimizer: tf.train.adam(this.learningRate),
        loss: 'meanSquaredError'
      });

      console.log('✅ RL Agent initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize RL Agent:', error.message);
      return false;
    }
  }

  getState(bot, situation) {
    // Convert bot state to feature vector
    const state = [];
    
    // Inventory features (normalized)
    state.push(situation.inventory.wood / 64);
    state.push(situation.inventory.cobblestone / 64);
    state.push(situation.inventory.iron / 64);
    state.push(situation.inventory.diamonds / 64);
    state.push(situation.inventory.obsidian / 64);
    state.push(situation.inventory.enderPearls / 64);
    state.push(situation.inventory.blazeRods / 64);
    state.push(situation.inventory.enderEyes / 64);
    
    // Objective features (binary)
    state.push(situation.objectives.hasWoodenTools ? 1 : 0);
    state.push(situation.objectives.hasStoneTools ? 1 : 0);
    state.push(situation.objectives.hasIronTools ? 1 : 0);
    state.push(situation.objectives.hasDiamonds ? 1 : 0);
    state.push(situation.objectives.enteredNether ? 1 : 0);
    state.push(situation.objectives.foundStronghold ? 1 : 0);
    state.push(situation.objectives.enteredEnd ? 1 : 0);
    state.push(situation.objectives.killedDragon ? 1 : 0);
    
    // Time feature (normalized to 0-1, 15 min = 1.0)
    state.push(Math.min(situation.timeElapsed / (15 * 60), 1.0));
    
    // Phase encoding (one-hot like)
    const phases = ['gathering_wood', 'crafting_tools', 'mining_stone', 'mining_iron', 
                    'mining_diamonds', 'preparing_nether', 'entering_nether', 'finding_blaze',
                    'finding_stronghold', 'entering_end', 'fighting_dragon'];
    const phaseIndex = phases.indexOf(situation.phase);
    state.push(phaseIndex / phases.length);
    
    // Position features (normalized, assuming world size ~1000)
    if (bot && bot.entity) {
      state.push(bot.entity.position.x / 1000);
      state.push(bot.entity.position.y / 256);
      state.push(bot.entity.position.z / 1000);
    } else {
      state.push(0, 0, 0);
    }
    
    // Pad to stateSize if needed
    while (state.length < this.stateSize) {
      state.push(0);
    }
    
    return state.slice(0, this.stateSize);
  }

  getAction(state, availableActions) {
    // Epsilon-greedy policy
    if (Math.random() < this.epsilon && !this.training) {
      // Explore: random action
      const randomIndex = Math.floor(Math.random() * availableActions.length);
      return availableActions[randomIndex];
    }
    
    // Exploit: use Q-network
    try {
      const stateTensor = tf.tensor2d([state]);
      const qValues = this.model.predict(stateTensor);
      const qArray = qValues.dataSync();
      qValues.dispose();
      stateTensor.dispose();
      
      // Map Q-values to available actions
      const actionScores = availableActions.map((action, index) => ({
        action,
        score: qArray[index] || 0
      }));
      
      // Return action with highest Q-value
      actionScores.sort((a, b) => b.score - a.score);
      return actionScores[0].action;
    } catch (error) {
      console.error('RL prediction error:', error.message);
      // Fallback to random
      return availableActions[Math.floor(Math.random() * availableActions.length)];
    }
  }

  remember(state, action, reward, nextState, done) {
    // Store experience in replay buffer
    this.memory.push({
      state: [...state],
      action: action,
      reward: reward,
      nextState: [...nextState],
      done: done
    });
    
    // Limit memory size
    if (this.memory.length > this.maxMemorySize) {
      this.memory.shift();
    }
  }

  async replay() {
    if (this.memory.length < this.batchSize) {
      return;
    }
    
    // Sample random batch
    const batch = [];
    for (let i = 0; i < this.batchSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.memory.length);
      batch.push(this.memory[randomIndex]);
    }
    
    // Prepare training data
    const states = batch.map(e => e.state);
    const nextStates = batch.map(e => e.nextState);
    const rewards = batch.map(e => e.reward);
    const dones = batch.map(e => e.done ? 1 : 0);
    
    try {
      // Get current Q-values
      const statesTensor = tf.tensor2d(states);
      const nextStatesTensor = tf.tensor2d(nextStates);
      
      const currentQ = this.model.predict(statesTensor);
      const nextQ = this.model.predict(nextStatesTensor);
      
      // Compute target Q-values
      const currentQArray = currentQ.dataSync();
      const nextQArray = nextQ.dataSync();
      
      const targets = [];
      for (let i = 0; i < batch.length; i++) {
        const target = [...currentQArray.slice(i * this.actionSize, (i + 1) * this.actionSize)];
        const actionIndex = batch[i].action;
        if (dones[i]) {
          target[actionIndex] = rewards[i];
        } else {
          target[actionIndex] = rewards[i] + this.gamma * Math.max(...nextQArray.slice(i * this.actionSize, (i + 1) * this.actionSize));
        }
        targets.push(target);
      }
      
      // Train model
      const targetsTensor = tf.tensor2d(targets);
      await this.model.fit(statesTensor, targetsTensor, {
        epochs: 1,
        verbose: 0,
        batchSize: this.batchSize
      });
      
      // Cleanup
      statesTensor.dispose();
      nextStatesTensor.dispose();
      currentQ.dispose();
      nextQ.dispose();
      targetsTensor.dispose();
      
      // Decay epsilon
      if (this.epsilon > this.epsilonMin) {
        this.epsilon *= this.epsilonDecay;
      }
    } catch (error) {
      console.error('RL training error:', error.message);
    }
  }

  calculateReward(situation, previousSituation, action) {
    let reward = -0.1; // Small negative reward for each step (encourage speed)
    
    // Progress rewards
    if (situation.inventory.wood > previousSituation.inventory.wood) {
      reward += 1.0;
    }
    if (situation.inventory.cobblestone > previousSituation.inventory.cobblestone) {
      reward += 0.5;
    }
    if (situation.inventory.iron > previousSituation.inventory.iron) {
      reward += 2.0;
    }
    if (situation.inventory.diamonds > previousSituation.inventory.diamonds) {
      reward += 10.0;
    }
    
    // Objective rewards
    if (!previousSituation.objectives.hasWoodenTools && situation.objectives.hasWoodenTools) {
      reward += 5.0;
    }
    if (!previousSituation.objectives.hasStoneTools && situation.objectives.hasStoneTools) {
      reward += 5.0;
    }
    if (!previousSituation.objectives.hasIronTools && situation.objectives.hasIronTools) {
      reward += 10.0;
    }
    if (!previousSituation.objectives.hasDiamonds && situation.objectives.hasDiamonds) {
      reward += 20.0;
    }
    if (!previousSituation.objectives.enteredNether && situation.objectives.enteredNether) {
      reward += 30.0;
    }
    if (!previousSituation.objectives.killedDragon && situation.objectives.killedDragon) {
      reward += 1000.0; // Huge reward for winning!
    }
    
    // Time penalty (encourage speed)
    const timePenalty = situation.timeElapsed / (15 * 60) * 0.1;
    reward -= timePenalty;
    
    return reward;
  }

  async saveModel(path = './models/rl-model') {
    try {
      await this.model.save(`file://${path}`);
      console.log(`✅ Model saved to ${path}`);
    } catch (error) {
      console.error('Error saving model:', error.message);
    }
  }

  async loadModel(path = './models/rl-model') {
    try {
      this.model = await tf.loadLayersModel(`file://${path}/model.json`);
      console.log(`✅ Model loaded from ${path}`);
      return true;
    } catch (error) {
      console.warn('No saved model found, using new model');
      return false;
    }
  }
}
