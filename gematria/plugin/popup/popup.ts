(() => {
  const namespace = (globalThis as any).GematriaPlugin;
  if (!namespace || !namespace.ui || !(globalThis as any).chrome || !chrome.storage) return;

  const { ciphers, storageKeys, defaultSettings, utils, ui } = namespace;
  const popupRoot = document.getElementById('popup-root');
  if (!popupRoot) return;

  let settings = {
    enabledCypherIds: [...defaultSettings.enabledCypherIds],
    interestingValues: [...defaultSettings.interestingValues],
    autoShowSelectionOnSelect: defaultSettings.autoShowSelectionOnSelect === true,
  };

  let interestingInputEl = null;
  let interestingPillsEl = null;
  let cypherListEl = null;
  let cypherCountEl = null;
  let saveStatusEl = null;
  let selectedInputEl = null;
  let selectedValuesEl = null;
  let autoSelectionInput = null;
  let hasUserEditedPhrase = false;

  function normalizeSettings(raw) {
    const next = raw || {};
    const enabledCypherIds = Array.isArray(next.enabledCypherIds)
      ? next.enabledCypherIds.filter(id => typeof id === 'string')
      : defaultSettings.enabledCypherIds;

    return {
      enabledCypherIds: enabledCypherIds.length > 0 ? enabledCypherIds : [...defaultSettings.enabledCypherIds],
      interestingValues: utils.parseInterestingValues(next.interestingValues),
      autoShowSelectionOnSelect: next.autoShowSelectionOnSelect === true,
    };
  }

  function normalizeSelectionPayload(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const phrase = utils.sanitizeText(raw.phrase || '');
    if (!phrase) return null;

    const values = Array.isArray(raw.values)
      ? raw.values
          .filter(row => row && Number.isFinite(Number(row.value)))
          .map(row => ({
            id: `${row.id || ''}`,
            shortName: `${row.shortName || row.name || row.id || ''}`,
            icon: `${row.icon || ''}`,
            hue: Number(row.hue),
            saturation: Number(row.saturation),
            lightness: Number(row.lightness),
            value: Number(row.value),
          }))
      : [];

    return { phrase, values };
  }

  function cypherColor(row) {
    const hue = Number.isFinite(row.hue) ? row.hue : 120;
    const saturation = Number.isFinite(row.saturation) ? row.saturation : 65;
    const lightness = Number.isFinite(row.lightness) ? row.lightness : 62;
    return `hsl(${hue} ${saturation}% ${lightness}%)`;
  }

  function cypherGlyph(row) {
    return `${row.icon || row.shortName || row.id || '?'}`;
  }

  function renderValuesBadges(values) {
    const interesting = utils.interestingSetFromSettings(settings);
    if (!Array.isArray(values) || values.length === 0) {
      return '<span class="gm-cyber-muted">No values for current selection.</span>';
    }

    return values
      .map(row => {
        const hitClass = interesting.has(row.value) ? ' gm-cyber-badge-hit' : '';
        return `<span class="gm-cyber-badge${hitClass}" style="--gm-accent:${cypherColor(row)}">${cypherGlyph(row)}: ${row.value}</span>`;
      })
      .join('');
  }

  function renderPhraseValues() {
    if (!selectedInputEl || !selectedValuesEl) return;
    const phrase = utils.sanitizeText(selectedInputEl.value || '');
    if (!phrase) {
      selectedValuesEl.innerHTML = '<span class="gm-cyber-muted">Select text in the active tab, or type here.</span>';
      return;
    }
    const values = utils.calcValuesForText(phrase, settings);
    selectedValuesEl.innerHTML = renderValuesBadges(values);
  }

  function applySelectionToEditor(payload, { forcePopulate = false } = {}) {
    if (!selectedInputEl) return;
    const currentPhrase = utils.sanitizeText(selectedInputEl.value || '');
    const nextPhrase = payload ? utils.sanitizeText(payload.phrase || '') : '';
    const shouldPopulate = !!nextPhrase && (forcePopulate || !hasUserEditedPhrase || !currentPhrase);

    if (shouldPopulate) {
      selectedInputEl.value = nextPhrase;
    } else if (forcePopulate && !nextPhrase && !hasUserEditedPhrase) {
      selectedInputEl.value = '';
    }

    renderPhraseValues();
  }

  async function querySelectionViaScripting(tabId) {
    if (!chrome.scripting || typeof chrome.scripting.executeScript !== 'function') return null;
    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const normalize = value => `${value || ''}`.replace(/\s+/g, ' ').trim();

          const selectionText = normalize(globalThis.getSelection ? globalThis.getSelection()?.toString() : '');
          if (selectionText) return selectionText;

          const active = document.activeElement;
          if (active instanceof HTMLTextAreaElement) {
            const start = Number(active.selectionStart);
            const end = Number(active.selectionEnd);
            if (Number.isInteger(start) && Number.isInteger(end) && end > start) {
              return normalize((active.value || '').slice(start, end));
            }
          }

          if (active instanceof HTMLInputElement) {
            const selectableType = /^(text|search|url|tel|password|email)$/i;
            if (selectableType.test(active.type || 'text')) {
              const start = Number(active.selectionStart);
              const end = Number(active.selectionEnd);
              if (Number.isInteger(start) && Number.isInteger(end) && end > start) {
                return normalize((active.value || '').slice(start, end));
              }
            }
          }

          return '';
        },
      });
      const phrase = utils.sanitizeText((result && result.result) || '');
      if (!phrase) return null;
      return { phrase, values: utils.calcValuesForText(phrase, settings) };
    } catch {
      return null;
    }
  }

  async function loadSettings() {
    const data = await chrome.storage.local.get(storageKeys.settings);
    settings = normalizeSettings(data[storageKeys.settings] || defaultSettings);
  }

  async function persistSettings() {
    const payload = {
      enabledCypherIds: settings.enabledCypherIds,
      interestingValues: settings.interestingValues,
      autoShowSelectionOnSelect: settings.autoShowSelectionOnSelect === true,
    };

    await chrome.storage.local.set({ [storageKeys.settings]: payload });
    if (saveStatusEl) {
      saveStatusEl.textContent = 'Saved';
      setTimeout(() => {
        if (saveStatusEl) saveStatusEl.textContent = '';
      }, 700);
    }
  }

  async function refreshSelectedTextPreview({ forcePopulate = false } = {}) {
    renderPhraseValues();

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (!activeTab || typeof activeTab.id !== 'number') {
      applySelectionToEditor(null, { forcePopulate });
      return;
    }

    let cached = null;
    try {
      cached = normalizeSelectionPayload(
        await chrome.runtime.sendMessage({
          type: 'GEMATRIA_GET_SELECTION_CACHE',
          tabId: activeTab.id,
        })
      );
    } catch {}

    if (cached) applySelectionToEditor(cached, { forcePopulate });
    try {
      const response = await chrome.tabs.sendMessage(activeTab.id, { type: 'GEMATRIA_SELECTION_QUERY' });
      const live = response && (response as any).ok ? normalizeSelectionPayload(response) : null;
      applySelectionToEditor(live || cached || null, { forcePopulate });
    } catch {
      const fallback = await querySelectionViaScripting(activeTab.id);
      applySelectionToEditor(fallback || cached || null, { forcePopulate });
    }
  }

  function renderCypherCount() {
    if (!cypherCountEl) return;
    cypherCountEl.textContent = `${settings.enabledCypherIds.length}/${ciphers.length}`;
  }

  function renderCypherList() {
    if (!cypherListEl) return;

    const enabled = new Set(settings.enabledCypherIds);
    cypherListEl.innerHTML = '';

    for (const cipher of ciphers) {
      const accent = `hsl(${cipher.hue} ${cipher.saturation}% ${cipher.lightness}%)`;
      const previewSize = Math.min(4, cipher.chars.length);
      const popupBadges = [];
      for (let index = 0; index < previewSize; index += 1) {
        popupBadges.push({
          label: cipher.chars[index],
          value: cipher.values[index],
          accent,
        });
      }
      if (cipher.chars.length > previewSize) {
        popupBadges.push({
          label: '...',
          value: cipher.values[cipher.values.length - 1],
          accent,
        });
      }

      const hasCypherRowFactory = typeof ui.createCypherSelectionRowWithPopup === 'function';
      const { root, input } = hasCypherRowFactory
        ? ui.createCypherSelectionRowWithPopup({
            label: cipher.name,
            icon: cipher.icon,
            popupTitle: cipher.name,
            popupText: cipher.summary,
            popupBadges,
            accent,
            checked: enabled.has(cipher.id),
          })
        : ui.createSelectionRowWithPopup({
            label: `${cipher.shortName} - ${cipher.name}`,
            description: cipher.summary,
            popupTitle: cipher.name,
            popupText: cipher.summary,
            popupBadges,
            accent,
            checked: enabled.has(cipher.id),
          });

      input.addEventListener('change', async () => {
        const next = new Set(settings.enabledCypherIds);
        if (input.checked) next.add(cipher.id);
        else next.delete(cipher.id);

        if (next.size === 0) {
          input.checked = true;
          const wrap = input.closest('.gm-cyber-cipher-wrap');
          if (wrap) wrap.classList.add('gm-cyber-cipher-checked');
          return;
        }

        settings.enabledCypherIds = [...next];
        renderCypherCount();
        await persistSettings();
        renderPhraseValues();
      });

      cypherListEl.appendChild(root);
    }

    renderCypherCount();
  }

  function bindInterestingValues() {
    if (!interestingInputEl || !interestingPillsEl) return;

    async function persistInterestingValues() {
      await persistSettings();
      renderPhraseValues();
    }

    async function commitInput(raw) {
      const parsed = utils.parseInterestingValues(raw);
      if (parsed.length === 0) return false;

      settings.interestingValues = [...settings.interestingValues, ...parsed];
      renderInterestingPills();
      interestingInputEl.value = '';
      await persistInterestingValues();
      return true;
    }

    function renderInterestingPills() {
      interestingPillsEl.innerHTML = '';

      for (let index = 0; index < settings.interestingValues.length; index += 1) {
        const value = settings.interestingValues[index];
        const pill = document.createElement('span');
        pill.className = 'gm-cyber-badge gm-popup-pill';
        pill.textContent = `${value}`;

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'gm-popup-pill-close';
        removeButton.textContent = 'x';
        removeButton.setAttribute('aria-label', `Remove ${value}`);
        removeButton.addEventListener('click', async event => {
          event.preventDefault();
          event.stopPropagation();

          settings.interestingValues = settings.interestingValues.filter((_, valueIndex) => valueIndex !== index);
          renderInterestingPills();
          await persistInterestingValues();
        });

        pill.appendChild(removeButton);
        interestingPillsEl.appendChild(pill);
      }
    }

    interestingInputEl.value = '';
    renderInterestingPills();

    interestingInputEl.addEventListener('keydown', async event => {
      if (event.key === 'Backspace' && !interestingInputEl.value && settings.interestingValues.length > 0) {
        event.preventDefault();
        settings.interestingValues = settings.interestingValues.slice(0, -1);
        renderInterestingPills();
        await persistInterestingValues();
        return;
      }

      if (event.key === 'Enter' || event.key === 'Tab' || event.key === ',' || event.key === ' ') {
        event.preventDefault();
        await commitInput(interestingInputEl.value);
      }
    });

    interestingInputEl.addEventListener('input', async () => {
      if (!/[,\s]/.test(interestingInputEl.value)) return;
      await commitInput(interestingInputEl.value);
    });

    interestingInputEl.addEventListener('paste', async event => {
      const pasted = event.clipboardData.getData('text');
      const parsed = utils.parseInterestingValues(pasted);
      if (parsed.length === 0) return;

      event.preventDefault();
      settings.interestingValues = [...settings.interestingValues, ...parsed];
      renderInterestingPills();
      interestingInputEl.value = '';
      await persistInterestingValues();
    });

    interestingInputEl.addEventListener('blur', async () => {
      await commitInput(interestingInputEl.value);
    });
  }

  function bindSelectionToggle() {
    if (!autoSelectionInput) return;
    autoSelectionInput.checked = settings.autoShowSelectionOnSelect === true;

    autoSelectionInput.addEventListener('change', async () => {
      settings.autoShowSelectionOnSelect = autoSelectionInput.checked;
      await persistSettings();
    });
  }

  function openSavedPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      let targetUrl = 'https://num.qliphoth.systems/gematria/saved';

      const active = tabs[0];
      if (active && active.url) {
        try {
          const base = new URL(active.url);
          const host = base.hostname.toLowerCase();
          const localHost = host === 'localhost' || host === '127.0.0.1';
          const appHost = host === 'num.qliphoth.systems';
          if ((base.protocol === 'http:' || base.protocol === 'https:') && (localHost || appHost)) {
            targetUrl = `${base.origin}/gematria/saved`;
          }
        } catch {
          targetUrl = 'https://num.qliphoth.systems/gematria/saved';
        }
      }

      chrome.tabs.create({ url: targetUrl });
    });
  }

  function mountUi() {
    popupRoot.innerHTML = '';

    const selectedPanel = ui.createPanel({
      title: 'Text',
    });

    selectedInputEl = ui.createTextArea({
      className: 'gm-popup-textarea',
      rows: 3,
      placeholder: 'Select text in the active tab, or type here.',
      spellcheck: false,
    });
    selectedInputEl.addEventListener('input', () => {
      hasUserEditedPhrase = true;
      renderPhraseValues();
    });

    selectedValuesEl = document.createElement('div');
    selectedValuesEl.className = 'gm-values';

    selectedPanel.body.appendChild(selectedInputEl);
    selectedPanel.body.appendChild(selectedValuesEl);

    const behaviorPanel = ui.createPanel({
      title: 'Selection Behavior',
      collapsible: true,
      defaultOpen: false,
    });

    const selectionToggle = ui.createSelectionRowWithPopup({
      label: 'Auto-show values',
      description: 'Show selected-text values every time text is selected.',
      popupTitle: 'Auto Selection',
      popupText: 'When enabled, selecting text on any page automatically opens the selected-text value panel.',
      accent: '#10ff50',
      checked: false,
    });
    autoSelectionInput = selectionToggle.input;
    behaviorPanel.body.appendChild(selectionToggle.root);

    const interestingPanel = ui.createPanel({
      title: 'Interesting Values',
      collapsible: true,
      defaultOpen: false,
    });
    const valuesLabel = document.createElement('div');
    valuesLabel.className = 'gm-popup-label';
    valuesLabel.textContent = 'Highlight values';

    const interestingField = document.createElement('div');
    interestingField.className = 'gm-popup-pill-input';

    interestingPillsEl = document.createElement('div');
    interestingPillsEl.className = 'gm-popup-pill-list';

    interestingInputEl = document.createElement('input');
    interestingInputEl.type = 'text';
    interestingInputEl.className = 'gm-popup-pill-entry';
    interestingInputEl.placeholder = 'Enter values';
    interestingInputEl.spellcheck = false;
    interestingField.appendChild(interestingPillsEl);
    interestingField.appendChild(interestingInputEl);

    const valuesHint = document.createElement('p');
    valuesHint.className = 'gm-popup-hint';
    valuesHint.textContent = 'Type numbers, then press comma, space, tab, or enter.';

    interestingPanel.body.appendChild(valuesLabel);
    interestingPanel.body.appendChild(interestingField);
    interestingPanel.body.appendChild(valuesHint);

    const cypherPanel = ui.createPanel({
      title: 'Cyphers',
      collapsible: true,
      defaultOpen: false,
    });

    const cypherLabelRow = document.createElement('div');
    cypherLabelRow.className = 'gm-popup-label-row';

    const cypherLabel = document.createElement('span');
    cypherLabel.className = 'gm-popup-label';
    cypherLabel.textContent = 'Enabled';

    cypherCountEl = document.createElement('span');
    cypherCountEl.className = 'gm-popup-count';

    cypherLabelRow.appendChild(cypherLabel);
    cypherLabelRow.appendChild(cypherCountEl);

    cypherListEl = document.createElement('div');
    cypherListEl.className = 'gm-popup-list';

    cypherPanel.body.appendChild(cypherLabelRow);
    cypherPanel.body.appendChild(cypherListEl);

    const actionsPanel = ui.createPanel({
      title: 'Actions',
      collapsible: true,
      defaultOpen: false,
    });
    const actionRow = document.createElement('div');
    actionRow.className = 'gm-popup-action-row';

    const openSavedButton = ui.createButton({ label: 'Open /gematria/saved' });
    openSavedButton.addEventListener('click', openSavedPage);

    saveStatusEl = document.createElement('div');
    saveStatusEl.className = 'gm-popup-status';

    actionRow.appendChild(openSavedButton);
    actionRow.appendChild(saveStatusEl);
    actionsPanel.body.appendChild(actionRow);

    popupRoot.appendChild(selectedPanel.root);
    popupRoot.appendChild(behaviorPanel.root);
    popupRoot.appendChild(interestingPanel.root);
    popupRoot.appendChild(cypherPanel.root);
    popupRoot.appendChild(actionsPanel.root);
  }

  async function init() {
    mountUi();
    await loadSettings();
    renderCypherList();
    bindInterestingValues();
    bindSelectionToggle();
    await refreshSelectedTextPreview({ forcePopulate: true });
  }

  init();
})();
