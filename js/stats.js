// - stats.js -
// Word / character / line statistics, word-count goal with progress bar,
// and auto-save to localStorage.
// -

const Stats = (() => {

  const STORAGE_KEY = 'folio_content';
  let autoSaveTimer = null;

  /* - Update display - */
  function update() {
    const text  = Editor.el.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = (Editor.el.innerHTML.match(/<br|<\/p>|<\/div>|<\/li>/gi) || []).length + 1;

    document.getElementById('wc').textContent = words;
    document.getElementById('cc').textContent = chars;
    document.getElementById('lc').textContent = lines;

    _updateGoal(words);
  }

  function _updateGoal(words) {
    if (!Editor.wordCountGoal) return;
    const pct = Math.min(100, (words / Editor.wordCountGoal) * 100);
    document.getElementById('goalVal').textContent = `${words} / ${Editor.wordCountGoal}`;
    document.getElementById('goalBar').style.width = pct.toFixed(1) + '%';
    document.getElementById('goalBar').style.background =
      words >= Editor.wordCountGoal ? '#5dbf80' : 'var(--accent)';
  }

  /* - Set goal (via modal) - */
  function openGoalModal() {
    Modals.prompt({
      title: 'Word Count Goal',
      fields: [
        {
          id: 'goal',
          label: 'Target word count (leave blank to clear)',
          type: 'number',
          value: Editor.wordCountGoal || '',
          placeholder: 'e.g. 1000',
        }
      ],
      confirmLabel: 'Set Goal',
      onConfirm({ goal }) {
        const n = parseInt(goal);
        if (goal === '' || isNaN(n) || n <= 0) {
          Editor.wordCountGoal = null;
          document.getElementById('goalProgress').style.display = 'none';
          document.getElementById('goalLabel').style.display    = 'none';
          Toast.show('Goal cleared');
        } else {
          Editor.wordCountGoal = n;
          document.getElementById('goalProgress').style.display = 'block';
          document.getElementById('goalLabel').style.display    = 'inline';
          update();
          Toast.show(`Goal set: ${n} words`);
        }
      }
    });
  }

  /* - Auto-save - */
  function setupAutoSave() {
    Editor.el.addEventListener('input', () => {
      update();
      _markUnsaved();
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(_save, 1500);
    });
  }

  function _markUnsaved() {
    const el = document.getElementById('saveStatus');
    el.textContent = 'Unsaved changes';
    el.className = 'unsaved';
  }

  function _save() {
    localStorage.setItem(STORAGE_KEY, Editor.el.innerHTML);
    const el = document.getElementById('saveStatus');
    el.textContent = 'All changes saved';
    el.className = 'saved';
  }

  /* - Restore session - */
  function tryRestore() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    Modals.confirm({
      title: 'Restore Session',
      message: 'A previous session was found. Would you like to restore it?',
      confirmLabel: 'Restore',
      onConfirm() {
        Editor.el.innerHTML = saved;
        update();
        Insert.rehighlight();
        Toast.show('Session restored');
      }
    });
  }

  return { update, openGoalModal, setupAutoSave, tryRestore };
})();
