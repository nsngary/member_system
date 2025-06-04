<?php
require_once 'auth_check.php';
require_role(['admin','user']);
require_once 'csrf.php';
require_once 'db_config.php';
require_once 'util.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: admin_dashboard.php'); exit;
}
verify_csrf_token();

$id = intval($_POST['member_id'] ?? 0);
if (!$id) { set_flash('error','未指定要刪除的會員'); header('Location: admin_dashboard.php'); exit; }

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$conn->begin_transaction();

try {
    /* 先取舊資料判斷權限與型別序號 */
    $sel=$conn->prepare('SELECT user_id, member_type, seq, name FROM members WHERE id=?');
    $sel->bind_param('i',$id); $sel->execute();
    $m=$sel->get_result()->fetch_assoc();

    if (!$m) throw new Exception('找不到會員資料');
    if ($_SESSION['role']!=='admin' && $m['user_id']!=$_SESSION['uid'])
        throw new Exception('權限不足');

    /* 刪除紀錄 */
    $del=$conn->prepare('DELETE FROM members WHERE id=?');
    $del->bind_param('i',$id); $del->execute();

    /* 收攏序號 */
    $dec=$conn->prepare(
      'UPDATE members SET seq=seq-1, member_id=CONCAT(?,LPAD(seq-1,4,"0"))
         WHERE member_type=? AND seq>?'
    );
    $pre = ($m['member_type']==='VIP'?'VIP':'R');
    $dec->bind_param('ssi',$pre,$m['member_type'],$m['seq']);
    $dec->execute();

    $conn->commit();
    set_flash('success',"已刪除 {$m['name']}");
} catch(Throwable $e) {
    $conn->rollback();
    set_flash('error',$e->getMessage());
}
header('Location: admin_dashboard.php');
exit;
