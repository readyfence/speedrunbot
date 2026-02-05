/**
 * Quick test to verify Ollama is working
 */

async function testOllama() {
  try {
    console.log('Testing Ollama connection...');
    
    // Check if server is running
    const response = await fetch('http://localhost:11434/api/tags');
    const data = await response.json();
    
    console.log('✅ Ollama server is running!');
    console.log('Available models:', data.models?.map(m => m.name) || 'None');
    
    if (data.models && data.models.length > 0) {
      console.log('\n🧪 Testing model...');
      const testResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: data.models[0].name,
          prompt: 'Say "Hello, Ollama is working!" in one sentence.',
          stream: false
        })
      });
      
      const testData = await testResponse.json();
      console.log('✅ Model response:', testData.response);
      console.log('\n🎉 Ollama is fully working!');
    } else {
      console.log('\n⚠️  No models found. Download one with:');
      console.log('   ollama pull llama3.2');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nMake sure Ollama server is running:');
    console.log('   ollama serve');
  }
}

testOllama();
