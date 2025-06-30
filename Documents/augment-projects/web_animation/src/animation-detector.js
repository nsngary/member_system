const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const chalk = require('chalk');

class AnimationDetector {
  constructor() {
    this.animations = [];
    this.animationCounter = 0;
  }

  async analyzeAllPages() {
    console.log(chalk.blue('🔍 開始分析所有頁面的動畫...'));
    
    const rawDir = path.join(__dirname, '../assets/raw');
    const files = await fs.readdir(rawDir);
    const pageFiles = files.filter(file => file.startsWith('page_') && file.endsWith('.json'));
    
    for (const file of pageFiles) {
      const filePath = path.join(rawDir, file);
      const pageData = await fs.readJson(filePath);
      
      console.log(chalk.cyan(`📄 分析頁面: ${pageData.url}`));
      await this.analyzePage(pageData);
    }
    
    console.log(chalk.green(`✅ 動畫分析完成！發現 ${this.animations.length} 個動畫效果`));
    return this.animations;
  }

  async analyzePage(pageData) {
    const $ = cheerio.load(pageData.html);
    
    // 分析 CSS 動畫
    await this.detectCSSAnimations(pageData, $);
    
    // 分析 Webflow IX2 動畫
    await this.detectWebflowAnimations(pageData, $);
    
    // 分析 GSAP 動畫
    await this.detectGSAPAnimations(pageData, $);
    
    // 分析自訂 JavaScript 動畫
    await this.detectCustomJSAnimations(pageData, $);
  }

  async detectCSSAnimations(pageData, $) {
    // 檢查 CSS keyframes
    for (const stylesheet of pageData.stylesheets) {
      if (stylesheet.rules) {
        for (let i = 0; i < stylesheet.rules.length; i++) {
          const rule = stylesheet.rules[i];
          
          // 檢測 @keyframes
          if (rule.includes('@keyframes')) {
            const keyframeName = this.extractKeyframeName(rule);
            if (keyframeName) {
              await this.createAnimationEntry({
                type: 'keyframes',
                tech: 'CSS keyframes',
                sourcePage: pageData.url,
                keyframeName,
                rule,
                lineNumber: i + 1,
                file: stylesheet.href || 'inline'
              });
            }
          }
          
          // 檢測 animation 屬性
          if (rule.includes('animation:') || rule.includes('animation-')) {
            const selector = this.extractSelector(rule);
            const animationProps = this.extractAnimationProperties(rule);
            
            if (animationProps.name) {
              await this.createAnimationEntry({
                type: 'css-animation',
                tech: 'CSS Animation',
                sourcePage: pageData.url,
                selector,
                ...animationProps,
                rule,
                lineNumber: i + 1,
                file: stylesheet.href || 'inline'
              });
            }
          }
          
          // 檢測 transition 屬性
          if (rule.includes('transition')) {
            const selector = this.extractSelector(rule);
            const transitionProps = this.extractTransitionProperties(rule);
            
            await this.createAnimationEntry({
              type: 'css-transition',
              tech: 'CSS Transition',
              sourcePage: pageData.url,
              selector,
              ...transitionProps,
              rule,
              lineNumber: i + 1,
              file: stylesheet.href || 'inline'
            });
          }
        }
      }
    }

    // 檢查內聯樣式中的動畫
    $('[style*="animation"], [style*="transition"]').each((i, element) => {
      const $el = $(element);
      const style = $el.attr('style');
      const selector = this.generateSelector($el);
      
      if (style.includes('animation')) {
        const animationProps = this.extractAnimationProperties(style);
        this.createAnimationEntry({
          type: 'inline-animation',
          tech: 'CSS Animation (inline)',
          sourcePage: pageData.url,
          selector,
          ...animationProps,
          rule: style,
          file: 'inline-style'
        });
      }
      
      if (style.includes('transition')) {
        const transitionProps = this.extractTransitionProperties(style);
        this.createAnimationEntry({
          type: 'inline-transition',
          tech: 'CSS Transition (inline)',
          sourcePage: pageData.url,
          selector,
          ...transitionProps,
          rule: style,
          file: 'inline-style'
        });
      }
    });
  }

  async detectWebflowAnimations(pageData, $) {
    // 檢查 Webflow IX2 資料屬性
    $('[data-w-id]').each((i, element) => {
      const $el = $(element);
      const wId = $el.attr('data-w-id');
      const selector = this.generateSelector($el);
      
      this.createAnimationEntry({
        type: 'webflow-ix2',
        tech: 'Webflow IX2',
        sourcePage: pageData.url,
        selector,
        webflowId: wId,
        trigger: this.detectTriggerType($el),
        file: 'webflow-interactions'
      });
    });

    // 檢查 Webflow 腳本中的動畫配置
    for (const script of pageData.scripts) {
      if (script.content && script.content.includes('Webflow')) {
        const webflowConfig = this.extractWebflowConfig(script.content);
        if (webflowConfig) {
          this.createAnimationEntry({
            type: 'webflow-config',
            tech: 'Webflow IX2',
            sourcePage: pageData.url,
            config: webflowConfig,
            file: script.src || 'inline-script'
          });
        }
      }
    }
  }

  async detectGSAPAnimations(pageData, $) {
    // 檢查 GSAP 腳本
    const gsapScripts = pageData.scripts.filter(script => 
      script.src && (script.src.includes('gsap') || script.src.includes('greensock')) ||
      script.content && (script.content.includes('gsap') || script.content.includes('TweenMax') || script.content.includes('TimelineMax'))
    );

    for (const script of gsapScripts) {
      if (script.content) {
        const gsapAnimations = this.extractGSAPAnimations(script.content);
        for (const animation of gsapAnimations) {
          this.createAnimationEntry({
            type: 'gsap',
            tech: 'GSAP',
            sourcePage: pageData.url,
            ...animation,
            file: script.src || 'inline-script'
          });
        }
      }
    }
  }

  async detectCustomJSAnimations(pageData, $) {
    // 檢查自訂 JavaScript 動畫
    for (const script of pageData.scripts) {
      if (script.content) {
        const customAnimations = this.extractCustomAnimations(script.content);
        for (const animation of customAnimations) {
          this.createAnimationEntry({
            type: 'custom-js',
            tech: 'JavaScript 自訂',
            sourcePage: pageData.url,
            ...animation,
            file: script.src || 'inline-script'
          });
        }
      }
    }
  }

  async createAnimationEntry(animationData) {
    this.animationCounter++;
    
    const animation = {
      slug: `anim_${this.animationCounter.toString().padStart(3, '0')}`,
      sourcePage: animationData.sourcePage,
      trigger: animationData.trigger || this.inferTrigger(animationData),
      type: this.classifyAnimationType(animationData),
      tech: animationData.tech,
      easing: animationData.easing || 'ease',
      duration: animationData.duration || 0,
      delay: animationData.delay || 0,
      selector: animationData.selector || '',
      codeSnippet: this.generateCodeSnippet(animationData),
      sourceLocation: `${animationData.file}:${animationData.lineNumber || 'unknown'}`,
      rawData: animationData
    };
    
    this.animations.push(animation);
    console.log(chalk.green(`✨ 發現動畫: ${animation.slug} (${animation.type})`));
  }

  extractKeyframeName(rule) {
    const match = rule.match(/@keyframes\s+([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  extractSelector(rule) {
    const match = rule.match(/^([^{]+)\s*{/);
    return match ? match[1].trim() : '';
  }

  extractAnimationProperties(cssText) {
    const props = {};
    
    // 提取動畫名稱
    const nameMatch = cssText.match(/animation(?:-name)?:\s*([^;,\s]+)/);
    if (nameMatch) props.name = nameMatch[1];
    
    // 提取持續時間
    const durationMatch = cssText.match(/animation(?:-duration)?:\s*([0-9.]+)(s|ms)/);
    if (durationMatch) {
      props.duration = parseFloat(durationMatch[1]) * (durationMatch[2] === 's' ? 1000 : 1);
    }
    
    // 提取延遲
    const delayMatch = cssText.match(/animation(?:-delay)?:\s*([0-9.]+)(s|ms)/);
    if (delayMatch) {
      props.delay = parseFloat(delayMatch[1]) * (delayMatch[2] === 's' ? 1000 : 1);
    }
    
    // 提取緩動函數
    const easingMatch = cssText.match(/animation(?:-timing-function)?:\s*([^;,]+)/);
    if (easingMatch) props.easing = easingMatch[1].trim();
    
    return props;
  }

  extractTransitionProperties(cssText) {
    const props = {};
    
    // 提取過渡屬性
    const propertyMatch = cssText.match(/transition(?:-property)?:\s*([^;,]+)/);
    if (propertyMatch) props.property = propertyMatch[1].trim();
    
    // 提取持續時間
    const durationMatch = cssText.match(/transition(?:-duration)?:\s*([0-9.]+)(s|ms)/);
    if (durationMatch) {
      props.duration = parseFloat(durationMatch[1]) * (durationMatch[2] === 's' ? 1000 : 1);
    }
    
    // 提取緩動函數
    const easingMatch = cssText.match(/transition(?:-timing-function)?:\s*([^;,]+)/);
    if (easingMatch) props.easing = easingMatch[1].trim();
    
    return props;
  }

  generateSelector($element) {
    let selector = $element.prop('tagName').toLowerCase();
    
    if ($element.attr('id')) {
      selector += '#' + $element.attr('id');
    }
    
    if ($element.attr('class')) {
      selector += '.' + $element.attr('class').split(' ').join('.');
    }
    
    return selector;
  }

  detectTriggerType($element) {
    // 根據元素屬性和類名推斷觸發類型
    const classes = $element.attr('class') || '';
    const dataAttrs = Object.keys($element.data());
    
    if (classes.includes('scroll') || dataAttrs.some(attr => attr.includes('scroll'))) {
      return 'scroll';
    }
    
    if (classes.includes('hover') || dataAttrs.some(attr => attr.includes('hover'))) {
      return 'hover';
    }
    
    if (classes.includes('click') || dataAttrs.some(attr => attr.includes('click'))) {
      return 'click';
    }
    
    if (classes.includes('load') || dataAttrs.some(attr => attr.includes('load'))) {
      return 'loading';
    }
    
    return 'unknown';
  }

  extractWebflowConfig(scriptContent) {
    // 提取 Webflow 配置（簡化版本）
    try {
      const configMatch = scriptContent.match(/Webflow\.push\(([^)]+)\)/);
      if (configMatch) {
        return JSON.parse(configMatch[1]);
      }
    } catch (error) {
      // 忽略解析錯誤
    }
    return null;
  }

  extractGSAPAnimations(scriptContent) {
    const animations = [];
    
    // 簡化的 GSAP 動畫提取
    const gsapMethods = ['gsap.to', 'gsap.from', 'gsap.fromTo', 'TweenMax.to', 'TweenMax.from'];
    
    for (const method of gsapMethods) {
      const regex = new RegExp(`${method.replace('.', '\\.')}\\s*\\([^)]+\\)`, 'g');
      const matches = scriptContent.match(regex);
      
      if (matches) {
        for (const match of matches) {
          animations.push({
            method,
            code: match,
            selector: this.extractGSAPSelector(match),
            duration: this.extractGSAPDuration(match)
          });
        }
      }
    }
    
    return animations;
  }

  extractGSAPSelector(gsapCode) {
    const match = gsapCode.match(/["']([^"']+)["']/);
    return match ? match[1] : '';
  }

  extractGSAPDuration(gsapCode) {
    const match = gsapCode.match(/duration:\s*([0-9.]+)/);
    return match ? parseFloat(match[1]) * 1000 : 0;
  }

  extractCustomAnimations(scriptContent) {
    const animations = [];
    
    // 檢查常見的動畫模式
    const patterns = [
      /\.animate\s*\(/g,
      /requestAnimationFrame/g,
      /setInterval.*animation/gi,
      /setTimeout.*animation/gi
    ];
    
    for (const pattern of patterns) {
      const matches = scriptContent.match(pattern);
      if (matches) {
        animations.push({
          pattern: pattern.source,
          matches: matches.length
        });
      }
    }
    
    return animations;
  }

  inferTrigger(animationData) {
    if (animationData.type === 'css-animation' || animationData.type === 'keyframes') {
      return 'loading';
    }
    
    if (animationData.type === 'css-transition') {
      return 'hover';
    }
    
    return 'unknown';
  }

  classifyAnimationType(animationData) {
    const { rule, code, type } = animationData;
    const content = rule || code || '';
    
    if (content.includes('transform') && content.includes('scale')) {
      return 'scale';
    }
    
    if (content.includes('transform') && content.includes('translate')) {
      return 'translate';
    }
    
    if (content.includes('transform') && content.includes('rotate')) {
      return 'rotate';
    }
    
    if (content.includes('opacity')) {
      return 'fade';
    }
    
    if (content.includes('transform') || content.includes('opacity')) {
      return 'combo';
    }
    
    return type || 'unknown';
  }

  generateCodeSnippet(animationData) {
    if (animationData.rule) {
      return animationData.rule.substring(0, 200) + (animationData.rule.length > 200 ? '...' : '');
    }
    
    if (animationData.code) {
      return animationData.code.substring(0, 200) + (animationData.code.length > 200 ? '...' : '');
    }
    
    return '';
  }

  async saveResults() {
    const outputPath = path.join(__dirname, '../output/animations_detected.json');
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeJson(outputPath, {
      analyzedAt: new Date().toISOString(),
      totalAnimations: this.animations.length,
      animations: this.animations
    }, { spaces: 2 });
    
    console.log(chalk.green(`💾 動畫分析結果已保存至: ${outputPath}`));
  }
}

module.exports = AnimationDetector;

// 如果直接執行此檔案
if (require.main === module) {
  (async () => {
    const detector = new AnimationDetector();
    try {
      await detector.analyzeAllPages();
      await detector.saveResults();
    } catch (error) {
      console.error(chalk.red('動畫分析過程發生錯誤:'), error);
    }
  })();
}
