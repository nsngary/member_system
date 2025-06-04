<?php
include ('header.php');
require_once 'auth_check.php';
require_role(['admin','user']);
require_once 'csrf.php';
require_once 'util.php';
?>
<!doctype html><html lang="zh-Hant-TW"><head>
<meta charset="utf-8"><title>新增會員</title>
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
</head><body>
<a href="logout.php" class="btn btn-logout" style="float:right">登出</a>
<h2>新增會員</h2>

<form method="POST" action="save_member.php" class="form">
  <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(get_csrf_token()) ?>">
  <label>姓名：
    <input required name="name" placeholder="請輸入姓名">
  </label><br>
  <label>Email：
    <input type="email" required name="email" placeholder="sample@mail.com">
  </label><br>
  <label>會員類型：
    <select name="member_type">
      <option value="VIP">VIP</option>
      <option value="Regular">Regular</option>
    </select>
  </label><br>

  <button type="submit" class="btn">送出</button>
  <a href="admin_dashboard.php" class="btn btn-danger">取消</a>
</form>

<script src="flash.js"></script>
</body></html>
