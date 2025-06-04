<?php
session_start();
header('Content-Type: image/png');
$w=65; $h=15;
$img=imagecreatetruecolor($w,$h);

/* — 配色：背景 #F2F2F2、文字 #333333 — */
$bg =imagecolorallocate($img,0xF2,0xF2,0xF2);
$txt=imagecolorallocate($img,0x33,0x33,0x33);
imagefill($img, 0, 0, $bg);

/* — 產生題目 — */
$n1=random_int(1,9);
$n2=random_int(1,9);
$_SESSION['captcha_answer']=$n1+$n2;
$question="$n1+$n2=?";

/* — 位置：往右 15px、往下 28px；字體加粗 (size 16) — */
imagestring($img, 5, 12,0, $question, $txt);   // 內建 bitmap 字體 (5 最大)
imagepng($img);
imagedestroy($img);