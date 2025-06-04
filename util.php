<?php
/**
 * Flash / Toast 公用函式
 * set_flash('success','內容')  或  set_flash('error','內容')
 * 任一頁 <head> 後呼叫 flash_js()，JS 會自動產生 Toast
 */

function set_flash(string $type, string $msg): void
{
    $_SESSION['flash'] = ['type' => $type, 'msg' => $msg];
}

// function set_flash($type, $message) {
//     if (!isset($_SESSION['flash_messages'])) {
//         $_SESSION['flash_messages'] = [];
//     }
//     $_SESSION['flash_messages'][] = ['type' => $type, 'message' => $message];
// }
function pop_flash(): ?array
{
    if (empty($_SESSION['flash'])) {
        return null;
    }
    $f = $_SESSION['flash'];
    unset($_SESSION['flash']);    // 取一次即銷毀
    return $f;
}

/** 將 Flash 內容輸出為前端可讀取的全域變數 */
function flash_js(): void
{
    if ($f = pop_flash()) {
        $json = json_encode($f, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
        echo "<script>window.__FLASH = $json;</script>";
    }
}

// function flash_js() {
//     if (isset($_SESSION['flash_messages']) && !empty($_SESSION['flash_messages'])) {
//         echo '<script>';
//         foreach ($_SESSION['flash_messages'] as $flash_message) {
//             // 假設您在 flash.js 中有一個名為 displayFlash 的 JS 函數
//             echo "displayFlash('" . addslashes($flash_message['message']) . "', '" . addslashes($flash_message['type']) . "');\n";
//         }
//         echo '</script>';
//         unset($_SESSION['flash_messages']); // 顯示後清除
//     }
// }