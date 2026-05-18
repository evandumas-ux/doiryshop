import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const errors = [];
  await page.exposeFunction('logError', (msg) => {
    console.log('CAUGHT_ERROR:', msg);
  });

  await page.evaluateOnNewDocument(() => {
    window.addEventListener('error', e => window.logError(e.message));
    window.addEventListener('unhandledrejection', e => window.logError(e.reason ? e.reason.toString() : 'promise rejection'));
    
    const originalConsoleError = console.error;
    console.error = function(...args) {
      window.logError('console.error: ' + args.join(' '));
      originalConsoleError.apply(console, args);
    };
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  } catch (err) {
    console.log('GOTO_ERROR:', err.message);
  }

  await browser.close();
})();
