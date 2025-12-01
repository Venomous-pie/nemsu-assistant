// check-models.cjs
require('dotenv').config();
const key = process.env.GEMINI_API_KEY;
const fetch = require('node-fetch');

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log("✅ AVAILABLE MODELS FOR YOUR KEY:");
      data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes('generateContent')) {
          console.log(`   - ${m.name.replace('models/', '')}`);
        }
      });
    } else {
      console.error("❌ No models found or error:", data);
    }
  } catch (error) {
    console.error("❌ Network error:", error);
  }
}

listModels();
