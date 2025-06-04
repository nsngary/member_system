<?php
session_start();
require_once 'secure_headers.php';
require_once 'util.php';

session_unset();
session_destroy();

set_flash('success','已成功登出');
header('Location: login.php');
exit;
