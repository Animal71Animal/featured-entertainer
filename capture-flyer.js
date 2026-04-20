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
  
  // Resize viewport to full height
  await page.setViewportSize({ width: 600, height: bodyHeight });
  
  // Screenshot
  await page.screenshot({
    path: 'flyer-download.png',
    fullPage: true
  });
  
  console.log('Screenshot saved: flyer-download.png');
  await browser.close();
})();
