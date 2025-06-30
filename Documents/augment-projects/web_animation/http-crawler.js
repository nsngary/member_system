const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

async function httpCrawl() {
  console.log('🚀 開始 HTTP 爬取...');
  
  try {
    // 獲取首頁內容
    console.log('📄 正在獲取首頁...');
    const response = await axios.get('https://dich-fashion.webflow.io/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    console.log('✅ 首頁獲取成功');
    
    // 解析 HTML
    const $ = cheerio.load(response.data);
    
    // 收集資訊
    const pageInfo = {
      title: $('title').text(),
      url: 'https://dich-fashion.webflow.io/',
      html: response.data,
      links: [],
      scripts: [],
      stylesheets: [],
      animations: []
    };
    
    // 收集連結
    $('a[href]').each((i, element) => {
      const href = $(element).attr('href');
      if (href) {
        pageInfo.links.push({
          href: href,
          text: $(element).text().trim()
        });
      }
    });
    
    // 收集腳本
    $('script').each((i, element) => {
      const src = $(element).attr('src');
      const content = $(element).html();
      pageInfo.scripts.push({
        src: src || null,
        hasContent: content && content.length > 0,
        content: content || null
      });
    });
    
    // 收集樣式表
    $('link[rel="stylesheet"]').each((i, element) => {
      const href = $(element).attr('href');
      if (href) {
        pageInfo.stylesheets.push({ href });
      }
    });
    
    // 檢查動畫相關元素
    $('[data-w-id]').each((i, element) => {
      const wId = $(element).attr('data-w-id');
      const tagName = element.tagName;
      const classes = $(element).attr('class') || '';
      
      pageInfo.animations.push({
        type: 'webflow-ix2',
        webflowId: wId,
        element: tagName,
        classes: classes
      });
    });
    
    // 檢查 CSS 動畫
    const styleContent = response.data;
    const keyframesMatches = styleContent.match(/@keyframes\s+[^{]+\{[^}]+\}/g);
    if (keyframesMatches) {
      keyframesMatches.forEach((match, i) => {
        pageInfo.animations.push({
          type: 'css-keyframes',
          code: match,
          index: i
        });
      });
    }
    
    console.log(`📊 頁面標題: ${pageInfo.title}`);
    console.log(`🔗 發現 ${pageInfo.links.length} 個連結`);
    console.log(`📜 發現 ${pageInfo.scripts.length} 個腳本`);
    console.log(`🎨 發現 ${pageInfo.stylesheets.length} 個樣式表`);
    console.log(`✨ 發現 ${pageInfo.animations.length} 個動畫元素`);
    
    // 保存結果
    const outputDir = path.join(__dirname, 'output');
    await fs.ensureDir(outputDir);
    
    await fs.writeJson(path.join(outputDir, 'http-crawl-result.json'), {
      crawledAt: new Date().toISOString(),
      pageInfo
    }, { spaces: 2 });
    
    // 保存 HTML
    await fs.writeFile(path.join(outputDir, 'homepage.html'), response.data);
    
    console.log('💾 結果已保存到 output/ 目錄');
    
    // 分析發現的連結
    const internalLinks = pageInfo.links.filter(link => 
      link.href.includes('dich-fashion.webflow.io') || 
      link.href.startsWith('/') ||
      link.href.startsWith('#')
    );
    
    console.log(`🏠 發現 ${internalLinks.length} 個內部連結`);
    internalLinks.slice(0, 10).forEach(link => {
      console.log(`  - ${link.href} (${link.text})`);
    });
    
  } catch (error) {
    console.error('❌ HTTP 爬取失敗:', error.message);
  }
}

httpCrawl();
