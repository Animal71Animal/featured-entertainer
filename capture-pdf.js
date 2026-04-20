const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome'
  });
  const page = await browser.newPage({
    viewport: { width: 600, height: 1200 }
  });
  
  await page.goto('https://featured-entertainer.vercel.app/flyer.html', {
    waitUntil: 'networkidle'
  });
  
  // Wait for fonts to load
  await page.waitForTimeout(3000);
  
  // Get full page height
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  
  // Generate PDF
  await page.pdf({
    path: 'flyer-download.pdf',
    width: '600px',
    height: `${bodyHeight}px`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  
  console.log('PDF saved: flyer-download.pdf');
  await browser.close();
})();
