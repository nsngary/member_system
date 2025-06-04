#  Member System 會員管理系統

這是一套使用 PHP + MySQL 所開發的會員管理系統，適合應用於網站的帳號登入、會員資料管理與權限控管。此專案同時具備前後端表單驗證、資料同步機制與基本安全防護。

---

##  功能特色

-  會員登入 / 登出
-  帳號新增 / 編輯 / 刪除
-  權限等級與帳號類別同步控制
-  帳密表單前後端雙重驗證
-  權限導向頁面防護（使用 `basename()` 搭配權限比對）
-  操作後提示彈窗（新增 / 刪除 / 編輯）
-  系統安全機制（CSRF、資料清洗、頁面導向防護）

---

##  安裝與使用

### 1️⃣ 環境需求
- PHP 7.x 或以上版本
- MySQL 資料庫
- 本機環境建議：XAMPP / MAMP / Docker

### 2️⃣ 資料庫設定
請先建立資料庫並執行以下 SQL：

```sql
-- 建立資料表（admin, username 等）
CREATE TABLE admin (
  account VARCHAR(50) PRIMARY KEY,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE username (
  account VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50)
);
```


3️⃣ 專案安裝

git clone https://github.com/你的帳號/member_system.git

將專案放入伺服器根目錄（如 htdocs/member_system），啟動 Apache 與 MySQL。

⸻

🔐 安全性設計重點
<table>
防護機制	實作方式
❗ 權限檢查	使用 basename($_SERVER['PHP_SELF']) 判斷當前頁面，搭配登入權限比對
❗ SQL 注入防止	使用 mysqli_real_escape_string()（建議改為 Prepared Statement）
❗ CSRF 防護	可進一步搭配 Token 實作（目前已預留欄位）
❗ 機密資訊隔離	使用 os.getenv() 讀取 .env 金鑰資訊（可再實作）
</table>

⸻

📁 專案結構簡介
```php
member_system/
├── index.php               # 首頁
├── login.php               # 登入頁
├── admin.php               # 會員資料管理
├── includes/
│   ├── db.php              # 資料庫連線設定
│   └── header.php          # 權限導向控制
├── css/
│   └── style.css
└── js/
    └── confirm.js          # 刪除確認彈窗
```

⸻

🚀 未來優化項目
	•	改用 PDO + Prepared Statements 提升安全性
	•	使用 Bootstrap 或 Tailwind 統一 UI 樣式
	•	整合 GitHub Actions 自動部署
	•	前端表單驗證強化（含正規表示式）

⸻

🙌 作者

由重光開發練習，歡迎 fork 或提出 issue 一起優化！

