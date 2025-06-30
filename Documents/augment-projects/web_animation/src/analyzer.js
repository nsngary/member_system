const chalk = require('chalk');
const WebsiteCrawler = require('./crawler');
const AnimationDetector = require('./animation-detector');
const VisualCapture = require('./visual-capture');
const DataExporter = require('./data-exporter');

class DichFashionAnalyzer {
  constructor() {
    this.crawler = new WebsiteCrawler();
    this.detector = new AnimationDetector();
    this.capture = new VisualCapture();
    this.exporter = new DataExporter();
    
    this.startTime = Date.now();
  }

  async run() {
    console.log(chalk.bold.blue('🎯 DICH Fashion 動畫分析器啟動'));
    console.log(chalk.blue('目標網站: https://dich-fashion.webflow.io/'));
    console.log(chalk.blue('分析開始時間:'), new Date().toLocaleString('zh-TW'));
    console.log(chalk.yellow('=' .repeat(60)));

    try {
      // 階段 1: 網站爬取
      await this.phase1_WebsiteCrawling();
      
      // 階段 2: 動畫偵測與分析
      await this.phase2_AnimationDetection();
      
      // 階段 3: 視覺資產擷取
      await this.phase3_VisualCapture();
      
      // 階段 4: 資料匯出
      await this.phase4_DataExport();
      
      // 完成報告
      await this.generateFinalReport();
      
    } catch (error) {
      console.error(chalk.red('❌ 分析過程發生嚴重錯誤:'), error);
      throw error;
    }
  }

  async phase1_WebsiteCrawling() {
    console.log(chalk.bold.cyan('\n📡 階段 1: 網站結構分析與內容爬取'));
    console.log(chalk.cyan('正在初始化爬蟲...'));
    
    try {
      await this.crawler.initialize();
      console.log(chalk.green('✅ 爬蟲初始化完成'));
      
      console.log(chalk.cyan('開始發現網站路由...'));
      const routes = await this.crawler.discoverRoutes();
      console.log(chalk.green(`✅ 發現 ${routes.length} 個路由`));
      
      console.log(chalk.cyan('開始深度爬取所有頁面...'));
      const pages = await this.crawler.crawlAllPages();
      console.log(chalk.green(`✅ 成功爬取 ${pages.length} 個頁面`));
      
      await this.crawler.close();
      console.log(chalk.green('✅ 階段 1 完成 - 網站內容已全部下載'));
      
    } catch (error) {
      console.error(chalk.red('❌ 階段 1 失敗:'), error.message);
      throw error;
    }
  }

  async phase2_AnimationDetection() {
    console.log(chalk.bold.cyan('\n🔍 階段 2: 動畫偵測與分析'));
    console.log(chalk.cyan('開始分析頁面中的動畫效果...'));
    
    try {
      const animations = await this.detector.analyzeAllPages();
      console.log(chalk.green(`✅ 偵測到 ${animations.length} 個動畫效果`));
      
      await this.detector.saveResults();
      console.log(chalk.green('✅ 階段 2 完成 - 動畫分析結果已保存'));
      
      // 顯示統計資訊
      this.displayAnimationStats(animations);
      
    } catch (error) {
      console.error(chalk.red('❌ 階段 2 失敗:'), error.message);
      throw error;
    }
  }

  async phase3_VisualCapture() {
    console.log(chalk.bold.cyan('\n📸 階段 3: 視覺資產擷取'));
    console.log(chalk.cyan('開始擷取動畫的視覺資產...'));
    
    try {
      await this.capture.initialize();
      console.log(chalk.green('✅ 視覺擷取器初始化完成'));
      
      await this.capture.captureAllAnimations();
      console.log(chalk.green('✅ 所有動畫視覺資產擷取完成'));
      
      await this.capture.updateAnimationData();
      console.log(chalk.green('✅ 動畫資料已更新視覺資產路徑'));
      
      await this.capture.close();
      console.log(chalk.green('✅ 階段 3 完成 - 視覺資產已全部擷取'));
      
    } catch (error) {
      console.error(chalk.red('❌ 階段 3 失敗:'), error.message);
      console.log(chalk.yellow('⚠️  視覺擷取失敗，但分析將繼續進行'));
    }
  }

  async phase4_DataExport() {
    console.log(chalk.bold.cyan('\n📊 階段 4: 資料結構化輸出'));
    console.log(chalk.cyan('開始產生最終報告...'));
    
    try {
      await this.exporter.exportAll();
      console.log(chalk.green('✅ 階段 4 完成 - 所有報告已產生'));
      
    } catch (error) {
      console.error(chalk.red('❌ 階段 4 失敗:'), error.message);
      throw error;
    }
  }

  displayAnimationStats(animations) {
    console.log(chalk.yellow('\n📊 動畫統計資訊:'));
    
    // 按技術分類統計
    const techStats = {};
    const typeStats = {};
    const triggerStats = {};
    
    for (const animation of animations) {
      techStats[animation.tech] = (techStats[animation.tech] || 0) + 1;
      typeStats[animation.type] = (typeStats[animation.type] || 0) + 1;
      triggerStats[animation.trigger] = (triggerStats[animation.trigger] || 0) + 1;
    }
    
    console.log(chalk.white('技術實現分布:'));
    for (const [tech, count] of Object.entries(techStats)) {
      console.log(chalk.white(`  - ${tech}: ${count} 個`));
    }
    
    console.log(chalk.white('動畫類型分布:'));
    for (const [type, count] of Object.entries(typeStats)) {
      console.log(chalk.white(`  - ${type}: ${count} 個`));
    }
    
    console.log(chalk.white('觸發方式分布:'));
    for (const [trigger, count] of Object.entries(triggerStats)) {
      console.log(chalk.white(`  - ${trigger}: ${count} 個`));
    }
  }

  async generateFinalReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);
    
    console.log(chalk.yellow('=' .repeat(60)));
    console.log(chalk.bold.green('🎉 DICH Fashion 動畫分析完成！'));
    console.log(chalk.green('分析結束時間:'), new Date().toLocaleString('zh-TW'));
    console.log(chalk.green('總耗時:'), `${duration} 秒`);
    
    console.log(chalk.bold.yellow('\n📁 產生的檔案:'));
    console.log(chalk.white('  📄 output/animations_raw.md - 詳細 Markdown 報告'));
    console.log(chalk.white('  📄 output/animations_raw.json - 完整 JSON 資料'));
    console.log(chalk.white('  📄 output/analysis_summary.json - 分析摘要'));
    console.log(chalk.white('  📄 output/sitemap.json - 網站地圖'));
    console.log(chalk.white('  📁 assets/raw/ - 視覺資產 (截圖與影片)'));
    
    console.log(chalk.bold.yellow('\n🔄 後續步驟:'));
    console.log(chalk.white('  1. 檢視 animations_raw.md 了解詳細分析結果'));
    console.log(chalk.white('  2. 驗證自動偵測的動畫效果準確性'));
    console.log(chalk.white('  3. 建立 analysis/ 分支並提交結果'));
    console.log(chalk.white('  4. 請求 @Reviewer 進行審查'));
    
    console.log(chalk.bold.blue('\n✨ 分析器任務完成！'));
  }

  // 錯誤處理和清理
  async cleanup() {
    try {
      if (this.crawler.browser) {
        await this.crawler.close();
      }
      if (this.capture.browser) {
        await this.capture.close();
      }
    } catch (error) {
      console.error(chalk.red('清理過程發生錯誤:'), error.message);
    }
  }
}

// 主程式入口
async function main() {
  const analyzer = new DichFashionAnalyzer();
  
  // 設置錯誤處理
  process.on('SIGINT', async () => {
    console.log(chalk.yellow('\n⚠️  收到中斷信號，正在清理...'));
    await analyzer.cleanup();
    process.exit(0);
  });
  
  process.on('unhandledRejection', async (reason, promise) => {
    console.error(chalk.red('未處理的 Promise 拒絕:'), reason);
    await analyzer.cleanup();
    process.exit(1);
  });
  
  try {
    await analyzer.run();
  } catch (error) {
    console.error(chalk.red('分析器執行失敗:'), error);
    await analyzer.cleanup();
    process.exit(1);
  }
}

// 如果直接執行此檔案
if (require.main === module) {
  main();
}

module.exports = DichFashionAnalyzer;
