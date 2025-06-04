<?php
include ('header.php');
require_once 'auth_check.php';
require_role(['user']);
require_once 'csrf.php';
require_once 'db_config.php';
require_once 'util.php';

$stmt=$conn->prepare(
  'SELECT id,name,email,member_type,member_id FROM members
     WHERE user_id = ? ORDER BY member_type,seq'
);
$stmt->bind_param('i',$_SESSION['uid']);
$stmt->execute();
$rows=$stmt->get_result()->fetch_all(MYSQLI_ASSOC);
?>
<!doctype html><html lang="zh-Hant-TW"><head>
<meta charset="utf-8"><title>我的會員資料</title>
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
</head><body>
<!-- <a href="logout.php" class="btn btn-logout" style="float:right">登出</a> -->
<h2>我的會員資料</h2>

<div class="row"><a href="add_member.php"><button type="button" class="col-lg-2 btn btn-primary btn-flat btn-addon m-b-10 m-l-20"><i class="ti-plus"></i>新增資料</button></a><br><br></div>

<table class="table">
  <thead><tr><th>#</th><th>姓名</th><th>Email</th><th>類型</th><th>操作</th></tr></thead>
  <tbody>
<?php foreach($rows as $r): ?>
  <tr>
    <td><?= $r['member_id'] ?></td>
    <td><?= htmlspecialchars($r['name']) ?></td>
    <td><?= htmlspecialchars($r['email']) ?></td>
    <td><?= $r['member_type'] ?></td>
    <td>
        <a href="edit_member.php?id=<?= $r['id'] ?>"><button type="button" class="btn btn btn-info btn btn-flat btn-addon btn-sm m-b-5 m-l-5"><i class="ti-pencil-alt"></i>編輯</a></button>
    </td>
  </tr>
<?php endforeach ?>
  </tbody>
</table>

<script src="flash.js"></script>
</body></html>
