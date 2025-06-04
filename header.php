<?php
// session_start();
// if (!isset($_SESSION['account'])) {
//     header('Location: login.php');
// }
require_once 'auth_check.php';
require_login();
$role = $_SESSION['role'] ?? '';
?>

<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>後台管理系統</title>

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

    <?php
    require_once 'util.php';
    flash_js();
    ?>
</head>

<body>

    <div class="sidebar sidebar-hide-to-small sidebar-shrink sidebar-gestures">
        <div class="nano">
            <div class="nano-content">
                <ul>
                    <!-- <li><a href="index.php"><i class="ti-home"></i> 管理者首頁</a> </li> -->
                    <?php if ($role === 'admin'): ?>
                    <li><a href="admin_dashboard.php"><i class="ti-home"></i> 管理者首頁</a></li>
                    <?php else: ?>
                    <li><a href="user_dashboard.php"><i class="ti-home"></i> 我的首頁</a></li>
                    <?php endif; ?>
                    <li><a href="logout.php"><i class="ti-close"></i> 登出</a></li>

                </ul>
            </div>
        </div>
    </div><!-- /# sidebar -->




    <div class="header">
        <div class="pull-left">
            <div class="logo">
                <a href="index.php">
                    <span style="font-size:18px;color:#fff; font-weight"><img id="logoImg" src="logo/logoSmall.png" data-logo_big="logo/logoSmall.png" data-logo_small="logo/logoSmall.png" />後台管理系統</span>
                </a>
            </div>
            <div class="hamburger sidebar-toggle">
                <span class="ti-menu"></span>
            </div>
        </div>


    </div>


    <!-- END chat Sidebar-->


    <div class="content-wrap">
        <div class="main">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-lg-12 p-0">
                        <div class="page-header">
                            <div class="page-title">
                                <h1><?= htmlspecialchars($_SESSION['username'] ?? '') ?> 您好！登入時間：<?php echo $_SESSION['sLogintime']; ?></h1>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="main-content"></div>