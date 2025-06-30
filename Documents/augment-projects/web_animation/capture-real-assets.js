#!/usr/bin/env node
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
      console.log(`📸 擷取: ${animation.slug}`);
      
      await page.goto(animation.sourcePage, { waitUntil: 'networkidle2' });
      
      // 尋找動畫元素
      let element;
      if (animation.webflowId) {
        element = await page.$(`[data-w-id="${animation.webflowId}"]`);
      } else if (animation.selector) {
        element = await page.$(animation.selector);
      }
      
      if (element) {
        // 擷取起始狀態
        await element.screenshot({ 
          path: `./assets/raw/${animation.assetPath.initialScreenshot}` 
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
          path: `./assets/raw/${animation.assetPath.finalScreenshot}` 
        });
      }
      
    } catch (error) {
      console.error(`❌ 擷取失敗 ${animation.slug}:`, error.message);
    }
  }
  
  await browser.close();
  console.log('✅ 真實視覺資產擷取完成');
}

if (require.main === module) {
  captureRealAssets().catch(console.error);
}
