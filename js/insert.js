// ─── insert.js ────────────────────────────────────────────────────────────────
// All "Insert" operations: table, link, image, code block, inline code,
// blockquote, page break, and symbol insertion.
// Uses Modals.prompt() — no browser prompt() / confirm() calls.
// ─────────────────────────────────────────────────────────────────────────────

const Insert = (() => {

  /* ── Helpers ──────────────────────────────────────────── */
  function exec(cmd, val = null) { Formatting.execCmd(cmd, val); }

  function saveRange() {
    const sel = window.getSelection();
    return (sel && sel.rangeCount > 0) ? sel.getRangeAt(0).cloneRange() : null;
  }
  function restoreRange(range) {
    if (!range) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ── Table ────────────────────────────────────────────── */
  function table() {
    Modals.prompt({
      title: 'Insert Table',
      fields: [
        { id:'rows',   label:'Rows',     type:'number', value:'3', placeholder:'3' },
        { id:'cols',   label:'Columns',  type:'number', value:'3', placeholder:'3' },
        { id:'header', label:'Include header row', type:'checkbox', value: true },
      ],
      confirmLabel: 'Insert',
      onConfirm({ rows, cols, header }) {
        const r = Math.max(1, parseInt(rows) || 1);
        const c = Math.max(1, parseInt(cols) || 1);
        let html = '<table><tbody>';
        for (let i = 0; i < r; i++) {
          html += '<tr>';
          for (let j = 0; j < c; j++) {
            const tag = (i === 0 && header) ? 'th' : 'td';
            html += `<${tag}><br></${tag}>`;
          }
          html += '</tr>';
        }
        html += '</tbody></table><p><br></p>';
        Editor.el.focus();
        exec('insertHTML', html);
      }
    });
  }

  /* ── Link ─────────────────────────────────────────────── */
  function link() {
    // Save selection before modal opens (async)
    const range = saveRange();
    const selText = range ? range.toString() : '';

    Modals.prompt({
      title: 'Insert Link',
      fields: [
        { id:'url',  label:'URL',                              type:'url',  value:'', placeholder:'https://' },
        { id:'text', label:'Display text (leave blank to use selection)', type:'text', value: selText, placeholder: selText || 'Link text' },
      ],
      confirmLabel: 'Insert',
      onConfirm({ url, text }) {
        if (!url) return;
        restoreRange(range);
        Editor.el.focus();
        if (text) {
          exec('insertHTML', `<a href="${url}">${escHtml(text)}</a>`);
        } else {
          exec('createLink', url);
        }
      }
    });
  }

  /* ── Image (file picker → inline base64) ─────────────── */
  function image() {
    document.getElementById('imageInput').click();
  }

  function onImageFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      Editor.el.focus();
      exec('insertHTML', `<img src="${e.target.result}" style="max-width:100%;" data-wrap="none"><p><br></p>`);
      Toast.show('Image inserted — click to reposition & resize');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  /* ── Code block ───────────────────────────────────────── */
  function codeBlock() {
    const sel = window.getSelection();
    const selectedText = (sel && !sel.isCollapsed) ? sel.toString() : '';

    Modals.prompt({
      title: 'Insert Code Block',
      fields: [
        {
          id: 'lang',
          label: 'Language',
          type: 'select',
          value: 'javascript',
          options: [
            { value:'',           label:'Plain text' },
            { value:'javascript', label:'JavaScript' },
            { value:'typescript', label:'TypeScript' },
            { value:'python',     label:'Python' },
            { value:'html',       label:'HTML' },
            { value:'css',        label:'CSS' },
            { value:'json',       label:'JSON' },
            { value:'bash',       label:'Bash / Shell' },
            { value:'sql',        label:'SQL' },
            { value:'markdown',   label:'Markdown' },
            { value:'cpp',        label:'C / C++' },
            { value:'java',       label:'Java' },
            { value:'rust',       label:'Rust' },
            { value:'go',         label:'Go' },
          ]
        }
      ],
      confirmLabel: 'Insert',
      onConfirm({ lang }) {
        // Delete selection first if any
        if (selectedText && sel.rangeCount > 0) {
          sel.getRangeAt(0).deleteContents();
        }
        const html = `
<div class="code-block" contenteditable="false">
  <div class="code-block-header">
    <span class="code-lang-tag">${lang || 'plain text'}</span>
    <button class="copy-btn" onclick="Insert.copyCode(this)">Copy</button>
  </div>
  <code class="${lang ? 'language-' + lang : ''}" contenteditable="true" spellcheck="false">${escHtml(selectedText)}</code>
</div><p><br></p>`;
        Editor.el.focus();
        exec('insertHTML', html);
        setTimeout(rehighlight, 60);
      }
    });
  }

  function copyCode(btn) {
    const code = btn.closest('.code-block').querySelector('code');
    navigator.clipboard.writeText(code.textContent).then(() => {
      btn.textContent = 'Copied!';
      btn.classList.add('done');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 2000);
    });
  }

  /* ── Inline code ──────────────────────────────────────── */
  function inlineCode() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const text  = range.toString();
    const code  = document.createElement('code');
    code.className   = 'inline-code';
    code.textContent = text || 'code';
    range.deleteContents();
    range.insertNode(code);
    range.setStartAfter(code);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /* ── Blockquote ───────────────────────────────────────── */
  function blockquote() {
    const sel  = window.getSelection();
    const text = (sel && !sel.isCollapsed) ? sel.toString() : '';
    Editor.el.focus();
    exec('insertHTML', `<blockquote>${escHtml(text) || '<br>'}</blockquote><p><br></p>`);
  }

  /* ── Page break ───────────────────────────────────────── */
  function pageBreak() {
    Editor.el.focus();
    exec('insertHTML', '<div class="page-break"></div><p><br></p>');
  }

  /* ── Symbol ───────────────────────────────────────────── */
  function symbol(sym) {
    if (!sym) return;
    Editor.el.focus();
    exec('insertText', sym);
  }

  /* ── Prism re-highlight ───────────────────────────────── */
  function rehighlight() {
    document.querySelectorAll('.code-block code[class*="language-"]')
      .forEach(el => Prism.highlightElement(el));
  }

  return { table, link, image, onImageFile, codeBlock, copyCode, inlineCode, blockquote, pageBreak, symbol, rehighlight };
})();
