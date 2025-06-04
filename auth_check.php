<?php
/* 建議：把 cookie 參數一次設定好，寫在 session_start() 之前 */
session_set_cookie_params([
    'lifetime' => 0,           // 瀏覽器關閉就刪，但仍搭配以下 idle/TTL
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();
require_once 'secure_headers.php';
require_once 'util.php';
/* 插入在 session_start() 之後、require secure_headers 之前 */
if (empty($_SESSION['uid']) && !empty($_COOKIE['remember_me'])) {
    require_once 'db_config.php';
    list($sel,$val) = explode(':', $_COOKIE['remember_me']);
    $stmt = $conn->prepare(
        'SELECT user_id, validator_hash, expires_at
           FROM auth_tokens WHERE selector=?');
    $stmt->bind_param('s',$sel);
    $stmt->execute();
    if ($r = $stmt->get_result()->fetch_assoc()) {
        if (hash_equals($r['validator_hash'], hash('sha256',$val)) &&
            strtotime($r['expires_at']) > time()) {

            $_SESSION['uid']  = $r['user_id'];
            $_SESSION['role'] = 'user';      // ※ 若要更安全，可再查 users
            $_SESSION['CREATED'] = $_SESSION['LAST_ACTIVITY'] = time();
        }
    }
}
require_once 'secure_headers.php';

/* ===== 自訂失效條件 ===== */
$MAX_IDLE = 30 * 60;          // 超過 30 分鐘沒操作 → 登出
$MAX_TTL  = 12 * 60 * 60;     // 不管有沒有操作，最長 12 小時必重新登入

if (
    isset($_SESSION['LAST_ACTIVITY']) &&
    time() - $_SESSION['LAST_ACTIVITY'] > $MAX_IDLE
) {
    session_unset();
    session_destroy();
    header('Location: login.php?timeout=idle');
    exit;
}

if (
    isset($_SESSION['CREATED']) &&
    time() - $_SESSION['CREATED'] > $MAX_TTL
) {
    session_unset();
    session_destroy();
    header('Location: login.php?timeout=ttl');
    exit;
}

/* 更新活動時間戳 */
$_SESSION['LAST_ACTIVITY'] = time();

/** 必須登入 */
function require_login(): void{
    if (!isset($_SESSION['uid'])) {
        set_flash('error','請先登入');
        header('Location: login.php');
        exit;
    }
}

/**
 * 檢查角色
 * @param array $roles 允許的角色，例如 ['admin'] 或 ['admin','user']
 */
function require_role(array $roles): void{
    require_login();
    if (!in_array($_SESSION['role'], $roles, true)) {
        header('HTTP/1.1 403 Forbidden');
        echo '權限不足';exit;
    }
}
