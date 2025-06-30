const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

class WebsiteCrawler {
  constructor(baseUrl = 'https://dich-fashion.webflow.io/') {
    this.baseUrl = baseUrl;
    this.visitedUrls = new Set();
    this.discoveredUrls = new Set();
    this.siteMap = [];
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    console.log('🚀 初始化瀏覽器...');
    this.browser = await puppeteer.launch({
      headless: false, // 設為 false 以便觀察過程
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1920, height: 1080 }
    });
    this.page = await this.browser.newPage();
    
    // 設置用戶代理
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    // 攔截網路請求以收集資源
    await this.page.setRequestInterception(true);
    this.page.on('request', (request) => {
      request.continue();
    });
  }

  async discoverRoutes() {
    console.log('🔍 開始發現網站路由...');
    
    try {
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // 等待頁面完全載入
      await this.page.waitForTimeout(3000);
      
      // 收集所有連結
      const links = await this.page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        return anchors.map(anchor => ({
          href: anchor.href,
          text: anchor.textContent.trim(),
          selector: anchor.tagName + (anchor.id ? '#' + anchor.id : '') + (anchor.className ? '.' + anchor.className.split(' ').join('.') : '')
        }));
      });

      // 過濾並標準化 URL
      for (const link of links) {
        const url = this.normalizeUrl(link.href);
        if (this.isValidUrl(url)) {
          this.discoveredUrls.add(url);
        }
      }

      console.log(`✅ 發現 ${this.discoveredUrls.size} 個有效路由`);
      return Array.from(this.discoveredUrls);

    } catch (error) {
      console.error('❌ 路由發現失敗:', error.message);
      throw error;
    }
  }

  normalizeUrl(url) {
    try {
      const urlObj = new URL(url);
      // 移除 fragment 和查詢參數（保留重要的查詢參數）
      urlObj.hash = '';
      return urlObj.toString();
    } catch {
      return null;
    }
  }

  isValidUrl(url) {
    if (!url) return false;
    
    try {
      const urlObj = new URL(url);
      
      // 只處理同域名的 URL
      if (!urlObj.hostname.includes('dich-fashion.webflow.io')) {
        return false;
      }
      
      // 排除文件下載和外部資源
      const excludePatterns = [
        /\.(pdf|jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/i,
        /mailto:/,
        /tel:/,
        /#$/,
        /javascript:/
      ];
      
      return !excludePatterns.some(pattern => pattern.test(url));
    } catch {
      return false;
    }
  }

  async crawlPage(url) {
    if (this.visitedUrls.has(url)) {
      return null;
    }

    console.log(`📄 正在爬取: ${url}`);
    this.visitedUrls.add(url);

    try {
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // 等待動態內容載入
      await this.page.waitForTimeout(2000);
      
      // 滾動頁面以觸發延遲載入
      await this.autoScroll();
      
      // 收集頁面資料
      const pageData = await this.extractPageData(url);
      
      // 保存頁面內容
      await this.savePageContent(url, pageData);
      
      this.siteMap.push(pageData);
      return pageData;
      
    } catch (error) {
      console.error(`❌ 爬取失敗 ${url}:`, error.message);
      return null;
    }
  }

  async autoScroll() {
    await this.page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if(totalHeight >= scrollHeight){
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  async extractPageData(url) {
    const pageData = await this.page.evaluate((currentUrl) => {
      return {
        url: currentUrl,
        title: document.title,
        html: document.documentElement.outerHTML,
        scripts: Array.from(document.scripts).map(script => ({
          src: script.src,
          content: script.innerHTML,
          type: script.type || 'text/javascript'
        })),
        stylesheets: Array.from(document.styleSheets).map(sheet => {
          try {
            return {
              href: sheet.href,
              rules: Array.from(sheet.cssRules || []).map(rule => rule.cssText)
            };
          } catch {
            return { href: sheet.href, rules: [] };
          }
        }),
        meta: Array.from(document.querySelectorAll('meta')).map(meta => ({
          name: meta.name,
          property: meta.property,
          content: meta.content
        }))
      };
    }, url);

    return pageData;
  }

  async savePageContent(url, pageData) {
    const urlPath = new URL(url).pathname.replace(/\//g, '_') || 'index';
    const fileName = `page_${urlPath}.json`;
    const filePath = path.join(__dirname, '../assets/raw', fileName);
    
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeJson(filePath, pageData, { spaces: 2 });
    
    console.log(`💾 已保存: ${fileName}`);
  }

  async crawlAllPages() {
    console.log('🕷️  開始全站爬取...');
    
    const urls = await this.discoverRoutes();
    const results = [];
    
    for (const url of urls) {
      const result = await this.crawlPage(url);
      if (result) {
        results.push(result);
      }
      
      // 避免過於頻繁的請求
      await this.page.waitForTimeout(1000);
    }
    
    // 保存網站地圖
    await this.saveSiteMap();
    
    console.log(`✅ 爬取完成！共處理 ${results.length} 個頁面`);
    return results;
  }

  async saveSiteMap() {
    const siteMapPath = path.join(__dirname, '../output/sitemap.json');
    await fs.ensureDir(path.dirname(siteMapPath));
    await fs.writeJson(siteMapPath, {
      baseUrl: this.baseUrl,
      crawledAt: new Date().toISOString(),
      totalPages: this.siteMap.length,
      pages: this.siteMap.map(page => ({
        url: page.url,
        title: page.title,
        scriptsCount: page.scripts.length,
        stylesheetsCount: page.stylesheets.length
      }))
    }, { spaces: 2 });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = WebsiteCrawler;

// 如果直接執行此檔案
if (require.main === module) {
  (async () => {
    const crawler = new WebsiteCrawler();
    try {
      await crawler.initialize();
      await crawler.crawlAllPages();
    } catch (error) {
      console.error('爬取過程發生錯誤:', error);
    } finally {
      await crawler.close();
    }
  })();
}
