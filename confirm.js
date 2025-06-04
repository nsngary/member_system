/* confirm.js ─ 於 <body> 底部載入即可 */
document.addEventListener('submit', ev => {
  const f = ev.target.closest('form[data-confirm]');
  if (!f) return;

  const msg = f.dataset.confirm || '確定執行此操作？';
  if (!window.confirm(msg)) ev.preventDefault();
});
