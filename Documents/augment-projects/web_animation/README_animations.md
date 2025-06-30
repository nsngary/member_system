# 動畫效果庫 - Animation Schema

本文件提供了從 DICH Fashion 網站提取並標準化的動畫效果庫的完整說明。

## 📊 統計概覽

- **總動畫數量**: 10 個主要動畫類型
- **變體總數**: 335 個變體
- **原始動畫**: 345 個
- **去重率**: 97.1%
- **生成時間**: 2025-06-30

## 🎯 Schema 結構

每個動畫條目包含以下欄位：

```json
{
  "id": "fade-in-up",
  "label": "淡入上移",
  "category": ["entrance", "scroll"],
  "props": {
    "duration": 600,
    "delay": 100,
    "distance": "40px",
    "opacityFrom": 0,
    "easing": "ease-out-cubic"
  },
  "defaults": { /* 預設值 */ },
  "code": {
    "css": "/* CSS 程式碼 */",
    "js": "/* JavaScript 程式碼 */"
  },
  "preview": "/previews/fade-in-up.mp4",
  "tags": ["fashion", "hero-section"],
  "variants": [
    {
      "id": "fade-in-up-variant-1",
      "props": { /* 變體參數 */ },
      "preview": "/previews/variant.mp4"
    }
  ]
}
```

## 📋 動畫類型一覽表

| ID | 中文名稱 | 分類 | 變體數量 | 主要用途 |
|---|---|---|---|---|
| `preloader` | 預載動畫 | entrance, loading | 11 | 頁面載入效果 |
| `lottie` | Lottie 動畫 | lottie | 67 | 互動式動畫 |
| `generic` | 通用動畫 | general | 93 | 基礎動畫效果 |
| `floating` | 浮動效果 | movement | 27 | 元素浮動 |
| `fade` | 淡入淡出 | entrance | 69 | 透明度變化 |
| `scale` | 縮放動畫 | transform | 13 | 尺寸變化 |
| `slide` | 滑動效果 | movement | 19 | 位置移動 |
| `color-change` | 顏色變化 | interaction | 17 | 顏色轉換 |
| `marquee` | 跑馬燈 | movement | 19 | 文字滾動 |

## 🏷️ 分類系統

### 主要分類 (Category)
- **entrance**: 入場動畫
- **scroll**: 滾動觸發
- **hover**: 滑鼠懸停
- **interaction**: 互動效果
- **movement**: 移動動畫
- **transform**: 變形效果
- **loading**: 載入動畫
- **lottie**: Lottie 動畫
- **general**: 通用效果

### 標籤系統 (Tags)
- **技術標籤**: `webflow-ix2`, `css-keyframes`, `gsap`, `javascript-自訂`
- **用途標籤**: `fashion`, `hero-section`, `navigation`, `button`, `image`
- **元素標籤**: `preloader`, `lottie`, `cloud`, `nav`

## 💻 使用示例

### 基本使用

```javascript
// 載入動畫 schema
import animationSchema from './animations.schema.json';

// 取得特定動畫
const fadeAnimation = animationSchema.animations.find(anim => anim.id === 'fade');

// 應用動畫
function applyAnimation(element, animationId) {
  const animation = animationSchema.animations.find(anim => anim.id === animationId);
  if (animation) {
    // 使用 CSS
    element.innerHTML += `<style>${animation.code.css}</style>`;
    
    // 執行 JavaScript
    eval(animation.code.js);
  }
}
```

### React 組件示例

```jsx
import React, { useEffect, useRef } from 'react';
import animationSchema from './animations.schema.json';

const AnimatedComponent = ({ animationType = 'fade', children }) => {
  const elementRef = useRef(null);
  
  useEffect(() => {
    const animation = animationSchema.animations.find(anim => anim.id === animationType);
    if (animation && elementRef.current) {
      // 應用動畫樣式
      const styleElement = document.createElement('style');
      styleElement.textContent = animation.code.css;
      document.head.appendChild(styleElement);
      
      // 觸發動畫
      elementRef.current.classList.add('active');
    }
  }, [animationType]);
  
  return (
    <div ref={elementRef} className={`${animationType}-animation`}>
      {children}
    </div>
  );
};
```

### Vue 組件示例

```vue
<template>
  <div :class="`${animationType}-animation`" ref="animatedElement">
    <slot />
  </div>
</template>

<script>
import animationSchema from './animations.schema.json';

export default {
  props: {
    animationType: {
      type: String,
      default: 'fade'
    }
  },
  mounted() {
    const animation = animationSchema.animations.find(anim => anim.id === this.animationType);
    if (animation) {
      // 注入 CSS
      const style = document.createElement('style');
      style.textContent = animation.code.css;
      document.head.appendChild(style);
      
      // 觸發動畫
      this.$refs.animatedElement.classList.add('active');
    }
  }
}
</script>
```

## 🔧 自訂動畫

### 建立新的動畫變體

```javascript
// 基於現有動畫建立變體
function createAnimationVariant(baseAnimationId, customProps) {
  const baseAnimation = animationSchema.animations.find(anim => anim.id === baseAnimationId);
  
  return {
    ...baseAnimation,
    id: `${baseAnimationId}-custom`,
    props: {
      ...baseAnimation.props,
      ...customProps
    }
  };
}

// 使用示例
const customFade = createAnimationVariant('fade', {
  duration: 1200,
  easing: 'ease-in-out'
});
```

### 動畫組合

```javascript
// 組合多個動畫效果
function combineAnimations(animationIds) {
  const animations = animationIds.map(id => 
    animationSchema.animations.find(anim => anim.id === id)
  );
  
  return {
    id: `combined-${animationIds.join('-')}`,
    label: '組合動畫',
    animations: animations,
    execute: function(element) {
      animations.forEach((anim, index) => {
        setTimeout(() => {
          // 執行動畫
          element.classList.add(`${anim.id}-animation`);
        }, index * 200);
      });
    }
  };
}
```

## 📱 響應式動畫

```css
/* 響應式動畫調整 */
@media (max-width: 768px) {
  .fade-animation {
    animation-duration: 400ms; /* 移動裝置使用較短動畫 */
  }
}

@media (prefers-reduced-motion: reduce) {
  .fade-animation {
    animation: none; /* 尊重使用者的動畫偏好 */
    opacity: 1;
  }
}
```

## 🎨 最佳實踐

### 1. 效能優化
- 使用 `transform` 和 `opacity` 屬性以獲得最佳效能
- 避免在動畫中修改 `layout` 屬性
- 使用 `will-change` 提示瀏覽器優化

### 2. 可訪問性
- 提供 `prefers-reduced-motion` 支援
- 確保動畫不會引起癲癇或前庭障礙
- 提供跳過動畫的選項

### 3. 使用者體驗
- 保持動畫時間在 200-500ms 之間
- 使用適當的緩動函數
- 避免過度使用動畫

## 📄 檔案結構

```
animations.schema.json          # 主要 schema 檔案
├── version                     # Schema 版本
├── generatedAt                 # 生成時間
├── totalAnimations            # 動畫總數
└── animations[]               # 動畫陣列
    ├── id                     # 唯一識別碼
    ├── label                  # 中文標籤
    ├── category[]             # 分類陣列
    ├── props{}                # 動畫屬性
    ├── defaults{}             # 預設值
    ├── code{}                 # 程式碼
    ├── preview                # 預覽影片
    ├── tags[]                 # 標籤陣列
    ├── variants[]             # 變體陣列
    └── _source{}              # 原始資料
```

## 🔄 更新與維護

此 schema 是從實際網站動畫中提取並標準化的結果。如需更新：

1. 重新執行 `animation-schema-converter.js`
2. 檢查新增的動畫類型
3. 更新此文件的說明
4. 測試所有動畫效果

---

**版本**: 1.0.0  
**最後更新**: 2025-06-30  
**維護者**: Structurer Agent
