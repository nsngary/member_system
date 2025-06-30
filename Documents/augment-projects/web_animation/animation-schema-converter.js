#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// 簡單的顏色輸出函數，替代 chalk
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

class AnimationSchemaConverter {
  constructor() {
    this.rawAnimations = [];
    this.processedAnimations = [];
    this.animationGroups = new Map();
    this.duplicateMap = new Map();
  }

  async loadRawData() {
    console.log(colors.blue('📂 載入原始動畫資料...'));
    const rawPath = path.join(__dirname, 'output/animations_raw.json');
    const rawData = await fs.readFile(rawPath, 'utf8');
    const data = JSON.parse(rawData);
    this.rawAnimations = data.animations;
    console.log(colors.green(`✅ 載入了 ${this.rawAnimations.length} 個動畫`));
  }

  // 分析動畫效果類型
  analyzeAnimationType(animation) {
    const { codeSnippet, keyframeName, selector, type } = animation;
    const code = codeSnippet || '';
    const name = keyframeName || '';
    
    // 基於程式碼內容分析動畫類型
    if (code.includes('opacity') && code.includes('transform')) {
      if (code.includes('translateY') || code.includes('translate3d')) {
        return 'fade-slide';
      }
      if (code.includes('scale')) {
        return 'fade-scale';
      }
      return 'fade-transform';
    }
    
    if (code.includes('opacity') || name.includes('fade')) {
      return 'fade';
    }
    
    if (code.includes('scale') || name.includes('scale')) {
      return 'scale';
    }
    
    if (code.includes('translateY') || code.includes('translateX') || name.includes('slide')) {
      return 'slide';
    }
    
    if (code.includes('rotate') || name.includes('rotate')) {
      return 'rotate';
    }
    
    if (code.includes('backgroundColor') || code.includes('color')) {
      return 'color-change';
    }
    
    if (name.includes('marquee') || code.includes('marquee')) {
      return 'marquee';
    }
    
    if (name.includes('blink') || code.includes('blink')) {
      return 'blink';
    }
    
    // 基於選擇器分析
    if (selector.includes('preloader')) {
      return 'preloader';
    }
    
    if (selector.includes('lottie')) {
      return 'lottie';
    }
    
    if (selector.includes('cloud')) {
      return 'floating';
    }
    
    return 'generic';
  }

  // 生成動畫分類
  categorizeAnimation(animation, animationType) {
    const categories = [];
    
    // 基於觸發方式分類
    switch (animation.trigger) {
      case 'loading':
        categories.push('entrance');
        break;
      case 'scroll':
        categories.push('scroll');
        break;
      case 'hover':
        categories.push('hover');
        break;
      case 'click':
        categories.push('interaction');
        break;
    }
    
    // 基於動畫類型分類
    if (['fade', 'fade-slide', 'fade-scale'].includes(animationType)) {
      categories.push('entrance');
    }
    
    if (['slide', 'fade-slide'].includes(animationType)) {
      categories.push('movement');
    }
    
    if (['scale', 'fade-scale'].includes(animationType)) {
      categories.push('transform');
    }
    
    if (animationType === 'lottie') {
      categories.push('lottie');
    }
    
    if (animationType === 'preloader') {
      categories.push('loading');
    }
    
    return categories.length > 0 ? categories : ['general'];
  }

  // 生成標籤
  generateTags(animation, animationType) {
    const tags = [];
    
    // 基於頁面來源
    if (animation.sourcePage.includes('fashion')) {
      tags.push('fashion');
    }
    
    // 基於選擇器
    if (animation.selector.includes('hero')) {
      tags.push('hero-section');
    }
    
    if (animation.selector.includes('nav')) {
      tags.push('navigation');
    }
    
    if (animation.selector.includes('button')) {
      tags.push('button');
    }
    
    if (animation.selector.includes('image') || animation.selector.includes('img')) {
      tags.push('image');
    }
    
    // 基於技術
    tags.push(animation.tech.toLowerCase().replace(/\s+/g, '-'));
    
    return tags;
  }

  // 提取動畫屬性
  extractAnimationProps(animation) {
    const props = {
      duration: animation.duration || 600,
      delay: animation.delay || 0,
      easing: animation.easing || 'ease-out'
    };
    
    // 從程式碼中提取更多屬性
    const code = animation.codeSnippet || '';
    
    // 提取透明度
    const opacityMatch = code.match(/opacity:\s*([0-9.]+)/);
    if (opacityMatch) {
      props.opacityTo = parseFloat(opacityMatch[1]);
    }
    
    // 提取位移距離
    const translateMatch = code.match(/translateY?\(([^)]+)\)/);
    if (translateMatch) {
      props.distance = translateMatch[1];
    }
    
    // 提取縮放比例
    const scaleMatch = code.match(/scale\(([^)]+)\)/);
    if (scaleMatch) {
      props.scale = parseFloat(scaleMatch[1]);
    }
    
    return props;
  }

  // 生成程式碼
  generateCode(animation, animationType, props) {
    const code = {
      css: '',
      js: ''
    };
    
    // 基於動畫類型生成 CSS
    switch (animationType) {
      case 'fade':
        code.css = `
.fade-animation {
  opacity: 0;
  transition: opacity ${props.duration}ms ${props.easing};
}
.fade-animation.active {
  opacity: 1;
}`;
        break;
        
      case 'fade-slide':
        code.css = `
.fade-slide-animation {
  opacity: 0;
  transform: translateY(${props.distance || '40px'});
  transition: all ${props.duration}ms ${props.easing};
}
.fade-slide-animation.active {
  opacity: 1;
  transform: translateY(0);
}`;
        break;
        
      case 'scale':
        code.css = `
.scale-animation {
  transform: scale(${props.scale || 0.8});
  transition: transform ${props.duration}ms ${props.easing};
}
.scale-animation.active {
  transform: scale(1);
}`;
        break;
    }
    
    // 生成 JavaScript
    if (animation.type === 'gsap') {
      code.js = animation.codeSnippet;
    } else {
      code.js = `
// 基本 JavaScript 觸發
element.classList.add('active');`;
    }
    
    return code;
  }

  // 生成中文標籤
  generateChineseLabel(animationType, animation) {
    const labelMap = {
      'fade': '淡入',
      'fade-slide': '淡入上移',
      'fade-scale': '淡入縮放',
      'scale': '縮放',
      'slide': '滑動',
      'rotate': '旋轉',
      'color-change': '顏色變化',
      'marquee': '跑馬燈',
      'blink': '閃爍',
      'preloader': '預載動畫',
      'lottie': 'Lottie 動畫',
      'floating': '浮動效果',
      'generic': '通用動畫'
    };
    
    return labelMap[animationType] || '動畫效果';
  }

  // 檢查重複動畫
  findDuplicates() {
    console.log(colors.blue('🔍 分析重複動畫...'));

    const groups = new Map();

    this.rawAnimations.forEach(animation => {
      const animationType = this.analyzeAnimationType(animation);
      const key = `${animationType}-${animation.duration}-${animation.easing}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(animation);
    });

    // 找出有多個實例的組
    groups.forEach((animations, key) => {
      if (animations.length > 1) {
        this.animationGroups.set(key, animations);
        console.log(colors.yellow(`📦 發現重複組: ${key} (${animations.length} 個)`));
      }
    });

    console.log(colors.green(`✅ 發現 ${this.animationGroups.size} 個重複組`));
  }

  // 轉換為統一格式（含去重與變體處理）
  convertToSchema() {
    console.log(colors.blue('🔄 轉換為統一 Schema...'));

    const animationMap = new Map(); // 用於去重和歸類

    // 第一階段：分析和分組
    this.rawAnimations.forEach(animation => {
      const animationType = this.analyzeAnimationType(animation);
      const props = this.extractAnimationProps(animation);
      const categories = this.categorizeAnimation(animation, animationType);
      const tags = this.generateTags(animation, animationType);
      const code = this.generateCode(animation, animationType, props);
      const label = this.generateChineseLabel(animationType, animation);

      // 建立分組鍵（基於動畫類型和主要特徵）
      const groupKey = this.createGroupKey(animationType, animation);

      if (!animationMap.has(groupKey)) {
        // 建立主要動畫條目
        animationMap.set(groupKey, {
          id: animationType.replace(/_/g, '-'),
          label,
          category: categories,
          props,
          defaults: { ...props },
          code,
          preview: `/previews/${animation.slug}.mp4`,
          tags,
          variants: [],
          _source: {
            slug: animation.slug,
            sourcePage: animation.sourcePage,
            type: animation.type,
            tech: animation.tech,
            selector: animation.selector
          }
        });
      } else {
        // 加入變體
        const mainAnimation = animationMap.get(groupKey);
        const variant = {
          id: `${mainAnimation.id}-variant-${mainAnimation.variants.length + 1}`,
          props,
          preview: `/previews/${animation.slug}.mp4`,
          _source: {
            slug: animation.slug,
            sourcePage: animation.sourcePage,
            type: animation.type,
            tech: animation.tech,
            selector: animation.selector
          }
        };
        mainAnimation.variants.push(variant);
      }
    });

    // 第二階段：處理 ID 衝突
    const processedIds = new Set();
    animationMap.forEach((animation, groupKey) => {
      let id = animation.id;
      let counter = 1;
      while (processedIds.has(id)) {
        id = `${animation.id}-${counter}`;
        counter++;
      }
      processedIds.add(id);
      animation.id = id;

      this.processedAnimations.push(animation);
    });

    console.log(colors.green(`✅ 轉換完成，共 ${this.processedAnimations.length} 個主要動畫`));

    // 統計變體數量
    const totalVariants = this.processedAnimations.reduce((sum, anim) => sum + anim.variants.length, 0);
    console.log(colors.green(`📦 包含 ${totalVariants} 個變體`));
  }

  // 建立分組鍵
  createGroupKey(animationType, animation) {
    // 基於動畫類型、觸發方式和主要特徵建立分組鍵
    const trigger = animation.trigger || 'unknown';
    const tech = animation.tech || 'unknown';

    // 對於相似的動畫效果，使用相同的分組鍵
    let groupType = animationType;

    // 特殊處理：將相似的動畫歸為同一組
    if (animationType.includes('fade')) {
      groupType = 'fade';
    } else if (animationType.includes('scale')) {
      groupType = 'scale';
    } else if (animationType.includes('slide')) {
      groupType = 'slide';
    } else if (animationType === 'lottie') {
      groupType = 'lottie';
    } else if (animationType === 'preloader') {
      groupType = 'preloader';
    }

    return `${groupType}-${trigger}`;
  }

  // 儲存結果
  async saveSchema() {
    console.log(colors.blue('💾 儲存 Schema...'));

    const schema = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      totalAnimations: this.processedAnimations.length,
      animations: this.processedAnimations
    };

    const outputPath = path.join(__dirname, 'animations.schema.json');
    await fs.writeFile(outputPath, JSON.stringify(schema, null, 2), 'utf8');

    console.log(colors.green(`✅ Schema 已儲存至: ${outputPath}`));
  }

  // 主要執行函數
  async run() {
    try {
      console.log(colors.cyan('🚀 開始動畫 Schema 轉換...'));

      await this.loadRawData();
      this.findDuplicates();
      this.convertToSchema();
      await this.saveSchema();

      console.log(colors.green('🎉 轉換完成！'));

    } catch (error) {
      console.error(colors.red('❌ 轉換失敗:'), error);
      process.exit(1);
    }
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  const converter = new AnimationSchemaConverter();
  converter.run();
}

module.exports = AnimationSchemaConverter;
