import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // LP
  await page.goto('http://localhost:8000', { waitUntil: 'networkidle2' });
  await page.setViewport({ width: 1920, height: 1080 });
  await page.screenshot({ path: '/tmp/lp.png' });
  
  // Mobile LP
  await page.setViewport({ width: 375, height: 812 });
  await page.screenshot({ path: '/tmp/lp-mobile.png' });
  
  // App
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:8000/app.html', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: '/tmp/app.png' });
  
  // Mobile App
  await page.setViewport({ width: 375, height: 812 });
  await page.screenshot({ path: '/tmp/app-mobile.png' });
  
  await browser.close();
  console.log('Screenshots saved');
})();
