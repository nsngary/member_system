<?php
// session_start();
// include "db_open.php";
include "function.php";
$account ="";
$password = "";
$err = "";

if (isset($_GET['st'])){
    if ($_GET['st'] == "logout"){
        unset($_SESSION['account']);
    }
}

// if (isset($_GET['st']) && $_GET['st'] == "logout") {
//     session_start();
//     session_unset();
//     session_destroy();
//     header("Location: login.php");
//     exit;
// }

if (isset($_POST['account'])){
    $account = $_POST['account'];
    $password = $_POST['password'];
    $code = checkpasswddb($account, $password);
    if ($code == 0) {
        // $account = $_SESSION['account'];
        $_SESSION['sLogintime'] = date("F j, Y, g:i a");
        $_SESSION['account'] = $account;
          include "db_open.php";
    $sql = "SELECT username FROM username WHERE account = '$account'";
    $result = mysqli_query($conn, $sql);
    if ($row = mysqli_fetch_assoc($result)) {
        $_SESSION['username'] = $row['username'];  // 儲存稱號
    }


        header('Location: index.php');
    }elseif ($code == 1)
        $err='帳號錯誤';
    else
        $err='密碼錯誤';
}
?>

<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>後端管理系統</title>
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
</head>
<body class="bg-primary">

	<div class="Nixon-login">
		<div class="container">
			<div class="row">
				<div class="col-lg-6 col-lg-offset-3">
					<div class="login-content">
						<div class="login-logo">
							 <h2><img id="" src="logo/logoSmall.png" style="width:50px;height:43px;"/>後端管理系統</h2>
						</div>
						<div class="login-form">
							<h4>帳號登錄</h4>
							<form method="post" action="login.php">
								<input type="hidden" name="csrf_token" value="<?= htmlspecialchars(get_csrf_token()) ?>">
								<div class="form-group">
									<label>帳號</label>
									<input type="text" name = "username"  value="<?=$account?>" class="form-control" placeholder="帳號">
								</div>
								<div class="form-group">
									<label>密碼</label>
									<input type="password" name="password"  value="<?=$password?>" class="form-control" placeholder="密碼">
								</div>
								<div class="form-group">
									<label>驗證碼</label>
									<img src="captcha.php?<?= time() ?>"> =
									<input  name="captcha" size="2" class="form-control" required>
								</div>
								<div>
									<label>
  										
									</label>
									<label class="pull-right">
									
									</label>
									
								</div>
								<button type="submit" class="btn btn-primary btn-flat m-b-30 m-t-30">登入</button>
  								&nbsp;&nbsp;&nbsp;&nbsp;
  								<a class="btn btn-primary btn-flat m-b-30 m-t-30" href="register.php">註冊</a>
								<p><?=$err?></p>
								
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

</body>
</html>
