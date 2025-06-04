<?php
session_start();
require_once 'secure_headers.php';
require_once 'csrf.php';
require_once 'db_config.php';
require_once 'util.php';

if (isset($_SESSION['uid'])) {
    // 已登入直接導向
    header('Location: ' . ($_SESSION['role'] === 'admin'
        ? 'admin_dashboard.php' : 'user_dashboard.php'));
    exit;
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf_token();

    $u   = trim($_POST['username'] ?? '');
    $p   = $_POST['password'] ?? '';
    $ans = intval($_POST['captcha'] ?? -1);

    if ($ans !== ($_SESSION['captcha_answer'] ?? -999)) {
        set_flash('error', '驗證碼錯誤，請重試');
    } else {
        $stmt = $conn->prepare(
            'SELECT user_id, password_hash, role
               FROM users WHERE username = ?'
        );
        $stmt->bind_param('s', $u);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        // :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}

        if ($row && password_verify($p, $row['password_hash'])) {
            session_regenerate_id(true);
            $_SESSION['uid']  = $row['user_id'];
            $_SESSION['role'] = $row['role'];
            $_SESSION['CREATED'] = $_SESSION['LAST_ACTIVITY'] = time();
            $_SESSION['sLogintime'] = date('Y-m-d H:i:s');
            header('Location: index.php');
            // header('Location: '.($row['role']==='admin'
            //                     ? 'admin_dashboard.php'
            //                     : 'user_dashboard.php'));
            exit;
        }
        set_flash('error', '帳號或密碼錯誤');
    }
    header('Location: login.php');
    exit;
}
?>
<!doctype html>
<html lang="zh-Hant-TW">

<head>
    <meta charset="utf-8">
    <title>登入</title>
    <link rel="shortcut icon" href="./logo/fav.png">
    <link rel="apple-touch-icon" sizes="144x144" href="./logo/fav.png">
    <link rel="apple-touch-icon" sizes="114x114" href="./logo/fav.png">
    <link rel="apple-touch-icon" sizes="72x72" href="./logo/fav.png">
    <link rel="apple-touch-icon" sizes="57x57" href="./logo/fav.png">
    <link href="./assets/fontAwesome/css/fontawesome-all.min.css" rel="stylesheet">
    <link href="./assets/css/lib/themify-icons.css" rel="stylesheet">
    <link href="./assets/css/lib/bootstrap.min.css" rel="stylesheet">
    <link href="./assets/css/lib/nixon.css" rel="stylesheet">
    <link href="./assets/css/style.css" rel="stylesheet">
    <?php flash_js(); ?>
</head>

<body class="bg-primary">

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
                                    <input type="text" name="username" value="<?= $account ?>" class="form-control" placeholder="帳號" required>
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
                                <!-- <a class="btn btn-primary btn-flat m-b-30 m-t-30" href="register.php">註冊</a> -->
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