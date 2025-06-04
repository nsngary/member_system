<?php
require_once 'auth_check.php';
require_role(['admin','user']);
require_once 'csrf.php';
require_once 'db_config.php';
require_once 'util.php';

$uid  = $_SESSION['uid'];
$role = $_SESSION['role'];

if ($role==='admin') {
  $stmt=$conn->prepare(
    'SELECT id,name,email,member_type,member_id FROM members
         ORDER BY member_type,seq'
    );
  } else {
    $stmt=$conn->prepare(
      'SELECT id,name,email,member_type,member_id FROM members
         WHERE user_id = ? ORDER BY member_type,seq'
    );
    $stmt->bind_param('i',$uid);
  }
  $stmt->execute();
  $rows=$stmt->get_result()->fetch_all(MYSQLI_ASSOC);          
  include ('header.php');
  ?>


<!-- <a href="logout.php" class="btn btn-logout" style="float:right">登出</a> -->
<h2>會員列表</h2><br>
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
      <!-- <button type="button" href="edit_member.php?id=<?= $r['id'] ?>" class="btn btn btn-info btn btn-flat btn-addon btn-sm m-b-5 m-l-5"><i class="ti-pencil-alt"></i>編輯</button> -->
      <form method="POST" action="delete_member.php"
            data-confirm="確定要刪除『<?= htmlspecialchars($r['name']) ?>』？"
            style="display:inline">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(get_csrf_token()) ?>">
        <input type="hidden" name="member_id" value="<?= $r['id'] ?>">
        <button type="submit" class="btn btn btn-default btn btn-flat btn-addon btn-sm m-b-5 m-l-5"><i class="ti-trash"></i>刪除</button>
      </form>
    </td>
  </tr>
<?php endforeach ?>
  </tbody>
</table>

<?php include 'footer.php'; ?>

</body></html>
