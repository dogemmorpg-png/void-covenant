import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', error => {
    console.error('PAGE ERROR CAUGHT:', error.message);
    process.exit(0);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('CONSOLE ERROR:', msg.text());
    }
  });

  try {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('text=SUMMON');
    console.log('Clicking SUMMON tab...');
    
    // Evaluate in browser to click the Summon tab. 
    // In App.tsx it's rendered as a tab button.
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const summonBtn = buttons.find(b => b.textContent && b.textContent.includes('SUMMON'));
      if (summonBtn) summonBtn.click();
    });

    await new Promise(r => setTimeout(r, 2000));
    console.log('No error caught after clicking SUMMON.');
  } catch (e) {
    console.error('Script error:', e);
  } finally {
    await browser.close();
    process.exit(0);
  }
})();
