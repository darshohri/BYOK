import fs from 'fs';

const GEMINI_KEY = 'AQ.Ab8RN6JCuMzgEdu_lkd48L69tJf4CjvvLEIqbqGIzB4eqyReug';
const GROQ_KEY = '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';
const OR_KEY = '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';

const delay = ms => new Promise(res => setTimeout(res, ms));

async function retryFailed() {
  console.log('--- Retrying Failed Models ---');
  
  // 1. Retry Gemini 3.5 & 3.6 (503 High Demand)
  const geminiModels = ['gemini-3.5-flash', 'gemini-3.6-flash'];
  for (const model of geminiModels) {
    let success = false;
    for (let i = 0; i < 3; i++) {
      console.log(`[Attempt ${i+1}] Testing Gemini: ${model}...`);
      try {
        const body = {
          contents: [{ role: 'user', parts: [{ text: 'Hello!' }] }]
        };
        const mRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (mRes.ok) {
          console.log(`  -> Pass!`);
          success = true;
          break;
        }
      } catch (e) {}
      await delay(2000); // backoff
    }
    if (!success) console.log(`  -> Still failing due to high demand. (Upstream issue)`);
  }
  
  // 2. Retry Groq qwen (Fixed max_tokens)
  console.log(`\nTesting Groq: qwen/qwen3.6-27b...`);
  try {
    const body = {
      model: 'qwen/qwen3.6-27b',
      messages: [{ role: 'user', content: 'Hello!' }],
      max_tokens: 800
    };
    const mRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
      body: JSON.stringify(body)
    });
    if (mRes.ok) console.log(`  -> Pass!`);
    else console.log(`  -> Fail: ${await mRes.text()}`);
  } catch (e) {}

  // 3. Retry OpenRouter poolside (429 Rate Limit)
  const orModel = 'poolside/laguna-xs-2.1:free';
  console.log(`\nTesting OpenRouter: ${orModel}...`);
  for (let i = 0; i < 3; i++) {
    try {
      const body = { model: orModel, messages: [{ role: 'user', content: 'Hello!' }] };
      const mRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OR_KEY}` },
        body: JSON.stringify(body)
      });
      if (mRes.ok) {
        console.log(`  -> Pass!`);
        break;
      }
    } catch (e) {}
    await delay(3000);
  }
}

retryFailed().catch(console.error);
