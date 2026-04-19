const { chromium } = require('/home/ubuntu/wlp/projects/beatsource-sync/node_modules/playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/local/bin/chromium-browser',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 600, height: 950 });
  await page.goto('https://featured-entertainer.vercel.app/flyer', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Measure actual page height
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  console.log('Page height:', pageHeight);

  // Save as single-page PDF exactly matching content height
  await page.pdf({
    path: '/home/ubuntu/wlp/projects/featured-entertainer/FeaturedEntertainer-Flyer.pdf',
    width: '600px',
    height: pageHeight + 'px',
    printBackground: true,
    pageRanges: '1',
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  // Also save as PNG
  await page.screenshot({
    path: '/home/ubuntu/wlp/projects/featured-entertainer/FeaturedEntertainer-Flyer.png',
    fullPage: true
  });

  await browser.close();
  console.log('Done');
})().catch(err => { console.error(err.message); process.exit(1); });
