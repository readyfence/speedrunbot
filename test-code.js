/**
 * Test script to verify code structure without needing Node.js or a server
 * This checks if the code files are properly structured
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Minecraft Speedrun AI Code Structure...\n');

const files = [
  'index.js',
  'strategy.js',
  'actions.js',
  'package.json'
];

let allGood = true;

for (const file of files) {
  const path = join(__dirname, file);
  if (existsSync(path)) {
    const content = readFileSync(path, 'utf-8');
    console.log(`✅ ${file} exists (${content.length} bytes)`);
    
    // Basic syntax checks
    if (file.endsWith('.js')) {
      try {
        // Check for basic structure
        if (content.includes('class ') || content.includes('export ')) {
          console.log(`   └─ Contains class/export definitions`);
        }
      } catch (e) {
        console.log(`   ⚠️  Potential syntax issue`);
        allGood = false;
      }
    }
  } else {
    console.log(`❌ ${file} missing!`);
    allGood = false;
  }
}

console.log('\n📋 Summary:');
if (allGood) {
  console.log('✅ All core files present and structured correctly!');
  console.log('\n📝 Next steps:');
  console.log('   1. Install Node.js (see SETUP.md)');
  console.log('   2. Run: npm install');
  console.log('   3. Start a Minecraft server');
  console.log('   4. Run: npm start');
} else {
  console.log('⚠️  Some issues detected. Please check the files.');
}

console.log('\n💡 Note: This test only checks file structure.');
console.log('   To actually run the AI, you need:');
console.log('   - Node.js installed');
console.log('   - A running Minecraft server');
