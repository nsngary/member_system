<?php
// session_start();
// error_reporting(E_ALL);
// ini_set('display_errors', 1);


// if (!isset($_SESSION['username'])) {
//     header("Location: login.php");
//     exit;
// }

// include("header.php");
// echo "<h1>hello</h1>";

require_once 'auth_check.php';
require_login();                           // 未登入自動跳回 login
include 'header.php';                      // 這裡會判斷 role，側欄自動切換
?>
<h2 class="mt-4">歡迎回到會員系統！</h2>
<p>請透過左側選單開始操作。</p>
<?php include 'footer.php';

include("footer.php");
?>