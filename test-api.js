import fs from 'fs';

const GEMINI_KEY = 'AQ.Ab8RN6JCuMzgEdu_lkd48L69tJf4CjvvLEIqbqGIzB4eqyReug';
const GROQ_KEY = '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';
const OR_KEY = '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';

// A tiny 1x1 transparent PNG base64 for testing vision
const dummyImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

// Output helper
const results = { gemini: [], groq: [], openrouter: [] };

async function run() {
  console.log('--- Starting API Testing for ALL Models ---');
  
  await testGemini();
  await testGroq();
  await testOpenRouter();
  
  console.log('\n--- Final Results ---');
  console.log('Gemini:', results.gemini.filter(r => r.pass).length, '/', results.gemini.length, 'passed');
  console.log('Groq:', results.groq.filter(r => r.pass).length, '/', results.groq.length, 'passed');
  console.log('OpenRouter:', results.openrouter.filter(r => r.pass).length, '/', results.openrouter.length, 'passed');
  
  const failed = [...results.gemini, ...results.groq, ...results.openrouter].filter(r => !r.pass);
  if (failed.length > 0) {
    console.log('\nFailed Models:');
    failed.forEach(f => console.log(`- [${f.provider}] ${f.model}: ${f.error}`));
  } else {
    console.log('\n✅ ALL MODELS PASSED SUCCESSFULLY!');
  }
}

async function testGemini() {
  console.log('\nFetching Gemini models...');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_KEY}`);
  const data = await res.json();
  const models = data.models
    .filter((m) =>
      m.name &&
      m.supportedGenerationMethods?.includes('generateContent') &&
      m.name.includes('gemini') &&
      !m.name.includes('-image') &&
      !m.name.includes('-vision') &&
      !m.name.includes('-tts') &&
      !m.name.includes('2.5') &&
      !m.name.includes('exp')
    )
    .map(m => m.name.replace('models/', ''));

  console.log(`Found ${models.length} Gemini models.`);

  for (const model of models) {
    console.log(`Testing [Gemini] ${model}...`);
    try {
      const body = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'Describe this image briefly.' },
              { inlineData: { mimeType: 'image/png', data: dummyImageBase64 } }
            ]
          }
        ]
      };
      
      const mRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!mRes.ok) {
        const err = await mRes.text();
        throw new Error(err);
      }
      results.gemini.push({ model, pass: true, provider: 'gemini' });
      console.log(`  -> Pass`);
    } catch (e) {
      console.log(`  -> Fail: ${e.message.slice(0, 100)}`);
      results.gemini.push({ model, pass: false, error: e.message, provider: 'gemini' });
    }
    // rate limit prevention
    await new Promise(r => setTimeout(r, 1000));
  }
}

async function testGroq() {
  console.log('\nFetching Groq models...');
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${GROQ_KEY}` }
  });
  const data = await res.json();
  const models = data.data
    .filter((m) => {
      const id = (m.id || '').toLowerCase();
      if (id.includes('whisper') || id.includes('tts') || id.includes('orpheus')) return false;
      if (id.includes('guard') || id.includes('moderation')) return false;
      if (id.includes('vision') && !id.includes('preview')) return false;
      if (id.includes('allam') || id.includes('bielik') || id.includes('saiga')) return false;
      if (id.includes('chinese') || id.includes('japanese') || id.includes('ko-')) return false;
      if (id.includes('-ar-') || id.includes('-zh-') || id.includes('-ja-') || id.includes('-ko-')) return false;
      if (id.includes('playai') || id.includes('compound')) return false;
      return true;
    })
    .map(m => m.id);

  console.log(`Found ${models.length} Groq models.`);

  for (const model of models) {
    console.log(`Testing [Groq] ${model}...`);
    try {
      const body = {
        model,
        messages: [{ role: 'user', content: 'Hello, what model are you? Reply in one sentence.' }]
      };
      
      const mRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_KEY}`
        },
        body: JSON.stringify(body)
      });
      
      if (!mRes.ok) {
        const err = await mRes.text();
        throw new Error(err);
      }
      results.groq.push({ model, pass: true, provider: 'groq' });
      console.log(`  -> Pass`);
    } catch (e) {
      console.log(`  -> Fail: ${e.message.slice(0, 100)}`);
      results.groq.push({ model, pass: false, error: e.message, provider: 'groq' });
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

async function testOpenRouter() {
  console.log('\nFetching OpenRouter models...');
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { Authorization: `Bearer ${OR_KEY}` }
  });
  const data = await res.json();
  
  const allowedPrefixes = [
    'google/', 'meta-llama/', 'anthropic/', 
    'openai/', 'mistralai/', 'cohere/',
    'x-ai/', 'deepseek/', 'microsoft/',
    'nvidia/', 'nousresearch/', 'qwen/',
    'huggingfaceh4/', 'phind/', 'openchat/',
    'teknium/', 'cognitivecomputations/',
    'lizpreciatior/', 'neversleep/',
    'undi95/', 'gryphe/', 'pygmalionai/',
    'mancer/', 'thedrummer/', 'sao10k/',
    'aetherwiing/', 'nothingiisreal/',
    'sophosympatheia/', 'eva-unit-01/',
    'featherless/', 'moonshotai/',
    'ai21/', 'databricks/', 'allenai/',
    'liquid/', 'together/', 'perplexity/',
    'z-ai/', 'minimax/', 'poolside/',
  ];
  
  const models = data.data
    .filter((m) => {
      const isFree = (m.pricing && parseFloat(m.pricing.prompt) === 0 && parseFloat(m.pricing.completion) === 0) || m.id?.includes(':free');
      if (!isFree) return false;
      const id = m.id.toLowerCase();
      if (id.includes('guard') || id.includes('moderation') || id.includes('embed')) return false;
      if (id.includes('allam') || id.includes('bielik') || id.includes('saiga')) return false;
      if (id.includes('chinese') || id.includes('japanese') || id.includes('ko-')) return false;
      if (id.includes('-ar-') || id.includes('-zh-') || id.includes('-ja-') || id.includes('-ko-')) return false;
      if (id.includes('gemma-4')) return false;
      if (id.includes('nemotron') && (id.includes('safety') || id.includes('3.5') || id.includes('3-5'))) return false;
      if (id.includes('lyria')) return false;
      if (id.includes('laguna-s') || id.includes('glm-5.2')) return false;
      return allowedPrefixes.some(prefix => id.startsWith(prefix));
    })
    .map(m => m.id);

  console.log(`Found ${models.length} OpenRouter free models.`);

  for (const model of models) {
    console.log(`Testing [OpenRouter] ${model}...`);
    try {
      const isNemotronVision = model === 'nvidia/nemotron-3-nano-omni' || model === 'nvidia/nemotron-3-nano-omni:free' || model.toLowerCase().includes('nemotron-3-nano-omni');
      
      let messages;
      if (isNemotronVision) {
         messages = [{
           role: 'user', 
           content: [
             { type: 'text', text: 'Describe this image briefly.' },
             { type: 'image_url', image_url: { url: `data:image/png;base64,${dummyImageBase64}` } }
           ]
         }];
      } else {
         messages = [{ role: 'user', content: 'Hello, what model are you? Reply in one sentence.' }];
      }
      
      const body = { model, messages };
      
      const mRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OR_KEY}`
        },
        body: JSON.stringify(body)
      });
      
      if (!mRes.ok) {
        const err = await mRes.text();
        throw new Error(err);
      }
      results.openrouter.push({ model, pass: true, provider: 'openrouter' });
      console.log(`  -> Pass`);
    } catch (e) {
      console.log(`  -> Fail: ${e.message.slice(0, 100)}`);
      results.openrouter.push({ model, pass: false, error: e.message, provider: 'openrouter' });
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

run().catch(console.error);
