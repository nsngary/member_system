<?php
session_start();
require_once 'secure_headers.php';
require_once 'csrf.php';
require_once 'db_config.php';
require_once 'util.php';

if (isset($_SESSION['uid'])) {
    header('Location: user_dashboard.php'); exit;
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

if ($_SERVER['REQUEST_METHOD']==='POST') {
    verify_csrf_token();
    
    $u   = trim($_POST['username'] ?? '');
    $p1  = $_POST['password']  ?? '';
    $p2  = $_POST['password2'] ?? '';
    $ans = intval($_POST['captcha'] ?? -1);
    
    if ($ans !== ($_SESSION['captcha_answer'] ?? -999)) {
        set_flash('error','驗證碼錯誤'); goto out;
    }
    if ($u==='' || $p1==='' || $p1!==$p2) {
        set_flash('error','資料不完整或密碼不一致'); goto out;
    }
    /* 使用者名稱唯一檢查 */
    $chk=$conn->prepare('SELECT 1 FROM users WHERE username=?');
    $chk->bind_param('s',$u); $chk->execute();
    if ($chk->get_result()->fetch_row()) {
        set_flash('error','帳號已存在'); goto out;
    }
    $hash=password_hash($p1,PASSWORD_DEFAULT);
    $ins=$conn->prepare('INSERT INTO users (username,password_hash,role) VALUES (?,?,?)');
    $role='user';
    $ins->bind_param('sss',$u,$hash,$role);
    $ins->execute();
    
    set_flash('success','註冊成功，請登入');
    header('Location: login.php'); exit;
}
out:
?>
<!doctype html><html lang="zh-Hant-TW"><head>
    <meta charset="utf-8"><title>註冊</title>
    <!-- ================= Favicon ================== -->
    <!-- Standard -->
    <link rel="shortcut icon" href="logo/fav.png">
    <!-- Retina iPad Touch Icon-->
    <link rel="apple-touch-icon" sizes="144x144" href="logo/fav.png">
    <!-- Retina iPhone Touch Icon-->
    <link rel="apple-touch-icon" sizes="114x114" href="logo/fav.png">
    <!-- Standard iPad Touch Icon-->
    <link rel="apple-touch-icon" sizes="72x72" href="logo/fav.png">
    <!-- Standard iPhone Touch Icon-->
    <link rel="apple-touch-icon" sizes="57x57" href="logo/fav.png">
    
    <!-- Styles -->
    <link href="assets/fontAwesome/css/fontawesome-all.min.css" rel="stylesheet">
    <link href="assets/css/lib/themify-icons.css" rel="stylesheet">
    <link href="assets/css/lib/mmc-chat.css" rel="stylesheet" />
    <link href="assets/css/lib/sidebar.css" rel="stylesheet">
    <link href="assets/css/lib/bootstrap.min.css" rel="stylesheet">
    <link href="assets/css/lib/nixon.css" rel="stylesheet">
    <link href="assets/css/style.css" rel="stylesheet">
    
    <style type="text/css"></style>
    <?php flash_js(); ?>
</head><body class="bg-primary">

    <div class="Nixon-login">
        <div class="container">
            <div class="row">
                <div class="col-lg-6 col-lg-offset-3">
                    <div class="login-content">
                        <div class="login-logo">
                            <h2><img id="" src="logo/logoSmall.png" style="width:50px;height:43px;" />後端管理系統</h2>
                        </div>
                        <div class="login-form">
                            <h4>帳號註冊</h4>
                            <form method="post">
                                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(get_csrf_token()) ?>">
                                <div class="form-group">
                                    <label>帳號</label>
                                    <input type="text" name="username" class="form-control" placeholder="帳號" required>
                                </div>

                                <div class="form-group">
                                    <label>密碼</label>
                                    <input type="password" name="password" value="<?= $password ?>" class="form-control" placeholder="密碼" required>
                                </div>

                                <div class="form-group">
                                    <label>再次輸入密碼</label>
                                    <input type="password" name="password2" value="<?= $password ?>" class="form-control" placeholder="密碼" required>
                                </div>

                                <div class="form-group">
                                    <label>驗證碼</label>
                                    <img src="captcha.php?<?= time() ?>"> =
                                    <input name="captcha" size="2" class="form-control" placeholder="請輸入驗證碼" required>
                                </div>
                                
                                <div>
                                    <label></label>
                                    <label class="pull-right"></label>
                                </div>
                                <button type="submit" class="btn btn-primary btn-flat m-b-30 m-t-30">送出</button>
                                <a class="btn btn-primary btn-flat m-b-30 m-t-30" href="login.php">返回</a>
                                <p><?= $err ?></p>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</body>
<script src="flash.js"></script>
</html>