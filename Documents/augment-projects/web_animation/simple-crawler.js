const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

async function simpleCrawl() {
  console.log('🚀 開始簡化爬取...');
  
  let browser;
  try {
    // 啟動瀏覽器
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    console.log('📄 正在載入首頁...');
    await page.goto('https://dich-fashion.webflow.io/', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    console.log('✅ 首頁載入成功');
    
    // 收集基本資訊
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        links: Array.from(document.querySelectorAll('a[href]')).map(a => a.href),
        scripts: Array.from(document.scripts).map(script => ({
          src: script.src,
          hasContent: script.innerHTML.length > 0
        })),
        stylesheets: Array.from(document.styleSheets).map(sheet => ({
          href: sheet.href
        }))
      };
    });
    
    console.log(`📊 頁面標題: ${pageInfo.title}`);
    console.log(`🔗 發現 ${pageInfo.links.length} 個連結`);
    console.log(`📜 發現 ${pageInfo.scripts.length} 個腳本`);
    console.log(`🎨 發現 ${pageInfo.stylesheets.length} 個樣式表`);
    
    // 保存結果
    const outputDir = path.join(__dirname, 'output');
    await fs.ensureDir(outputDir);
    
    await fs.writeJson(path.join(outputDir, 'simple-crawl-result.json'), {
      crawledAt: new Date().toISOString(),
      pageInfo
    }, { spaces: 2 });
    
    console.log('💾 結果已保存到 output/simple-crawl-result.json');
    
  } catch (error) {
    console.error('❌ 爬取失敗:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

simpleCrawl();
