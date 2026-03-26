// ─── state.js ─────────────────────────────────────────────────────────────────
// Central shared state and DOM references.
// All modules import from here rather than querying the DOM repeatedly.
// ─────────────────────────────────────────────────────────────────────────────

const Editor = {
  // The contenteditable element
  el: null,

  // Runtime state
  wordCountGoal: null,
  isPreviewMode: false,
  isDark: false,
  savedContent: '',
  selectedImg: null,
  savedRange: null,
  autoSaveTimer: null,
  toastTimer: null,

  // Initialise reference — called once from main.js
  init() {
    this.el = document.getElementById('editor');
  },

  focus() {
    this.el.focus();
  }
};
