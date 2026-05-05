const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to login...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

  // Simulate login
  console.log('Logging in...');
  await page.type('input[type="email"]', 'test@example.com');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log('Capturing Board...');
  await page.waitForSelector('h3'); // wait for board columns
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'assets/board.png' });

  console.log('Capturing Analytics...');
  await page.goto('http://localhost:5173/analytics', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500)); // allow charts to render
  await page.screenshot({ path: 'assets/analytics.png' });

  console.log('Capturing Mock Interview...');
  await page.goto('http://localhost:5173/mock-interview', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'assets/mock-interview-setup.png' });

  // Start interview to get the active view
  await page.click('button:last-of-type'); // Start Interview button
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'assets/mock-interview-active.png' });

  console.log('Capturing Reviews...');
  await page.goto('http://localhost:5173/reviews', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'assets/reviews.png' });

  await browser.close();
  console.log('Screenshots captured successfully.');
})();
