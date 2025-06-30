# DICH Fashion 動畫分析器

全面解析 [DICH Fashion](https://dich-fashion.webflow.io/) 網站的所有互動與動畫效果。

## 🎯 專案目標

- 對整站所有路由進行深度爬取（含延遲載入區塊）
- 下載 HTML/CSS/JS 及 Webflow Interactions JSON
- 使用 Puppeteer 啟動無頭瀏覽器，截取每個動畫的起始/結束截圖與螢幕錄影
- 將偵測到的動畫以結構化格式輸出為 Markdown 和 JSON

## 🏗️ 專案結構

```
web_animation/
├── src/                    # 原始碼
│   ├── analyzer.js         # 主分析器
│   ├── crawler.js          # 網站爬蟲
│   ├── animation-detector.js # 動畫偵測器
│   ├── visual-capture.js   # 視覺資產擷取器
│   └── data-exporter.js    # 資料輸出器
├── assets/                 # 資產檔案
│   ├── raw/               # 原始擷取資產
│   └── processed/         # 處理後資產
├── output/                # 輸出檔案
│   ├── animations_raw.md  # 詳細 Markdown 報告
│   ├── animations_raw.json # 完整 JSON 資料
│   └── analysis_summary.json # 分析摘要
├── analysis/              # 分析分支檔案
├── package.json           # 專案配置
└── README.md             # 專案說明
```

## 🚀 快速開始

### 安裝依賴

```bash
npm install
```

### 執行完整分析

```bash
npm start
```

### 分階段執行

```bash
# 1. 網站爬取
npm run crawl

# 2. 動畫分析
npm run analyze

# 3. 視覺擷取
npm run capture

# 4. 資料匯出
npm run export
```

## 📊 輸出格式

### animations_raw.md

詳細的 Markdown 報告，包含：
- 動畫效果總覽和統計
- 按頁面分組的動畫列表
- 每個動畫的詳細資訊和程式碼片段
- 視覺資產連結

### animations_raw.json

結構化的 JSON 資料，包含以下欄位：

```json
{
  "slug": "anim_001",
  "sourcePage": "https://dich-fashion.webflow.io/",
  "trigger": "scroll",
  "type": "fade",
  "tech": "CSS keyframes",
  "easing": "ease-in-out",
  "duration": 1000,
  "delay": 0,
  "selector": ".hero-image",
  "codeSnippet": "@keyframes fadeIn { ... }",
  "sourceLocation": "style.css:123",
  "assetPath": {
    "initialScreenshot": "anim_001_initial.png",
    "finalScreenshot": "anim_001_final.png",
    "video": "anim_001_animation.webm"
  }
}
```

## 🔍 偵測技術

### CSS 動畫
- `@keyframes` 規則
- `animation` 屬性
- `transition` 屬性
- 內聯樣式動畫

### Webflow IX2
- `data-w-id` 屬性
- Webflow 互動配置
- 動態載入的互動效果

### GSAP 動畫
- GSAP 函式庫檢測
- `gsap.to()`, `gsap.from()`, `gsap.fromTo()` 方法
- Timeline 動畫

### 自訂 JavaScript
- `requestAnimationFrame`
- `setInterval` / `setTimeout` 動畫
- `.animate()` 方法
- 自訂動畫函式

## 🎬 視覺資產擷取

- **截圖**: 動畫起始和結束狀態的高解析度截圖
- **影片**: WebM 格式的動畫過程錄影
- **觸發方式**: 
  - `scroll` - 滾動觸發
  - `hover` - 滑鼠懸停
  - `click` - 點擊觸發
  - `loading` - 頁面載入
  - `loop` - 循環動畫

## 📈 分析統計

自動產生以下統計資訊：
- 動畫類型分布 (fade, scale, translate, rotate, combo)
- 觸發方式分布 (scroll, hover, click, loading, loop)
- 技術實現分布 (CSS, GSAP, Webflow IX2, JavaScript)
- 頁面動畫密度分析

## 🛠️ 技術棧

- **Node.js** - 執行環境
- **Puppeteer** - 無頭瀏覽器控制
- **Cheerio** - HTML/CSS 解析
- **fs-extra** - 檔案系統操作
- **chalk** - 終端機顏色輸出
- **json2md** - JSON 轉 Markdown
- **puppeteer-screen-recorder** - 螢幕錄影

## 🔧 配置選項

可在各個模組中調整以下參數：
- 爬取延遲時間
- 截圖解析度
- 影片錄製品質
- 動畫偵測敏感度
- 輸出格式選項

## 📝 程式碼追溯

每個偵測到的動畫都包含：
- 原始檔案位置 (`file:line`)
- 程式碼片段
- 選擇器路徑
- 原始資料備份

## 🚨 注意事項

- 執行時間可能較長（取決於網站複雜度）
- 需要穩定的網路連線
- 某些動態載入內容可能需要額外等待時間
- 視覺擷取依賴於動畫觸發的成功率

## 📋 後續步驟

1. 檢視產生的 `animations_raw.md` 報告
2. 驗證自動偵測結果的準確性
3. 建立 `analysis/` 分支並提交結果
4. 請求 @Reviewer 進行審查

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request 來改善這個分析器！

## 📄 授權

MIT License
