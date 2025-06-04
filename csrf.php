<?php

function get_csrf_token():string 
{
    if (empty($_SESSION['csrf_token'])){

        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf_token():void
{
    $token = $_POST['csrf_token'] ?? $_GET['csrf_token'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'] ?? '' , $token)){
        header('HTTP/1.1 419 CSRF Verification Failed');
        exit('表單逾時或來源不明，請重新操作');
    }
}