(() => {
  const namespace = (globalThis as any).GematriaPlugin || {} as Partial<GematriaPluginNamespace>;

  function createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    className?: string,
    text?: string
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (typeof text === 'string') element.textContent = text;
    return element;
  }

  interface PanelOptions {
    title?: string;
    subtitle?: string;
    className?: string;
    collapsible?: boolean;
    defaultOpen?: boolean;
  }

  function createPanel({ title, subtitle, className = '', collapsible = false, defaultOpen = true }: PanelOptions = {}): GematriaUiPanel {
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
    let toggleButton: HTMLButtonElement | null = null;
    const body = createElement('div', 'gm-cyber-panel-body');
    if (collapsible) {
      root.classList.add('gm-cyber-panel-collapsible');
      toggleButton = createElement('button', 'gm-cyber-panel-toggle');
      toggleButton.type = 'button';
      head.appendChild(toggleButton);
    }

    function syncOpenState(): void {
      if (!collapsible) return;
      root.classList.toggle('gm-cyber-panel-collapsed', !open);
      if (toggleButton) {
        toggleButton.textContent = open ? 'v' : '>';
        toggleButton.setAttribute('aria-label', `${open ? 'Collapse' : 'Expand'} ${title || 'section'}`);
        toggleButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
    }

    function setOpen(nextOpen: boolean): void {
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

  interface ButtonOptions {
    label?: string;
    className?: string;
    type?: string;
  }

  function createButton({ label, className = '', type = 'button' }: ButtonOptions = {}): HTMLButtonElement {
    const button = createElement('button', `gm-cyber-button ${className}`.trim(), label || 'Button');
    button.type = type as HTMLButtonElement['type'];
    return button;
  }

  interface TextAreaOptions {
    className?: string;
    rows?: number;
    placeholder?: string;
    spellcheck?: boolean;
    value?: string;
  }

  function createTextArea({
    className = '',
    rows = 3,
    placeholder = '',
    spellcheck = false,
    value = '',
  }: TextAreaOptions = {}): HTMLTextAreaElement {
    const textarea = createElement('textarea', className.trim());
    textarea.rows = Number.isInteger(rows) ? rows : 3;
    textarea.placeholder = `${placeholder || ''}`;
    textarea.spellcheck = spellcheck === true;
    textarea.value = `${value || ''}`;
    return textarea;
  }

  interface NumericPillInputOptions {
    className?: string;
    listClassName?: string;
    entryClassName?: string;
    pillClassName?: string;
    values?: number[];
    placeholder?: string;
  }

  function parseNumericPills(raw: unknown): number[] {
    const matches = `${raw || ''}`.match(/-?\d+/g);
    if (!matches) return [];
    return matches.map(value => Number(value)).filter(value => Number.isFinite(value));
  }

  function createNumericPillInput({
    className = '',
    listClassName = '',
    entryClassName = '',
    pillClassName = '',
    values = [],
    placeholder = '',
  }: NumericPillInputOptions = {}): GematriaUiNumericPillInput {
    const root = createElement('span', `ui-pill-input-field ${className}`.trim());
    const list = createElement('span', `ui-pill-input-list ${listClassName}`.trim());
    const input = createElement('input', `ui-pill-input-entry ${entryClassName}`.trim()) as HTMLInputElement;
    input.type = 'text';
    input.spellcheck = false;
    input.placeholder = `${placeholder || ''}`;

    root.appendChild(list);
    root.appendChild(input);

    let currentValues = Array.isArray(values) ? parseNumericPills(values.join(',')) : [];
    const listeners = new Set<(values: number[]) => void>();

    function notify(): void {
      const snapshot = [...currentValues];
      for (const listener of listeners) listener(snapshot);
    }

    function renderPills(): void {
      list.innerHTML = '';
      currentValues.forEach((value, index) => {
        const pill = createElement('span', `gm-cyber-badge ui-pill-input-pill ${pillClassName}`.trim(), `${value}`);
        const removeButton = createElement('button', 'ui-pill-input-close', 'x') as HTMLButtonElement;
        removeButton.type = 'button';
        removeButton.setAttribute('aria-label', `Remove ${value}`);
        removeButton.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          currentValues = currentValues.filter((_, valueIndex) => valueIndex !== index);
          renderPills();
          notify();
          input.focus();
        });
        pill.appendChild(removeButton);
        list.appendChild(pill);
      });
    }

    function appendFromRaw(raw: unknown): boolean {
      const nextValues = parseNumericPills(raw);
      if (nextValues.length === 0) return false;
      currentValues = [...currentValues, ...nextValues];
      renderPills();
      notify();
      return true;
    }

    function commitDraft(): boolean {
      const committed = appendFromRaw(input.value);
      input.value = '';
      return committed;
    }

    input.addEventListener('input', () => {
      if (/[,\s]/.test(input.value)) {
        commitDraft();
      }
    });

    input.addEventListener('keydown', event => {
      if (event.key === 'Backspace' && !input.value && currentValues.length > 0) {
        event.preventDefault();
        currentValues = currentValues.slice(0, -1);
        renderPills();
        notify();
        return;
      }

      if (event.key === 'Enter' || event.key === 'Tab' || event.key === ',' || event.key === ' ') {
        event.preventDefault();
        commitDraft();
      }
    });

    input.addEventListener('blur', () => {
      commitDraft();
    });

    input.addEventListener('paste', event => {
      const pasted = event.clipboardData ? event.clipboardData.getData('text') : '';
      const parsed = parseNumericPills(pasted);
      if (parsed.length === 0) return;
      event.preventDefault();
      currentValues = [...currentValues, ...parsed];
      renderPills();
      notify();
      input.value = '';
    });

    renderPills();

    return {
      root,
      list,
      input,
      getValues() {
        return [...currentValues];
      },
      setValues(nextValues: number[] = []) {
        currentValues = parseNumericPills(Array.isArray(nextValues) ? nextValues.join(',') : '');
        renderPills();
      },
      onChange(listener: (values: number[]) => void) {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
      focus() {
        input.focus();
      },
    };
  }

  function createInput({
    className = '',
    type = 'text',
    placeholder = '',
    spellcheck = false,
    value = '',
    autocomplete = '',
    name = '',
  } = {}): HTMLInputElement {
    const input = createElement('input', className.trim()) as HTMLInputElement;
    input.type = type as HTMLInputElement['type'];
    input.placeholder = `${placeholder || ''}`;
    input.spellcheck = spellcheck === true;
    input.value = `${value || ''}`;
    if (autocomplete) input.autocomplete = autocomplete as AutoFill;
    if (name) input.name = `${name}`;
    return input;
  }

  function createSelect({
    className = '',
    options = [] as any[],
    value = undefined as string | undefined,
    ariaLabel = '',
    name = '',
  } = {}): HTMLSelectElement {
    const select = createElement('select', className.trim()) as HTMLSelectElement;
    if (ariaLabel) select.setAttribute('aria-label', ariaLabel);
    if (name) select.name = `${name}`;

    for (const option of options) {
      const normalized =
        option && typeof option === 'object'
          ? option
          : {
              label: `${option || ''}`,
              value: `${option || ''}`,
            };
      const optionEl = createElement('option', '', `${normalized.label || ''}`) as HTMLOptionElement;
      optionEl.value = `${normalized.value || ''}`;
      optionEl.disabled = normalized.disabled === true;
      if (normalized.selected === true) optionEl.selected = true;
      select.appendChild(optionEl);
    }

    if (value !== undefined && value !== null) select.value = `${value}`;
    return select;
  }

  function createBadge({ label, value, accent, highlight = false, className = '' }: GematriaUiBadgeOptions = {}): HTMLSpanElement {
    const badge = createElement(
      'span',
      `gm-cyber-badge ${highlight ? 'gm-cyber-badge-hit' : ''} ${className}`.trim(),
      `${label || ''}${value !== undefined ? ` ${value}` : ''}`.trim()
    );
    if (accent) badge.style.setProperty('--gm-accent', accent);
    return badge;
  }

  interface CheckboxRowOptions {
    label?: string;
    description?: string;
    checked?: boolean;
    accent?: string;
  }

  function createCheckboxRow({
    label,
    description,
    checked = false,
    accent = '#10ff50',
  }: CheckboxRowOptions = {}): GematriaUiCheckboxResult {
    const row = createElement('label', 'gm-cyber-chip-checkbox-row');
    row.style.setProperty('--gm-accent', accent);

    const input = createElement('input', 'gm-cyber-chip-checkbox-input');
    input.type = 'checkbox';
    input.checked = checked;

    const textWrap = createElement('span', 'gm-cyber-chip-checkbox-text');
    const labelEl = createElement('span', 'gm-cyber-chip-checkbox-label', label || '');
    textWrap.appendChild(labelEl);

    if (description) {
      const descEl = createElement('span', 'gm-cyber-chip-checkbox-sub', description);
      textWrap.appendChild(descEl);
    }

    const dot = createElement('span', 'gm-cyber-chip-checkbox-dot');
    dot.setAttribute('aria-hidden', 'true');

    const sync = (): void => {
      row.classList.toggle('gm-cyber-chip-checkbox-checked', input.checked);
    };
    input.addEventListener('change', sync);
    sync();

    row.appendChild(input);
    row.appendChild(textWrap);
    row.appendChild(dot);

    return { row, input, textWrap, labelEl };
  }

  interface SelectionRowOptions {
    label?: string;
    description?: string;
    checked?: boolean;
    accent?: string;
    popupTitle?: string;
    popupText?: string;
    popupBadges?: GematriaUiBadgeOptions[];
  }

  function createSelectionRowWithPopup({
    label,
    description,
    checked = false,
    accent,
    popupTitle,
    popupText,
    popupBadges = [],
  }: SelectionRowOptions = {}): GematriaUiSelectionRowResult {
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

  interface CypherSelectionRowOptions {
    label?: string;
    icon?: string;
    checked?: boolean;
    accent?: string;
    popupTitle?: string;
    popupText?: string;
    popupBadges?: GematriaUiBadgeOptions[];
  }

  function createCypherSelectionRowWithPopup({
    label,
    icon,
    checked = false,
    accent,
    popupTitle,
    popupText,
    popupBadges = [],
  }: CypherSelectionRowOptions = {}): { root: HTMLDivElement; row: HTMLLabelElement; input: HTMLInputElement; labelEl: HTMLSpanElement } {
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

    function syncCheckedState(): void {
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
    createNumericPillInput,
    createInput,
    createSelect,
    createBadge,
    createCheckboxRow,
    createSelectionRowWithPopup,
    createCypherSelectionRowWithPopup,
  };

  (globalThis as any).GematriaPlugin = namespace as GematriaPluginNamespace;
})();
