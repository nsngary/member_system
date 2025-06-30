const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

class CompleteCrawler {
  constructor() {
    this.baseUrl = 'https://dich-fashion.webflow.io';
    this.visitedUrls = new Set();
    this.discoveredUrls = new Set();
    this.pages = [];
    this.animations = [];
    this.animationCounter = 0;
  }

  async crawlAllPages() {
    console.log('🚀 開始完整網站爬取...');
    
    // 首先爬取首頁
    await this.crawlPage(this.baseUrl + '/');
    
    // 從首頁發現的連結中爬取其他頁面
    const internalLinks = this.getInternalLinks();
    console.log(`🔗 發現 ${internalLinks.length} 個內部連結`);
    
    for (const link of internalLinks) {
      if (!this.visitedUrls.has(link)) {
        await this.crawlPage(link);
        await this.delay(1000); // 避免過於頻繁的請求
      }
    }
    
    console.log(`✅ 爬取完成！共處理 ${this.pages.length} 個頁面`);
    await this.saveResults();
  }

  async crawlPage(url) {
    if (this.visitedUrls.has(url)) {
      return;
    }

    console.log(`📄 正在爬取: ${url}`);
    this.visitedUrls.add(url);

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      
      const pageData = {
        url: url,
        title: $('title').text(),
        html: response.data,
        links: [],
        scripts: [],
        stylesheets: [],
        animations: [],
        webflowElements: [],
        cssAnimations: []
      };

      // 收集連結
      $('a[href]').each((i, element) => {
        const href = $(element).attr('href');
        if (href) {
          const fullUrl = this.resolveUrl(href);
          pageData.links.push({
            href: fullUrl,
            text: $(element).text().trim(),
            classes: $(element).attr('class') || ''
          });
          
          if (this.isInternalUrl(fullUrl)) {
            this.discoveredUrls.add(fullUrl);
          }
        }
      });

      // 收集腳本
      $('script').each((i, element) => {
        const src = $(element).attr('src');
        const content = $(element).html();
        pageData.scripts.push({
          src: src || null,
          hasContent: content && content.length > 0,
          content: content || null,
          type: $(element).attr('type') || 'text/javascript'
        });
      });

      // 收集樣式表
      $('link[rel="stylesheet"]').each((i, element) => {
        const href = $(element).attr('href');
        if (href) {
          pageData.stylesheets.push({ 
            href: href,
            media: $(element).attr('media') || 'all'
          });
        }
      });

      // 收集 Webflow 動畫元素
      $('[data-w-id]').each((i, element) => {
        const wId = $(element).attr('data-w-id');
        const tagName = element.tagName;
        const classes = $(element).attr('class') || '';
        const id = $(element).attr('id') || '';
        
        const animationData = {
          slug: `anim_${(++this.animationCounter).toString().padStart(3, '0')}`,
          sourcePage: url,
          type: 'webflow-ix2',
          tech: 'Webflow IX2',
          trigger: this.inferTriggerFromClasses(classes),
          webflowId: wId,
          element: tagName.toLowerCase(),
          classes: classes,
          id: id,
          selector: this.generateSelector($(element)),
          sourceLocation: `${url}:webflow-element`
        };
        
        pageData.webflowElements.push(animationData);
        this.animations.push(animationData);
      });

      // 分析 CSS 動畫
      await this.analyzeCSSAnimations(pageData, $);

      // 分析 JavaScript 動畫
      await this.analyzeJSAnimations(pageData);

      this.pages.push(pageData);
      
      // 保存單個頁面資料
      await this.savePageData(pageData);
      
      console.log(`✅ 完成: ${url} (發現 ${pageData.webflowElements.length} 個 Webflow 元素)`);

    } catch (error) {
      console.error(`❌ 爬取失敗 ${url}:`, error.message);
    }
  }

  async analyzeCSSAnimations(pageData, $) {
    // 分析內聯樣式中的動畫
    $('[style*="animation"], [style*="transition"]').each((i, element) => {
      const style = $(element).attr('style');
      const selector = this.generateSelector($(element));
      
      if (style.includes('animation')) {
        const animationData = {
          slug: `anim_${(++this.animationCounter).toString().padStart(3, '0')}`,
          sourcePage: pageData.url,
          type: 'css-animation',
          tech: 'CSS Animation (inline)',
          trigger: 'loading',
          selector: selector,
          codeSnippet: style,
          sourceLocation: `${pageData.url}:inline-style`,
          ...this.extractAnimationProperties(style)
        };
        
        pageData.cssAnimations.push(animationData);
        this.animations.push(animationData);
      }
      
      if (style.includes('transition')) {
        const animationData = {
          slug: `anim_${(++this.animationCounter).toString().padStart(3, '0')}`,
          sourcePage: pageData.url,
          type: 'css-transition',
          tech: 'CSS Transition (inline)',
          trigger: 'hover',
          selector: selector,
          codeSnippet: style,
          sourceLocation: `${pageData.url}:inline-style`,
          ...this.extractTransitionProperties(style)
        };
        
        pageData.cssAnimations.push(animationData);
        this.animations.push(animationData);
      }
    });

    // 分析 CSS 中的 keyframes
    const cssContent = pageData.html;
    const keyframesMatches = cssContent.match(/@keyframes\s+([^{]+)\{[^}]+\}/g);
    if (keyframesMatches) {
      keyframesMatches.forEach((match, i) => {
        const nameMatch = match.match(/@keyframes\s+([^\s{]+)/);
        const keyframeName = nameMatch ? nameMatch[1] : `keyframe_${i}`;
        
        const animationData = {
          slug: `anim_${(++this.animationCounter).toString().padStart(3, '0')}`,
          sourcePage: pageData.url,
          type: 'css-keyframes',
          tech: 'CSS keyframes',
          trigger: 'loading',
          keyframeName: keyframeName,
          codeSnippet: match,
          sourceLocation: `${pageData.url}:embedded-css`,
          duration: 1000,
          easing: 'ease'
        };
        
        pageData.cssAnimations.push(animationData);
        this.animations.push(animationData);
      });
    }
  }

  async analyzeJSAnimations(pageData) {
    // 分析 JavaScript 腳本中的動畫
    for (const script of pageData.scripts) {
      if (script.content) {
        // 檢查 GSAP
        if (script.content.includes('gsap') || script.content.includes('TweenMax')) {
          const gsapMatches = script.content.match(/gsap\.(to|from|fromTo)\s*\([^)]+\)/g);
          if (gsapMatches) {
            gsapMatches.forEach((match, i) => {
              const animationData = {
                slug: `anim_${(++this.animationCounter).toString().padStart(3, '0')}`,
                sourcePage: pageData.url,
                type: 'gsap',
                tech: 'GSAP',
                trigger: 'script',
                codeSnippet: match,
                sourceLocation: `${pageData.url}:javascript`,
                duration: this.extractGSAPDuration(match) || 1000,
                easing: 'ease'
              };
              
              this.animations.push(animationData);
            });
          }
        }

        // 檢查其他動畫模式
        const animationPatterns = [
          /\.animate\s*\(/g,
          /requestAnimationFrame/g,
          /setInterval.*animation/gi
        ];

        animationPatterns.forEach((pattern, patternIndex) => {
          const matches = script.content.match(pattern);
          if (matches) {
            matches.forEach((match, i) => {
              const animationData = {
                slug: `anim_${(++this.animationCounter).toString().padStart(3, '0')}`,
                sourcePage: pageData.url,
                type: 'custom-js',
                tech: 'JavaScript 自訂',
                trigger: 'script',
                codeSnippet: match,
                sourceLocation: `${pageData.url}:javascript`,
                duration: 1000,
                easing: 'ease'
              };
              
              this.animations.push(animationData);
            });
          }
        });
      }
    }
  }

  generateSelector(element) {
    let selector = element.prop('tagName').toLowerCase();
    
    if (element.attr('id')) {
      selector += '#' + element.attr('id');
    } else if (element.attr('class')) {
      const classes = element.attr('class').split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        selector += '.' + classes.slice(0, 3).join('.');
      }
    }
    
    return selector;
  }

  inferTriggerFromClasses(classes) {
    const classStr = classes.toLowerCase();
    
    if (classStr.includes('scroll')) return 'scroll';
    if (classStr.includes('hover')) return 'hover';
    if (classStr.includes('click')) return 'click';
    if (classStr.includes('load')) return 'loading';
    if (classStr.includes('loop')) return 'loop';
    
    return 'unknown';
  }

  extractAnimationProperties(cssText) {
    const props = { duration: 1000, delay: 0, easing: 'ease' };
    
    const durationMatch = cssText.match(/animation(?:-duration)?:\s*([0-9.]+)(s|ms)/);
    if (durationMatch) {
      props.duration = parseFloat(durationMatch[1]) * (durationMatch[2] === 's' ? 1000 : 1);
    }
    
    const delayMatch = cssText.match(/animation(?:-delay)?:\s*([0-9.]+)(s|ms)/);
    if (delayMatch) {
      props.delay = parseFloat(delayMatch[1]) * (delayMatch[2] === 's' ? 1000 : 1);
    }
    
    const easingMatch = cssText.match(/animation(?:-timing-function)?:\s*([^;,]+)/);
    if (easingMatch) props.easing = easingMatch[1].trim();
    
    return props;
  }

  extractTransitionProperties(cssText) {
    const props = { duration: 300, delay: 0, easing: 'ease' };
    
    const durationMatch = cssText.match(/transition(?:-duration)?:\s*([0-9.]+)(s|ms)/);
    if (durationMatch) {
      props.duration = parseFloat(durationMatch[1]) * (durationMatch[2] === 's' ? 1000 : 1);
    }
    
    const easingMatch = cssText.match(/transition(?:-timing-function)?:\s*([^;,]+)/);
    if (easingMatch) props.easing = easingMatch[1].trim();
    
    return props;
  }

  extractGSAPDuration(gsapCode) {
    const match = gsapCode.match(/duration:\s*([0-9.]+)/);
    return match ? parseFloat(match[1]) * 1000 : null;
  }

  resolveUrl(href) {
    if (href.startsWith('http')) {
      return href;
    } else if (href.startsWith('/')) {
      return this.baseUrl + href;
    } else if (href.startsWith('#')) {
      return this.baseUrl + '/' + href;
    } else {
      return this.baseUrl + '/' + href;
    }
  }

  isInternalUrl(url) {
    return url.includes('dich-fashion.webflow.io') && 
           !url.includes('mailto:') && 
           !url.includes('tel:') &&
           !url.match(/\.(pdf|jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/i);
  }

  getInternalLinks() {
    const links = new Set();
    
    for (const page of this.pages) {
      for (const link of page.links) {
        if (this.isInternalUrl(link.href)) {
          links.add(link.href);
        }
      }
    }
    
    return Array.from(links);
  }

  async savePageData(pageData) {
    const urlPath = new URL(pageData.url).pathname.replace(/\//g, '_') || 'index';
    const fileName = `page_${urlPath}.json`;
    const filePath = path.join(__dirname, 'assets/raw', fileName);
    
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeJson(filePath, pageData, { spaces: 2 });
  }

  async saveResults() {
    const outputDir = path.join(__dirname, 'output');
    await fs.ensureDir(outputDir);

    // 保存網站地圖
    const siteMap = {
      baseUrl: this.baseUrl,
      crawledAt: new Date().toISOString(),
      totalPages: this.pages.length,
      totalAnimations: this.animations.length,
      pages: this.pages.map(page => ({
        url: page.url,
        title: page.title,
        linksCount: page.links.length,
        scriptsCount: page.scripts.length,
        stylesheetsCount: page.stylesheets.length,
        animationsCount: page.webflowElements.length + page.cssAnimations.length
      }))
    };

    await fs.writeJson(path.join(outputDir, 'sitemap.json'), siteMap, { spaces: 2 });

    // 保存動畫資料
    const animationData = {
      analyzedAt: new Date().toISOString(),
      totalAnimations: this.animations.length,
      animations: this.animations
    };

    await fs.writeJson(path.join(outputDir, 'animations_detected.json'), animationData, { spaces: 2 });

    console.log('💾 結果已保存到 output/ 目錄');
    console.log(`📊 統計: ${this.pages.length} 個頁面, ${this.animations.length} 個動畫`);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 執行爬取
async function main() {
  const crawler = new CompleteCrawler();
  try {
    await crawler.crawlAllPages();
  } catch (error) {
    console.error('爬取過程發生錯誤:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = CompleteCrawler;
