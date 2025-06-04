<?php
$server   = "localhost";
$user     = "root";
$password = "";
$dbname   = "member_system";

$conn = new mysqli($server, $user, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$conn->set_charset("utf8mb4");
