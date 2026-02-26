(() => {
  const namespace = globalThis.GematriaPlugin || {};

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (typeof text === 'string') element.textContent = text;
    return element;
  }

  function createPanel({ title, subtitle, className = '' } = {}) {
    const root = createElement('section', `gm-cyber-panel ${className}`.trim());
    const head = createElement('header', 'gm-cyber-panel-head');
    const titleEl = createElement('h2', 'gm-cyber-panel-title', title || '');
    head.appendChild(titleEl);

    if (subtitle) {
      const subtitleEl = createElement('p', 'gm-cyber-panel-subtitle', subtitle);
      head.appendChild(subtitleEl);
    }

    const body = createElement('div', 'gm-cyber-panel-body');
    root.appendChild(head);
    root.appendChild(body);

    return { root, head, body, titleEl };
  }

  function createButton({ label, className = '', type = 'button' } = {}) {
    const button = createElement('button', `gm-cyber-button ${className}`.trim(), label || 'Button');
    button.type = type;
    return button;
  }

  function createBadge({ label, value, accent, highlight = false, className = '' } = {}) {
    const badge = createElement(
      'span',
      `gm-cyber-badge ${highlight ? 'gm-cyber-badge-hit' : ''} ${className}`.trim(),
      `${label || ''}${value !== undefined ? ` ${value}` : ''}`.trim()
    );
    if (accent) badge.style.setProperty('--gm-accent', accent);
    return badge;
  }

  function createCheckboxRow({ label, description, checked = false } = {}) {
    const row = createElement('label', 'gm-cyber-checkbox-row');
    const input = createElement('input', 'gm-cyber-checkbox-input');
    input.type = 'checkbox';
    input.checked = checked;

    const textWrap = createElement('span', 'gm-cyber-checkbox-text');
    const labelEl = createElement('span', 'gm-cyber-checkbox-label', label || '');
    textWrap.appendChild(labelEl);

    if (description) {
      const descEl = createElement('span', 'gm-cyber-checkbox-sub', description);
      textWrap.appendChild(descEl);
    }

    row.appendChild(input);
    row.appendChild(textWrap);

    return { row, input, textWrap, labelEl };
  }

  namespace.ui = {
    createPanel,
    createButton,
    createBadge,
    createCheckboxRow,
  };

  globalThis.GematriaPlugin = namespace;
})();
