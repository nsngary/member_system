<?php
require_once 'auth_check.php';
require_once 'secure_headers.php';
require_role(['admin']);              // 只有 admin 能改型別
require_once 'csrf.php';
require_once 'db_config.php';
require_once 'util.php';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

/* 1. 取得原始資料（同時支援 id 與 member_id） */
$member_id = $_GET['member_id'] ?? '';
if ($member_id === '' && isset($_GET['id'])) {
  // 以數字 PK 先查出對應的 member_id
  $stmt = $conn->prepare('SELECT member_id FROM members WHERE id = ?');
  $stmt->bind_param('i', $_GET['id']);
  $stmt->execute();
  $tmp = $stmt->get_result()->fetch_assoc();
  $member_id = $tmp['member_id'] ?? '';
}
if ($member_id === '') {
  set_flash('error','未指定要編輯的會員');
  header('Location: admin_dashboard.php'); exit;
}


$stmt = $conn->prepare('SELECT * FROM members WHERE member_id = ?');
$stmt->bind_param('s', $member_id);
$stmt->execute();
$member = $stmt->get_result()->fetch_assoc();
if (!$member) {
  set_flash('error','查無此會員');
  header('Location: admin_dashboard.php'); exit;
}

/* 2. POST → 更新 -------------------------------------------------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf_token();
  
  $name = trim($_POST['name']  ?? '');
  $email= trim($_POST['email'] ?? '');
  $newType = ($_POST['member_type'] === 'VIP') ? 'VIP' : 'Regular';
  
  try {
    if ($newType !== $member['member_type']) {
      /* ------- 型別改變：插入新列再刪舊列 ------- */
      $conn->begin_transaction();
      
      /* 2.1 插入新列（自動取得新 seq / member_id） */
      $ins = $conn->prepare(
        'INSERT INTO members (user_id,name,email,member_type)
               VALUES (?,?,?,?)'
            );
            $ins->bind_param('isss',
            $member['user_id'],$name,$email,$newType);
            $ins->execute();
            
            /* 2.2 刪除舊列 */
            $del = $conn->prepare(
              'DELETE FROM members WHERE id = ?'
            );
            $del->bind_param('i', $member['id']);
            $del->execute();
            
            $conn->commit();
            set_flash('success','型別已變更並同步產生新編號');
          } else {
            /* ------- 只改姓名 / Email ------- */
            $upd = $conn->prepare(
              'UPDATE members SET name=?, email=? WHERE id=?'
            );
            $upd->bind_param('ssi', $name, $email, $member['id']);
            $upd->execute();
            set_flash('success','資料已更新');
          }
          header('Location: admin_dashboard.php'); exit;
        } catch(Throwable $e) {
          $conn->rollback();
          set_flash('error','更新失敗：'.$e->getMessage());
          header('Location: edit_member.php?member_id='.$member_id); exit;
        }
      }
      include ('header.php');
      ?>

<!-- <a href="logout.php" class="btn btn-logout" style="float:right">登出</a> -->
<h2>編輯會員</h2>

<form method="POST" class="form">
  <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(get_csrf_token()) ?>">

  <label>姓名：
    <input required name="name" value="<?= htmlspecialchars($member['name']) ?>">
  </label><br>

  <label>Email：
    <input type="email" required name="email" value="<?= htmlspecialchars($member['email']) ?>">
  </label><br>

  <label>會員類型：
    <select name="member_type">
      <option value="VIP"     <?= $member['member_type']==='VIP'     ?'selected':'' ?>>VIP</option>
      <option value="Regular" <?= $member['member_type']==='Regular' ?'selected':'' ?>>Regular</option>
    </select>
  </label><br>

  <button type="submit" class="btn">儲存</button>
  <a href="admin_dashboard.php" class="btn btn-danger">取消</a>
</form>
<?php include 'footer.php'; ?>

</body></html>
