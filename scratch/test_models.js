// no requires
const keys = {
  gemini: 'AQ.Ab8RN6IXy4ZPaKVcadotimb7MAQvsbl93I2Zee8PkFSniFK_Zg',
  groq: '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',
  openrouter: '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'
};

async function testGemini() {
  console.log('\n--- Testing Gemini ---');
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keys.gemini}`);
    const data = await res.json();
    const models = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent') && m.name.includes('gemini'));
    for (const m of models) {
      console.log(`Testing Gemini model: ${m.name}`);
      const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${m.name}:generateContent?key=${keys.gemini}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "yo" }] }] })
      });
      if (testRes.ok) {
        console.log(`  ✅ Success`);
      } else {
        const err = await testRes.json();
        console.log(`  ❌ Failed: ${err.error?.message || testRes.status}`);
      }
    }
  } catch (e) {
    console.error('Gemini error:', e.message);
  }
}

async function testGroq() {
  console.log('\n--- Testing Groq ---');
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${keys.groq}` }
    });
    const data = await res.json();
    for (const m of data.data) {
      console.log(`Testing Groq model: ${m.id}`);
      const testRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keys.groq}`
        },
        body: JSON.stringify({
          model: m.id,
          messages: [{ role: 'user', content: "yo" }],
          max_tokens: 100
        })
      });
      if (testRes.ok) {
        console.log(`  ✅ Success`);
      } else {
        const err = await testRes.json();
        console.log(`  ❌ Failed: ${err.error?.message || testRes.status}`);
      }
    }
  } catch (e) {
    console.error('Groq error:', e.message);
  }
}

async function testOpenRouter() {
  console.log('\n--- Testing OpenRouter (Specific Models) ---');
  const models = [
    'poolside/laguna-xs-2.1:free',
    'poolside/laguna-s-2.1:free',
    'z-ai/glm-5.2:free',
    'minimax/minimax-m3:free'
  ];
  for (const m of models) {
    console.log(`Testing OpenRouter model: ${m}`);
    const testRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${keys.openrouter}`,
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'BYOK'
      },
      body: JSON.stringify({
        model: m,
        messages: [{ role: 'user', content: "yo" }],
        max_tokens: 4096,
        include_reasoning: true
      })
    });
    if (testRes.ok) {
      console.log(`  ✅ Success`);
    } else {
      const err = await testRes.json();
      console.log(`  ❌ Failed: ${err.error?.message || testRes.status}`);
    }
  }
}

async function run() {
  await testGemini();
  await testGroq();
  await testOpenRouter();
}

run();
