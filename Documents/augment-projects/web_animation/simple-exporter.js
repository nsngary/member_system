const fs = require('fs-extra');
const path = require('path');

class SimpleExporter {
  constructor() {
    this.animations = [];
    this.outputDir = path.join(__dirname, 'output');
  }

  async loadAnimationData() {
    console.log('📊 載入動畫資料...');
    
    const dataFile = path.join(this.outputDir, 'animations_with_assets.json');
    
    if (await fs.pathExists(dataFile)) {
      const data = await fs.readJson(dataFile);
      this.animations = data.animations || [];
      console.log(`✅ 載入了 ${this.animations.length} 個動畫資料`);
    } else {
      console.log('⚠️  未找到完整的動畫資料，嘗試載入基礎資料...');
      
      const basicDataFile = path.join(this.outputDir, 'animations_detected.json');
      if (await fs.pathExists(basicDataFile)) {
        const data = await fs.readJson(basicDataFile);
        this.animations = data.animations || [];
        console.log(`✅ 載入了 ${this.animations.length} 個基礎動畫資料`);
      }
    }
  }

  generateMarkdownContent() {
    let md = '';
    
    // 標題
    md += '# DICH Fashion 網站動畫分析報告\n\n';
    md += `分析時間: ${new Date().toLocaleString('zh-TW')}\n\n`;
    md += `總計發現動畫效果: **${this.animations.length}** 個\n\n`;
    md += '---\n\n';
    
    // 統計資料
    const stats = this.generateStatistics();
    md += '## 動畫效果總覽\n\n';
    md += '### 統計資料\n\n';
    
    md += '| 類型 | 數量 | 百分比 |\n';
    md += '|------|------|--------|\n';
    Object.entries(stats.byType).forEach(([type, count]) => {
      const percentage = ((count / this.animations.length) * 100).toFixed(1);
      md += `| ${type} | ${count} | ${percentage}% |\n`;
    });
    md += '\n';
    
    md += '### 觸發方式分布\n\n';
    md += '| 觸發方式 | 數量 | 百分比 |\n';
    md += '|----------|------|--------|\n';
    Object.entries(stats.byTrigger).forEach(([trigger, count]) => {
      const percentage = ((count / this.animations.length) * 100).toFixed(1);
      md += `| ${trigger} | ${count} | ${percentage}% |\n`;
    });
    md += '\n';
    
    md += '### 技術實現分布\n\n';
    md += '| 技術 | 數量 | 百分比 |\n';
    md += '|------|------|--------|\n';
    Object.entries(stats.byTech).forEach(([tech, count]) => {
      const percentage = ((count / this.animations.length) * 100).toFixed(1);
      md += `| ${tech} | ${count} | ${percentage}% |\n`;
    });
    md += '\n';
    
    // 詳細動畫列表
    md += '---\n\n';
    md += '## 動畫效果詳細列表\n\n';
    
    // 按頁面分組
    const groupedByPage = this.groupAnimationsByPage();
    
    for (const [pageUrl, pageAnimations] of Object.entries(groupedByPage)) {
      md += `### 頁面: ${pageUrl}\n\n`;
      md += `此頁面共有 ${pageAnimations.length} 個動畫效果\n\n`;
      
      for (const animation of pageAnimations.slice(0, 10)) { // 限制每頁顯示前10個
        md += `#### 動畫 ${animation.slug}\n\n`;
        
        md += '| 屬性 | 值 |\n';
        md += '|------|----|\n';
        md += `| 唯一識別碼 (slug) | ${animation.slug} |\n`;
        md += `| 來源頁面 (sourcePage) | ${animation.sourcePage} |\n`;
        md += `| 觸發方式 (trigger) | ${animation.trigger} |\n`;
        md += `| 動畫類型 (type) | ${animation.type} |\n`;
        md += `| 技術實現 (tech) | ${animation.tech} |\n`;
        md += `| 緩動函數 (easing) | ${animation.easing || 'N/A'} |\n`;
        md += `| 持續時間 (duration) | ${animation.duration || 0}ms |\n`;
        md += `| 延遲時間 (delay) | ${animation.delay || 0}ms |\n`;
        md += `| 目標元素 (selector) | ${animation.selector || 'N/A'} |\n`;
        md += `| 程式碼位置 | ${animation.sourceLocation || 'N/A'} |\n`;
        md += '\n';
        
        // 程式碼片段
        if (animation.codeSnippet) {
          md += '##### 程式碼片段\n\n';
          md += '```css\n';
          md += animation.codeSnippet.substring(0, 300);
          if (animation.codeSnippet.length > 300) md += '...';
          md += '\n```\n\n';
        }
        
        // 視覺資產
        if (animation.assetPath) {
          md += '##### 視覺資產\n\n';
          
          if (animation.assetPath.initialScreenshot) {
            md += `**起始狀態截圖:** ![起始狀態](../assets/raw/${animation.assetPath.initialScreenshot})\n\n`;
          }
          
          if (animation.assetPath.finalScreenshot) {
            md += `**結束狀態截圖:** ![結束狀態](../assets/raw/${animation.assetPath.finalScreenshot})\n\n`;
          }
          
          if (animation.assetPath.video) {
            md += `**動畫影片:** [${animation.assetPath.video}](../assets/raw/${animation.assetPath.video})\n\n`;
          }
        }
        
        md += '---\n\n';
      }
      
      if (pageAnimations.length > 10) {
        md += `*此頁面還有 ${pageAnimations.length - 10} 個動畫效果，請查看 JSON 檔案獲取完整資料*\n\n`;
      }
    }
    
    // 附錄
    md += '## 附錄\n\n';
    md += '### 分析方法說明\n\n';
    md += '本報告使用以下技術進行動畫分析:\n\n';
    md += '- HTTP 爬取技術進行網頁內容獲取\n';
    md += '- Cheerio 進行 HTML/CSS 解析\n';
    md += '- CSS keyframes 和 animation 屬性分析\n';
    md += '- Webflow IX2 互動系統分析\n';
    md += '- GSAP 動畫庫檢測\n';
    md += '- 自訂 JavaScript 動畫模式識別\n';
    md += '- 視覺資產模擬生成\n\n';
    
    md += '### 技術限制\n\n';
    md += '- 某些動態載入的動畫可能未被完全捕獲\n';
    md += '- 複雜的 JavaScript 動畫邏輯可能需要人工驗證\n';
    md += '- 視覺擷取為模擬資料，實際檔案需要使用 puppeteer 進行擷取\n';
    md += '- 部分 Webflow 內部配置可能無法完全解析\n\n';
    
    return md;
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

  async exportToMarkdown() {
    console.log('📝 產生 Markdown 報告...');
    
    const mdContent = this.generateMarkdownContent();
    const outputPath = path.join(this.outputDir, 'animations_raw.md');
    
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, mdContent, 'utf8');
    
    console.log(`✅ Markdown 報告已產生: ${outputPath}`);
  }

  async exportToJSON() {
    console.log('📄 產生 JSON 資料檔案...');
    
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
        easing: animation.easing || 'ease',
        duration: animation.duration || 0,
        delay: animation.delay || 0,
        selector: animation.selector || '',
        codeSnippet: animation.codeSnippet || '',
        sourceLocation: animation.sourceLocation || '',
        assetPath: animation.assetPath || {},
        webflowId: animation.webflowId || null,
        keyframeName: animation.keyframeName || null
      }))
    };

    const outputPath = path.join(this.outputDir, 'animations_raw.json');
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeJson(outputPath, jsonData, { spaces: 2 });
    
    console.log(`✅ JSON 資料檔案已產生: ${outputPath}`);
  }

  async exportAll() {
    console.log('🚀 開始匯出所有資料...');
    
    await this.loadAnimationData();
    await this.exportToMarkdown();
    await this.exportToJSON();
    
    console.log('✅ 所有資料匯出完成！');
    
    // 顯示輸出檔案清單
    console.log('\n📁 產生的檔案:');
    console.log('  - animations_raw.md (詳細 Markdown 報告)');
    console.log('  - animations_raw.json (完整 JSON 資料)');
    console.log('  - sitemap.json (網站地圖)');
    console.log('  - animations_detected.json (偵測結果)');
    console.log('  - animations_with_assets.json (含視覺資產)');
    console.log('  - visual_assets_summary.json (視覺資產摘要)');
  }
}

// 執行
async function main() {
  const exporter = new SimpleExporter();
  try {
    await exporter.exportAll();
  } catch (error) {
    console.error('資料匯出過程發生錯誤:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = SimpleExporter;
