# 會員系統 實作練習

## 項目描述
1.表單層防護：
    CSRF Token：所有修改/刪除都先verify_csrf_token()，杜絕跨站請求偽造。
        登入時有captcha.php產生圖形驗證碼；login.php/register.php 需比對回答 ￼ | 緩解暴力破解與機器灌帳號

        get_csrf_token()產生32byte隨機token
        各頁<form>隱藏欄位帶入，再由verify_csrf_token()驗證。
    
    Captcha：captcha.php產生圖形驗證碼，login.php/register.php需比對作答。
        緩解暴力破解／機器灌帳號。

2.伺服器回應標頭：CSP、X-frame-options。
    secure_headers.php透過header()寫入多條策略。
    限制外部資源、防止 Clickjacking 與降低 Referrer 洩漏；屬於「減少 XSS 影響面」的第一層保護。

3.認證與Session管理：
    安全cookie旗標：(auth_check.php)
        session_set_cookie_params() 設定 httponly、samesite=Lax 
    Session固定攻擊防護：(login.php)
        登入成功即 session_regenerate_id(true)
    Idle / TTL強制登出：(auth_check.php)
        自訂 MAX_IDLE（30 min）與 MAX_TTL（12 h）逾時即砍 Session
    Remember-me Token：(auth_check.php)
        雜湊驗證器 + 到期日比對，避免被竊 Cookie 後長期存取

4.授權 -（Role-based access control）：以程式邏輯層控管「誰可以執行何種操作」。
    require_login() + require_role(['admin' …]) 放在各功能頁最前面，統一透過 auth_check.php 驗證身分/角色。

5.資料庫安全：
    預備語句 - prepared statement + bind：防止SQL注入
        查詢、更改資料庫中的資料時，皆透過預備語句取得目標資訊。
    輸入驗證／淨化：(save_member.php)
        filter_var($email, FILTER_VALIDATE_EMAIL) 檢查 Email；trim()、型別轉換 (intval()) 等。

6.機密與雜湊：
    密碼使用雜湊／驗證：password_hash()儲存、password_verify進行比對。

7.前端訊息輸出：(util.php)
    flash_js()先將json_encode()，並做HTML Hex Encode，避免注入 Script Tag 時發生 XSS。

