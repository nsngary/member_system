<?php
// === CHANGE: secure_headers.php ===
$policies = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",          // 允許本站外部 JS
  "style-src 'self' 'unsafe-inline'", // 允許內嵌 <style>，如 Bootstrap (可視需求移除)
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'"
];
header('Content-Security-Policy: '.implode('; ',$policies));
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');