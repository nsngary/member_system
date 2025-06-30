const fs = require('fs-extra');
const path = require('path');

class VisualAssetGenerator {
  constructor() {
    this.animations = [];
    this.assetsDir = path.join(__dirname, 'assets/raw');
  }

  async loadAnimationData() {
    console.log('📊 載入動畫資料...');
    
    const animationFile = path.join(__dirname, 'output/animations_detected.json');
    
    if (await fs.pathExists(animationFile)) {
      const data = await fs.readJson(animationFile);
      this.animations = data.animations || [];
      console.log(`✅ 載入了 ${this.animations.length} 個動畫資料`);
    } else {
      console.log('❌ 未找到動畫資料檔案');
      return false;
    }
    
    return true;
  }

  async generateVisualAssets() {
    console.log('🎨 開始生成視覺資產資料...');
    
    await fs.ensureDir(this.assetsDir);
    
    // 為每個動畫生成資產路徑資訊
    for (let i = 0; i < this.animations.length; i++) {
      const animation = this.animations[i];
      
      // 生成資產檔案名稱
      const assetPath = {
        initialScreenshot: `${animation.slug}_initial.png`,
        finalScreenshot: `${animation.slug}_final.png`,
        video: `${animation.slug}_animation.webm`
      };
      
      // 更新動畫資料
      animation.assetPath = assetPath;
      
      // 生成模擬的資產檔案資訊
      await this.generateAssetInfo(animation);
      
      if ((i + 1) % 50 === 0) {
        console.log(`📸 已處理 ${i + 1}/${this.animations.length} 個動畫`);
      }
    }
    
    console.log('✅ 視覺資產資料生成完成');
  }

  async generateAssetInfo(animation) {
    // 生成資產資訊檔案
    const assetInfo = {
      slug: animation.slug,
      sourcePage: animation.sourcePage,
      type: animation.type,
      tech: animation.tech,
      trigger: animation.trigger,
      assets: {
        initialScreenshot: {
          filename: animation.assetPath.initialScreenshot,
          description: '動畫起始狀態截圖',
          dimensions: '1920x1080',
          format: 'PNG',
          size: '~500KB'
        },
        finalScreenshot: {
          filename: animation.assetPath.finalScreenshot,
          description: '動畫結束狀態截圖',
          dimensions: '1920x1080',
          format: 'PNG',
          size: '~500KB'
        },
        video: {
          filename: animation.assetPath.video,
          description: '動畫過程錄影',
          dimensions: '1920x1080',
          format: 'WebM',
          duration: `${animation.duration || 1000}ms`,
          size: '~2MB'
        }
      },
      captureSettings: {
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false
      },
      metadata: {
        capturedAt: new Date().toISOString(),
        captureMethod: 'simulated',
        notes: '由於網路連線限制，此為模擬的視覺資產資料'
      }
    };

    // 保存資產資訊
    const infoPath = path.join(this.assetsDir, `${animation.slug}_info.json`);
    await fs.writeJson(infoPath, assetInfo, { spaces: 2 });
  }

  async updateAnimationData() {
    console.log('💾 更新動畫資料...');
    
    // 更新動畫資料檔案，加入資產路徑
    const outputPath = path.join(__dirname, 'output/animations_with_assets.json');
    
    await fs.writeJson(outputPath, {
      capturedAt: new Date().toISOString(),
      totalAnimations: this.animations.length,
      note: '視覺資產為模擬資料，實際檔案需要使用 puppeteer 進行擷取',
      animations: this.animations
    }, { spaces: 2 });
    
    console.log(`✅ 已更新動畫資料: ${outputPath}`);
  }

  async generateAssetSummary() {
    console.log('📋 生成資產摘要...');
    
    const summary = {
      totalAnimations: this.animations.length,
      assetTypes: {
        screenshots: this.animations.length * 2, // 起始 + 結束
        videos: this.animations.length
      },
      byTech: {},
      byTrigger: {},
      byPage: {},
      estimatedStorage: {
        screenshots: `${(this.animations.length * 2 * 0.5).toFixed(1)}MB`,
        videos: `${(this.animations.length * 2).toFixed(1)}MB`,
        total: `${(this.animations.length * 2.5).toFixed(1)}MB`
      }
    };

    // 統計各種類型
    for (const animation of this.animations) {
      // 按技術統計
      summary.byTech[animation.tech] = (summary.byTech[animation.tech] || 0) + 1;
      
      // 按觸發方式統計
      summary.byTrigger[animation.trigger] = (summary.byTrigger[animation.trigger] || 0) + 1;
      
      // 按頁面統計
      summary.byPage[animation.sourcePage] = (summary.byPage[animation.sourcePage] || 0) + 1;
    }

    const summaryPath = path.join(__dirname, 'output/visual_assets_summary.json');
    await fs.writeJson(summaryPath, summary, { spaces: 2 });
    
    console.log(`✅ 資產摘要已保存: ${summaryPath}`);
    
    // 顯示統計資訊
    console.log('\n📊 視覺資產統計:');
    console.log(`總動畫數: ${summary.totalAnimations}`);
    console.log(`截圖數量: ${summary.assetTypes.screenshots}`);
    console.log(`影片數量: ${summary.assetTypes.videos}`);
    console.log(`預估儲存空間: ${summary.estimatedStorage.total}`);
    
    console.log('\n🔧 技術分布:');
    Object.entries(summary.byTech).forEach(([tech, count]) => {
      console.log(`  ${tech}: ${count} 個`);
    });
    
    console.log('\n⚡ 觸發方式分布:');
    Object.entries(summary.byTrigger).forEach(([trigger, count]) => {
      console.log(`  ${trigger}: ${count} 個`);
    });
  }

  async generateCaptureScript() {
    console.log('📝 生成實際擷取腳本...');
    
    const script = `#!/usr/bin/env node
// 實際視覺資產擷取腳本
// 此腳本可在網路環境穩定時執行，進行真實的視覺資產擷取

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

async function captureRealAssets() {
  console.log('🎥 開始真實視覺資產擷取...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // 載入動畫資料
  const animationData = await fs.readJson('./output/animations_with_assets.json');
  
  for (const animation of animationData.animations) {
    try {
      console.log(\`📸 擷取: \${animation.slug}\`);
      
      await page.goto(animation.sourcePage, { waitUntil: 'networkidle2' });
      
      // 尋找動畫元素
      let element;
      if (animation.webflowId) {
        element = await page.$(\`[data-w-id="\${animation.webflowId}"]\`);
      } else if (animation.selector) {
        element = await page.$(animation.selector);
      }
      
      if (element) {
        // 擷取起始狀態
        await element.screenshot({ 
          path: \`./assets/raw/\${animation.assetPath.initialScreenshot}\` 
        });
        
        // 觸發動畫並擷取
        if (animation.trigger === 'hover') {
          await element.hover();
        } else if (animation.trigger === 'click') {
          await element.click();
        }
        
        // 等待動畫完成
        await page.waitForTimeout(animation.duration || 1000);
        
        // 擷取結束狀態
        await element.screenshot({ 
          path: \`./assets/raw/\${animation.assetPath.finalScreenshot}\` 
        });
      }
      
    } catch (error) {
      console.error(\`❌ 擷取失敗 \${animation.slug}:\`, error.message);
    }
  }
  
  await browser.close();
  console.log('✅ 真實視覺資產擷取完成');
}

if (require.main === module) {
  captureRealAssets().catch(console.error);
}
`;

    const scriptPath = path.join(__dirname, 'capture-real-assets.js');
    await fs.writeFile(scriptPath, script);
    
    console.log(`✅ 實際擷取腳本已生成: ${scriptPath}`);
    console.log('💡 提示: 在網路環境穩定時可執行此腳本進行真實的視覺資產擷取');
  }

  async run() {
    console.log('🎬 視覺資產生成器啟動');
    
    const loaded = await this.loadAnimationData();
    if (!loaded) return;
    
    await this.generateVisualAssets();
    await this.updateAnimationData();
    await this.generateAssetSummary();
    await this.generateCaptureScript();
    
    console.log('✅ 視覺資產生成器完成');
  }
}

// 執行
async function main() {
  const generator = new VisualAssetGenerator();
  try {
    await generator.run();
  } catch (error) {
    console.error('視覺資產生成過程發生錯誤:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = VisualAssetGenerator;
