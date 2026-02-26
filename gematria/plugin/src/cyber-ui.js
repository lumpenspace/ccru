(() => {
  const namespace = globalThis.GematriaPlugin || {};

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (typeof text === 'string') element.textContent = text;
    return element;
  }

  function createPanel({ title, subtitle, className = '', collapsible = false, defaultOpen = true } = {}) {
    const root = createElement('section', `gm-cyber-panel ${className}`.trim());
    const head = createElement('header', 'gm-cyber-panel-head');
    const headMain = createElement('div', 'gm-cyber-panel-head-main');
    const titleEl = createElement('h2', 'gm-cyber-panel-title', title || '');
    headMain.appendChild(titleEl);

    if (subtitle) {
      const subtitleEl = createElement('p', 'gm-cyber-panel-subtitle', subtitle);
      headMain.appendChild(subtitleEl);
    }

    head.appendChild(headMain);

    let open = defaultOpen !== false;
    let toggleButton = null;
    const body = createElement('div', 'gm-cyber-panel-body');
    if (collapsible) {
      root.classList.add('gm-cyber-panel-collapsible');
      toggleButton = createElement('button', 'gm-cyber-panel-toggle');
      toggleButton.type = 'button';
      head.appendChild(toggleButton);
    }

    function syncOpenState() {
      if (!collapsible) return;
      root.classList.toggle('gm-cyber-panel-collapsed', !open);
      if (toggleButton) {
        toggleButton.textContent = open ? 'v' : '>';
        toggleButton.setAttribute('aria-label', `${open ? 'Collapse' : 'Expand'} ${title || 'section'}`);
        toggleButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
    }

    function setOpen(nextOpen) {
      open = nextOpen === true;
      syncOpenState();
    }

    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        setOpen(!open);
      });
    }

    syncOpenState();
    root.appendChild(head);
    root.appendChild(body);

    return {
      root,
      head,
      body,
      titleEl,
      toggleButton,
      setOpen,
      isOpen: () => open,
    };
  }

  function createButton({ label, className = '', type = 'button' } = {}) {
    const button = createElement('button', `gm-cyber-button ${className}`.trim(), label || 'Button');
    button.type = type;
    return button;
  }

  function createTextArea({
    className = '',
    rows = 3,
    placeholder = '',
    spellcheck = false,
    value = '',
  } = {}) {
    const textarea = createElement('textarea', className.trim());
    textarea.rows = Number.isInteger(rows) ? rows : 3;
    textarea.placeholder = `${placeholder || ''}`;
    textarea.spellcheck = spellcheck === true;
    textarea.value = `${value || ''}`;
    return textarea;
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

  function createSelectionRowWithPopup({
    label,
    description,
    checked = false,
    accent,
    popupTitle,
    popupText,
    popupBadges = [],
  } = {}) {
    const root = createElement('div', 'gm-cyber-select-wrap');
    if (accent) root.style.setProperty('--gm-accent', accent);
    const row = createElement('label', 'gm-cyber-select-row');

    const bar = createElement('span', 'gm-cyber-select-bar');
    if (accent) bar.style.setProperty('--gm-accent', accent);

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

    row.appendChild(bar);
    row.appendChild(input);
    row.appendChild(textWrap);
    root.appendChild(row);

    if (popupTitle || popupText || (Array.isArray(popupBadges) && popupBadges.length > 0)) {
      const popup = createElement('div', 'gm-cyber-side-popover');
      if (popupTitle) {
        const titleEl = createElement('div', 'gm-cyber-side-popover-title', popupTitle);
        popup.appendChild(titleEl);
      }

      if (popupText) {
        const textEl = createElement('div', 'gm-cyber-side-popover-text', popupText);
        popup.appendChild(textEl);
      }

      if (Array.isArray(popupBadges) && popupBadges.length > 0) {
        const badgesWrap = createElement('div', 'gm-values gm-cyber-side-popover-values');
        for (const badge of popupBadges) {
          const badgeEl = createElement(
            'span',
            'gm-cyber-inline-value',
            `${badge.label || ''}${badge.value !== undefined ? ` ${badge.value}` : ''}`.trim()
          );
          if (badge.accent) badgeEl.style.setProperty('--gm-accent', badge.accent);
          badgesWrap.appendChild(badgeEl);
        }
        popup.appendChild(badgesWrap);
      }

      root.appendChild(popup);
    }

    return { root, row, input, textWrap, labelEl };
  }

  function createCypherSelectionRowWithPopup({
    label,
    icon,
    checked = false,
    accent,
    popupTitle,
    popupText,
    popupBadges = [],
  } = {}) {
    const root = createElement('div', 'gm-cyber-cipher-wrap');
    if (accent) root.style.setProperty('--gm-accent', accent);

    const row = createElement('label', 'gm-cyber-cipher-row');

    const input = createElement('input', 'gm-cyber-cipher-input');
    input.type = 'checkbox';
    input.checked = checked;

    const iconEl = createElement('span', 'gm-cyber-cipher-icon', icon || '?');
    const labelEl = createElement('span', 'gm-cyber-cipher-label', label || '');
    const dotEl = createElement('span', 'gm-cyber-cipher-dot');

    row.appendChild(input);
    row.appendChild(iconEl);
    row.appendChild(labelEl);
    row.appendChild(dotEl);
    root.appendChild(row);

    function syncCheckedState() {
      root.classList.toggle('gm-cyber-cipher-checked', input.checked);
    }
    syncCheckedState();
    input.addEventListener('change', syncCheckedState);

    if (popupTitle || popupText || (Array.isArray(popupBadges) && popupBadges.length > 0)) {
      const popup = createElement('div', 'gm-cyber-side-popover gm-cyber-cipher-popover');
      if (popupTitle) {
        const titleEl = createElement('div', 'gm-cyber-side-popover-title', popupTitle);
        popup.appendChild(titleEl);
      }

      if (popupText) {
        const textEl = createElement('div', 'gm-cyber-side-popover-text', popupText);
        popup.appendChild(textEl);
      }

      if (Array.isArray(popupBadges) && popupBadges.length > 0) {
        const badgesWrap = createElement('div', 'gm-values gm-cyber-side-popover-values');
        for (const badge of popupBadges) {
          const badgeEl = createElement(
            'span',
            'gm-cyber-inline-value',
            `${badge.label || ''}${badge.value !== undefined ? ` ${badge.value}` : ''}`.trim()
          );
          if (badge.accent) badgeEl.style.setProperty('--gm-accent', badge.accent);
          badgesWrap.appendChild(badgeEl);
        }
        popup.appendChild(badgesWrap);
      }

      root.appendChild(popup);
    }

    return { root, row, input, labelEl };
  }

  namespace.ui = {
    createPanel,
    createButton,
    createTextArea,
    createBadge,
    createCheckboxRow,
    createSelectionRowWithPopup,
    createCypherSelectionRowWithPopup,
  };

  globalThis.GematriaPlugin = namespace;
})();
