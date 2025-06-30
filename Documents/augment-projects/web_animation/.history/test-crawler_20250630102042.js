const puppeteer = require('puppeteer');

async function testCrawler() {
  console.log('🚀 測試爬蟲...');

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://dich-fashion.webflow.io/', { waitUntil: 'networkidle2' });

    const title = await page.title();
    console.log(`✅ 成功載入頁面: ${title}`);

    await browser.close();

  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
}

testCrawler();
