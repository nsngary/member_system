const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

class VisualCapture {
  constructor() {
    this.browser = null;
    this.page = null;
    this.animations = [];
    this.captureCounter = 0;
  }

  async initialize() {
    console.log(chalk.blue('🎥 初始化視覺擷取器...'));
    
    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--allow-running-insecure-content'
      ],
      defaultViewport: { width: 1920, height: 1080 }
    });
    
    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    // 載入動畫資料
    await this.loadAnimationData();
  }

  async loadAnimationData() {
    const animationFile = path.join(__dirname, '../output/animations_detected.json');
    
    if (await fs.pathExists(animationFile)) {
      const data = await fs.readJson(animationFile);
      this.animations = data.animations || [];
      console.log(chalk.green(`📊 載入了 ${this.animations.length} 個動畫資料`));
    } else {
      console.log(chalk.yellow('⚠️  未找到動畫資料，請先執行動畫偵測'));
    }
  }

  async captureAllAnimations() {
    console.log(chalk.blue('📸 開始擷取所有動畫的視覺資產...'));
    
    const groupedAnimations = this.groupAnimationsByPage();
    
    for (const [pageUrl, pageAnimations] of Object.entries(groupedAnimations)) {
      console.log(chalk.cyan(`🌐 處理頁面: ${pageUrl}`));
      await this.capturePageAnimations(pageUrl, pageAnimations);
    }
    
    console.log(chalk.green('✅ 所有動畫視覺資產擷取完成！'));
  }

  groupAnimationsByPage() {
    const grouped = {};
    
    for (const animation of this.animations) {
      const pageUrl = animation.sourcePage;
      if (!grouped[pageUrl]) {
        grouped[pageUrl] = [];
      }
      grouped[pageUrl].push(animation);
    }
    
    return grouped;
  }

  async capturePageAnimations(pageUrl, animations) {
    try {
      await this.page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await this.page.waitForTimeout(2000);
      
      for (const animation of animations) {
        await this.captureAnimation(animation);
        await this.page.waitForTimeout(1000); // 避免過於頻繁
      }
      
    } catch (error) {
      console.error(chalk.red(`❌ 頁面載入失敗 ${pageUrl}:`), error.message);
    }
  }

  async captureAnimation(animation) {
    console.log(chalk.yellow(`🎬 擷取動畫: ${animation.slug}`));
    
    try {
      const element = await this.findAnimationElement(animation);
      
      if (element) {
        // 擷取起始狀態截圖
        await this.captureInitialState(animation, element);
        
        // 根據觸發類型執行動畫並擷取
        await this.triggerAndCaptureAnimation(animation, element);
        
        // 擷取結束狀態截圖
        await this.captureFinalState(animation, element);
        
        console.log(chalk.green(`✅ 完成擷取: ${animation.slug}`));
      } else {
        console.log(chalk.yellow(`⚠️  找不到動畫元素: ${animation.slug}`));
      }
      
    } catch (error) {
      console.error(chalk.red(`❌ 擷取失敗 ${animation.slug}:`), error.message);
    }
  }

  async findAnimationElement(animation) {
    try {
      if (animation.selector) {
        // 嘗試使用 CSS 選擇器
        const element = await this.page.$(animation.selector);
        if (element) return element;
      }
      
      if (animation.rawData && animation.rawData.webflowId) {
        // 嘗試使用 Webflow ID
        const element = await this.page.$(`[data-w-id="${animation.rawData.webflowId}"]`);
        if (element) return element;
      }
      
      // 嘗試根據動畫類型尋找元素
      return await this.findElementByAnimationType(animation);
      
    } catch (error) {
      console.error(`尋找元素時發生錯誤:`, error.message);
      return null;
    }
  }

  async findElementByAnimationType(animation) {
    // 根據動畫類型的啟發式搜尋
    const commonSelectors = [
      '.animation', '.animate', '.fade', '.slide', '.scale',
      '[data-animation]', '[data-animate]', '[data-w-id]',
      '.hero', '.banner', '.card', '.button', '.image'
    ];
    
    for (const selector of commonSelectors) {
      try {
        const elements = await this.page.$$(selector);
        if (elements.length > 0) {
          return elements[0]; // 返回第一個找到的元素
        }
      } catch (error) {
        // 繼續嘗試下一個選擇器
      }
    }
    
    return null;
  }

  async captureInitialState(animation, element) {
    const fileName = `${animation.slug}_initial.png`;
    const filePath = path.join(__dirname, '../assets/raw', fileName);
    
    await fs.ensureDir(path.dirname(filePath));
    
    // 滾動到元素位置
    await element.scrollIntoView();
    await this.page.waitForTimeout(500);
    
    // 擷取元素截圖
    await element.screenshot({ path: filePath });
    
    // 更新動畫資料
    animation.assetPath = animation.assetPath || {};
    animation.assetPath.initialScreenshot = fileName;
  }

  async captureFinalState(animation, element) {
    const fileName = `${animation.slug}_final.png`;
    const filePath = path.join(__dirname, '../assets/raw', fileName);
    
    await fs.ensureDir(path.dirname(filePath));
    
    // 等待動畫完成
    await this.page.waitForTimeout(animation.duration + animation.delay + 500);
    
    // 擷取最終狀態截圖
    await element.screenshot({ path: filePath });
    
    // 更新動畫資料
    animation.assetPath = animation.assetPath || {};
    animation.assetPath.finalScreenshot = fileName;
  }

  async triggerAndCaptureAnimation(animation, element) {
    const videoFileName = `${animation.slug}_animation.webm`;
    const videoPath = path.join(__dirname, '../assets/raw', videoFileName);
    
    await fs.ensureDir(path.dirname(videoPath));
    
    try {
      // 開始錄製
      const recorder = new PuppeteerScreenRecorder(this.page);
      await recorder.start(videoPath);
      
      // 根據觸發類型執行動畫
      await this.triggerAnimation(animation, element);
      
      // 等待動畫完成
      const totalDuration = (animation.duration || 1000) + (animation.delay || 0) + 1000;
      await this.page.waitForTimeout(totalDuration);
      
      // 停止錄製
      await recorder.stop();
      
      // 更新動畫資料
      animation.assetPath = animation.assetPath || {};
      animation.assetPath.video = videoFileName;
      
    } catch (error) {
      console.error(`錄製動畫失敗:`, error.message);
    }
  }

  async triggerAnimation(animation, element) {
    const trigger = animation.trigger;
    
    try {
      switch (trigger) {
        case 'hover':
          await element.hover();
          break;
          
        case 'click':
          await element.click();
          break;
          
        case 'scroll':
          await element.scrollIntoView();
          // 額外滾動以確保觸發
          await this.page.evaluate(() => {
            window.scrollBy(0, 100);
          });
          break;
          
        case 'loading':
          // 重新載入頁面以觸發載入動畫
          await this.page.reload({ waitUntil: 'networkidle2' });
          break;
          
        default:
          // 嘗試多種觸發方式
          await element.scrollIntoView();
          await this.page.waitForTimeout(200);
          await element.hover();
          await this.page.waitForTimeout(200);
          break;
      }
    } catch (error) {
      console.error(`觸發動畫失敗:`, error.message);
    }
  }

  async captureFullPageAnimation(pageUrl) {
    console.log(chalk.cyan(`📹 錄製整頁動畫: ${pageUrl}`));
    
    try {
      const videoFileName = `fullpage_${Date.now()}.webm`;
      const videoPath = path.join(__dirname, '../assets/raw', videoFileName);
      
      await this.page.goto(pageUrl, { waitUntil: 'networkidle2' });
      
      const recorder = new PuppeteerScreenRecorder(this.page);
      await recorder.start(videoPath);
      
      // 執行完整的頁面互動序列
      await this.performPageInteractions();
      
      await recorder.stop();
      
      console.log(chalk.green(`✅ 完整頁面錄製完成: ${videoFileName}`));
      
    } catch (error) {
      console.error(chalk.red('完整頁面錄製失敗:'), error.message);
    }
  }

  async performPageInteractions() {
    // 滾動頁面
    await this.page.evaluate(async () => {
      const scrollStep = 100;
      const scrollDelay = 200;
      
      for (let i = 0; i < document.body.scrollHeight; i += scrollStep) {
        window.scrollTo(0, i);
        await new Promise(resolve => setTimeout(resolve, scrollDelay));
      }
      
      // 滾回頂部
      window.scrollTo(0, 0);
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
    
    // 嘗試觸發 hover 效果
    const hoverElements = await this.page.$$('a, button, .hover, [data-hover]');
    for (let i = 0; i < Math.min(hoverElements.length, 5); i++) {
      try {
        await hoverElements[i].hover();
        await this.page.waitForTimeout(500);
      } catch (error) {
        // 忽略錯誤，繼續下一個元素
      }
    }
  }

  async updateAnimationData() {
    // 更新動畫資料檔案，加入資產路徑
    const outputPath = path.join(__dirname, '../output/animations_with_assets.json');
    await fs.ensureDir(path.dirname(outputPath));
    
    await fs.writeJson(outputPath, {
      capturedAt: new Date().toISOString(),
      totalAnimations: this.animations.length,
      animations: this.animations
    }, { spaces: 2 });
    
    console.log(chalk.green(`💾 已更新動畫資料: ${outputPath}`));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = VisualCapture;

// 如果直接執行此檔案
if (require.main === module) {
  (async () => {
    const capture = new VisualCapture();
    try {
      await capture.initialize();
      await capture.captureAllAnimations();
      await capture.updateAnimationData();
    } catch (error) {
      console.error(chalk.red('視覺擷取過程發生錯誤:'), error);
    } finally {
      await capture.close();
    }
  })();
}
