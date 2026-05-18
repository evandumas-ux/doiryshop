import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER_CONSOLE_ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE_ERROR:', err.message);
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Check if vite-error-overlay exists
    const overlay = await page.evaluate(() => {
      const el = document.querySelector('vite-error-overlay');
      if (el && el.shadowRoot) {
        return el.shadowRoot.innerHTML;
      }
      return null;
    });
    
    if (overlay) {
      console.log('VITE_ERROR_OVERLAY:', overlay);
    } else {
      console.log('No Vite error overlay found.');
    }
    
  } catch (err) {
    console.log('GOTO_ERROR:', err.message);
  }

  await browser.close();
})();
