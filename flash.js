/* flash.js ─ 於 <body> 底部載入即可 */
// document.addEventListener('DOMContentLoaded', () => {
//   if (!window.__FLASH) return;

//   const div = document.createElement('div');
//   div.className = `toast toast-${window.__FLASH.type}`;
//   div.textContent = window.__FLASH.msg;
//   document.body.appendChild(div);

//   /* 3 秒後自動淡出並移除（CSS 已有 fade 動畫） */
//   setTimeout(() => div.remove(), 3000);
// });

function showFlash(){
  if (!window.__FLASH) return;
  const div = document.createElement('div');
  div.className = `toast toast-${window.__FLASH.type}`;
  div.textContent = window.__FLASH.msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', showFlash);
}else{
  showFlash();                // 已經載完就立即執行
}