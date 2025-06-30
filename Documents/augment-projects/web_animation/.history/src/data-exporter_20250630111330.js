const fs = require('fs-extra');
const path = require('path');
const json2md = require('json2md');

class DataExporter {
  constructor() {
    this.animations = [];
    this.outputDir = path.join(__dirname, '../output');
    this.assetsDir = path.join(__dirname, '../assets');
  }

  async loadAnimationData() {
    console.log(chalk.blue('📊 載入動畫資料...'));
    
    const dataFile = path.join(this.outputDir, 'animations_with_assets.json');
    
    if (await fs.pathExists(dataFile)) {
      const data = await fs.readJson(dataFile);
      this.animations = data.animations || [];
      console.log(chalk.green(`✅ 載入了 ${this.animations.length} 個動畫資料`));
    } else {
      console.log(chalk.yellow('⚠️  未找到完整的動畫資料，嘗試載入基礎資料...'));
      
      const basicDataFile = path.join(this.outputDir, 'animations_detected.json');
      if (await fs.pathExists(basicDataFile)) {
        const data = await fs.readJson(basicDataFile);
        this.animations = data.animations || [];
        console.log(chalk.green(`✅ 載入了 ${this.animations.length} 個基礎動畫資料`));
      }
    }
  }

  async exportToMarkdown() {
    console.log(chalk.blue('📝 產生 Markdown 報告...'));
    
    const mdContent = this.generateMarkdownContent();
    const outputPath = path.join(this.outputDir, 'animations_raw.md');
    
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, mdContent, 'utf8');
    
    console.log(chalk.green(`✅ Markdown 報告已產生: ${outputPath}`));
  }

  generateMarkdownContent() {
    const mdData = [
      { h1: 'DICH Fashion 網站動畫分析報告' },
      { p: `分析時間: ${new Date().toLocaleString('zh-TW')}` },
      { p: `總計發現動畫效果: **${this.animations.length}** 個` },
      { hr: '' },
      { h2: '動畫效果總覽' }
    ];

    // 統計資料
    const stats = this.generateStatistics();
    mdData.push({ h3: '統計資料' });
    mdData.push({
      table: {
        headers: ['類型', '數量', '百分比'],
        rows: Object.entries(stats.byType).map(([type, count]) => [
          type,
          count.toString(),
          `${((count / this.animations.length) * 100).toFixed(1)}%`
        ])
      }
    });

    mdData.push({ h3: '觸發方式分布' });
    mdData.push({
      table: {
        headers: ['觸發方式', '數量', '百分比'],
        rows: Object.entries(stats.byTrigger).map(([trigger, count]) => [
          trigger,
          count.toString(),
          `${((count / this.animations.length) * 100).toFixed(1)}%`
        ])
      }
    });

    mdData.push({ h3: '技術實現分布' });
    mdData.push({
      table: {
        headers: ['技術', '數量', '百分比'],
        rows: Object.entries(stats.byTech).map(([tech, count]) => [
          tech,
          count.toString(),
          `${((count / this.animations.length) * 100).toFixed(1)}%`
        ])
      }
    });

    // 詳細動畫列表
    mdData.push({ hr: '' });
    mdData.push({ h2: '動畫效果詳細列表' });

    // 按頁面分組
    const groupedByPage = this.groupAnimationsByPage();
    
    for (const [pageUrl, pageAnimations] of Object.entries(groupedByPage)) {
      mdData.push({ h3: `頁面: ${pageUrl}` });
      mdData.push({ p: `此頁面共有 ${pageAnimations.length} 個動畫效果` });

      for (const animation of pageAnimations) {
        mdData.push({ h4: `動畫 ${animation.slug}` });
        
        // 基本資訊表格
        const animationInfo = [
          ['屬性', '值'],
          ['唯一識別碼 (slug)', animation.slug],
          ['來源頁面 (sourcePage)', animation.sourcePage],
          ['觸發方式 (trigger)', animation.trigger],
          ['動畫類型 (type)', animation.type],
          ['技術實現 (tech)', animation.tech],
          ['緩動函數 (easing)', animation.easing],
          ['持續時間 (duration)', `${animation.duration}ms`],
          ['延遲時間 (delay)', `${animation.delay}ms`],
          ['目標元素 (selector)', animation.selector || 'N/A'],
          ['程式碼位置', animation.sourceLocation || 'N/A']
        ];

        mdData.push({
          table: {
            headers: animationInfo[0],
            rows: animationInfo.slice(1)
          }
        });

        // 程式碼片段
        if (animation.codeSnippet) {
          mdData.push({ h5: '程式碼片段' });
          mdData.push({ code: { language: 'css', content: animation.codeSnippet } });
        }

        // 視覺資產
        if (animation.assetPath) {
          mdData.push({ h5: '視覺資產' });
          
          if (animation.assetPath.initialScreenshot) {
            mdData.push({ p: '**起始狀態截圖:**' });
            mdData.push({ img: { title: '起始狀態', source: `../assets/raw/${animation.assetPath.initialScreenshot}` } });
          }
          
          if (animation.assetPath.finalScreenshot) {
            mdData.push({ p: '**結束狀態截圖:**' });
            mdData.push({ img: { title: '結束狀態', source: `../assets/raw/${animation.assetPath.finalScreenshot}` } });
          }
          
          if (animation.assetPath.video) {
            mdData.push({ p: `**動畫影片:** [${animation.assetPath.video}](../assets/raw/${animation.assetPath.video})` });
          }
        }

        mdData.push({ hr: '' });
      }
    }

    // 附錄
    mdData.push({ h2: '附錄' });
    mdData.push({ h3: '分析方法說明' });
    mdData.push({ p: '本報告使用以下技術進行動畫分析:' });
    mdData.push({
      ul: [
        'Puppeteer 無頭瀏覽器進行網頁爬取',
        'Cheerio 進行 HTML/CSS 解析',
        'CSS keyframes 和 animation 屬性分析',
        'Webflow IX2 互動系統分析',
        'GSAP 動畫庫檢測',
        '自訂 JavaScript 動畫模式識別',
        '視覺資產自動擷取和錄製'
      ]
    });

    mdData.push({ h3: '技術限制' });
    mdData.push({
      ul: [
        '某些動態載入的動畫可能未被完全捕獲',
        '複雜的 JavaScript 動畫邏輯可能需要人工驗證',
        '視覺擷取依賴於動畫觸發的成功率',
        '部分 Webflow 內部配置可能無法完全解析'
      ]
    });

    return json2md(mdData);
  }

  generateStatistics() {
    const stats = {
      byType: {},
      byTrigger: {},
      byTech: {},
      byPage: {}
    };

    for (const animation of this.animations) {
      // 按類型統計
      stats.byType[animation.type] = (stats.byType[animation.type] || 0) + 1;
      
      // 按觸發方式統計
      stats.byTrigger[animation.trigger] = (stats.byTrigger[animation.trigger] || 0) + 1;
      
      // 按技術統計
      stats.byTech[animation.tech] = (stats.byTech[animation.tech] || 0) + 1;
      
      // 按頁面統計
      stats.byPage[animation.sourcePage] = (stats.byPage[animation.sourcePage] || 0) + 1;
    }

    return stats;
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

  async exportToJSON() {
    console.log(chalk.blue('📄 產生 JSON 資料檔案...'));
    
    const jsonData = {
      metadata: {
        siteName: 'DICH Fashion',
        siteUrl: 'https://dich-fashion.webflow.io/',
        analyzedAt: new Date().toISOString(),
        totalAnimations: this.animations.length,
        analyzer: 'Analyzer Agent v1.0'
      },
      statistics: this.generateStatistics(),
      animations: this.animations.map(animation => ({
        slug: animation.slug,
        sourcePage: animation.sourcePage,
        trigger: animation.trigger,
        type: animation.type,
        tech: animation.tech,
        easing: animation.easing,
        duration: animation.duration,
        delay: animation.delay,
        selector: animation.selector,
        codeSnippet: animation.codeSnippet,
        sourceLocation: animation.sourceLocation,
        assetPath: animation.assetPath || {},
        rawData: animation.rawData || {}
      }))
    };

    const outputPath = path.join(this.outputDir, 'animations_raw.json');
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeJson(outputPath, jsonData, { spaces: 2 });
    
    console.log(chalk.green(`✅ JSON 資料檔案已產生: ${outputPath}`));
  }

  async generateSummaryReport() {
    console.log(chalk.blue('📋 產生摘要報告...'));
    
    const stats = this.generateStatistics();
    const summary = {
      title: 'DICH Fashion 動畫分析摘要',
      analyzedAt: new Date().toISOString(),
      overview: {
        totalAnimations: this.animations.length,
        totalPages: Object.keys(stats.byPage).length,
        mostCommonType: this.getMostCommon(stats.byType),
        mostCommonTrigger: this.getMostCommon(stats.byTrigger),
        mostCommonTech: this.getMostCommon(stats.byTech)
      },
      recommendations: this.generateRecommendations(stats),
      nextSteps: [
        '檢視並驗證自動偵測的動畫效果',
        '優化動畫效能和使用者體驗',
        '考慮統一動畫風格和技術實現',
        '建立動畫效果的設計系統'
      ]
    };

    const outputPath = path.join(this.outputDir, 'analysis_summary.json');
    await fs.writeJson(outputPath, summary, { spaces: 2 });
    
    console.log(chalk.green(`✅ 摘要報告已產生: ${outputPath}`));
  }

  getMostCommon(obj) {
    let maxCount = 0;
    let mostCommon = '';
    
    for (const [key, count] of Object.entries(obj)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = key;
      }
    }
    
    return { name: mostCommon, count: maxCount };
  }

  generateRecommendations(stats) {
    const recommendations = [];
    
    // 基於統計資料產生建議
    if (stats.byTech['CSS keyframes'] > stats.byTech['GSAP']) {
      recommendations.push('考慮使用 GSAP 來提升動畫效能和控制能力');
    }
    
    if (stats.byTrigger['unknown'] > 0) {
      recommendations.push('有部分動畫的觸發方式無法確定，建議人工檢視');
    }
    
    if (Object.keys(stats.byType).length > 5) {
      recommendations.push('動畫類型較為分散，建議建立統一的動畫設計規範');
    }
    
    return recommendations;
  }

  async exportAll() {
    console.log(chalk.blue('🚀 開始匯出所有資料...'));
    
    await this.loadAnimationData();
    await this.exportToMarkdown();
    await this.exportToJSON();
    await this.generateSummaryReport();
    
    console.log(chalk.green('✅ 所有資料匯出完成！'));
    
    // 顯示輸出檔案清單
    console.log(chalk.cyan('\n📁 產生的檔案:'));
    console.log(chalk.white('  - animations_raw.md (詳細 Markdown 報告)'));
    console.log(chalk.white('  - animations_raw.json (完整 JSON 資料)'));
    console.log(chalk.white('  - analysis_summary.json (分析摘要)'));
    console.log(chalk.white('  - sitemap.json (網站地圖)'));
    console.log(chalk.white('  - animations_detected.json (偵測結果)'));
    console.log(chalk.white('  - animations_with_assets.json (含視覺資產)'));
  }
}

module.exports = DataExporter;

// 如果直接執行此檔案
if (require.main === module) {
  (async () => {
    const exporter = new DataExporter();
    try {
      await exporter.exportAll();
    } catch (error) {
      console.error(chalk.red('資料匯出過程發生錯誤:'), error);
    }
  })();
}
