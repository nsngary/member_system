<?php
require_once 'auth_check.php';
require_role(['admin','user']);
require_once 'csrf.php';
require_once 'db_config.php';
require_once 'util.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: add_member.php'); exit;
}
verify_csrf_token();

$name  = trim($_POST['name']  ?? '');
$email = trim($_POST['email'] ?? '');
$type  = ($_POST['member_type']==='VIP') ? 'VIP' : 'Regular';

if ($name==='' || $email==='') { set_flash('error','資料不完整'); header('Location:add_member.php'); exit; }
if (!filter_var($email,FILTER_VALIDATE_EMAIL)) { 
    set_flash('error','Email格式錯'); header('Location:add_member.php'); exit; }

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$conn->begin_transaction();

try {
    /* 取新序號 */
    $sel=$conn->prepare('SELECT COALESCE(MAX(seq),0)+1 AS next FROM members WHERE member_type=?');
    $sel->bind_param('s',$type); $sel->execute();
    $seq=$sel->get_result()->fetch_assoc()['next'];

    $ins=$conn->prepare(
      'INSERT INTO members (user_id,name,email,member_type,seq)
       VALUES (?,?,?,?,?)'
    );
    $ins->bind_param('isssi',$_SESSION['uid'],$name,$email,$type,$seq);
    $ins->execute();

    $conn->commit();
    set_flash('success','新增成功');
    header('Location: admin_dashboard.php');
} catch(Throwable $e) {
    $conn->rollback();
    set_flash('error','新增失敗');
    header('Location: add_member.php');
}
exit;
