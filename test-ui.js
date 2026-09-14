import puppeteer from 'puppeteer';

const GEMINI_KEY = 'AQ.Ab8RN6JCuMzgEdu_lkd48L69tJf4CjvvLEIqbqGIzB4eqyReug';
const GROQ_KEY = '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';
const OR_KEY = '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';

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  
  const delay = ms => new Promise(res => setTimeout(res, ms));

  console.log('Navigating to BYOK...');
  await page.goto('http://localhost:5173');
  await delay(2000);

  console.log('Signing up...');
  try {
    const signupBtn = await page.$('a[href="/login"]');
    if (signupBtn) await signupBtn.click();
    await delay(1000);
    const inputs = await page.$$('input');
    if (inputs.length >= 3) {
      await inputs[0].type('Test User');
      await inputs[1].type('test' + Date.now() + '@test.com');
      await inputs[2].type('password123');
      await page.keyboard.press('Enter');
      await delay(2000);
    }
  } catch (e) { console.log('Signup error/skipped', e.message); }

  console.log('Navigating to API Keys...');
  await page.goto('http://localhost:5173/workspace/api-keys');
  await delay(2000);

  // Passphrase
  const passInputs = await page.$$('input[type="password"]');
  if (passInputs.length > 0) {
    await passInputs[0].type('1234');
    await page.keyboard.press('Enter');
    await delay(1000);
    
    // Check for Set/Unlock buttons
    const buttons = await page.$$('button');
    for (let btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('Unlock') || text.includes('Encrypt') || text.includes('Set'))) {
        await btn.click();
        await delay(500);
      }
    }
    await delay(1000);
  }

  // API Keys
  const keyInputs = await page.$$('input');
  for (let input of keyInputs) {
    const placeholder = await page.evaluate(el => el.placeholder, input);
    if (!placeholder) continue;
    if (placeholder.toLowerCase().includes('gemini')) {
      await input.click({clickCount: 3});
      await input.type(GEMINI_KEY);
    } else if (placeholder.toLowerCase().includes('groq')) {
      await input.click({clickCount: 3});
      await input.type(GROQ_KEY);
    } else if (placeholder.toLowerCase().includes('openrouter')) {
      await input.click({clickCount: 3});
      await input.type(OR_KEY);
    }
  }
  
  const buttons = await page.$$('button');
  for (let btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Connect')) {
      await btn.click();
      await delay(500);
    }
  }
  
  await delay(2000);
  console.log('Setup complete. The browser subagent previously timed out testing all models iteratively due to length of task. You can now use the UI manually to test the models, or I can provide a headless test for the API directly.');
  
  await delay(5000);
  await browser.close();
}

run().catch(console.error);
