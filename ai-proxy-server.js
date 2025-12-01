const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/ai-proxy', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }
  try {
    const hfResponse = await fetch('https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-Math-V2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: message }),
    });
    const data = await hfResponse.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to contact Hugging Face API.' });
  }
});

app.listen(PORT, () => {
  console.log(`AI Proxy server running on port ${PORT}`);
});
