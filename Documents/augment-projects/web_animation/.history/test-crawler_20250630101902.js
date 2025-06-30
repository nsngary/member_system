const puppeteer = require('puppeteer');
const chalk = require('chalk');

async function testCrawler() {
  console.log(chalk.blue('🚀 測試爬蟲...'));
  
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto('https://dich-fashion.webflow.io/', { waitUntil: 'networkidle2' });
    
    const title = await page.title();
    console.log(chalk.green(`✅ 成功載入頁面: ${title}`));
    
    await browser.close();
    
  } catch (error) {
    console.error(chalk.red('❌ 測試失敗:'), error.message);
  }
}

testCrawler();
