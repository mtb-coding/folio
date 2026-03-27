// - toast.js -
// Lightweight toast notification.  Call Toast.show('message').
// -

const Toast = (() => {
  let timer = null;
  const el  = () => document.getElementById('toast');

  function show(msg, duration = 2800) {
    const t = el();
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => t.classList.remove('show'), duration);
  }

  return { show };
})();
