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
    enableTweetOverlay: defaultSettings.enableTweetOverlay !== false,
    enableTweetComposition: defaultSettings.enableTweetComposition !== false,
  };

  let interestingValuesInput = null;
  let cypherListEl = null;
  let cypherCountEl = null;
  let saveStatusEl = null;
  let selectedInputEl = null;
  let selectedValuesEl = null;
  let selectedSaveButtonEl = null;
  let autoSelectionInput = null;
  let tweetOverlayInput = null;
  let tweetCompositionInput = null;
  let hasUserEditedPhrase = false;
  let pendingSavePromise: Promise<void> | null = null;

  function normalizeSettings(raw) {
    const next = raw || {};
    const enabledCypherIds = Array.isArray(next.enabledCypherIds)
      ? next.enabledCypherIds.filter(id => typeof id === 'string')
      : defaultSettings.enabledCypherIds;

    return {
      enabledCypherIds: enabledCypherIds.length > 0 ? enabledCypherIds : [...defaultSettings.enabledCypherIds],
      interestingValues: utils.parseInterestingValues(next.interestingValues),
      autoShowSelectionOnSelect: next.autoShowSelectionOnSelect === true,
      enableTweetOverlay: next.enableTweetOverlay !== false,
      enableTweetComposition: next.enableTweetComposition !== false,
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
    const phrase = selectedInputEl.value || '';
    const values = utils.calcValuesForText(phrase, settings);
    selectedValuesEl.innerHTML = renderValuesBadges(values);
  }

  async function readSavedEntries() {
    const data = await chrome.storage.local.get(storageKeys.savedEntries);
    const entries = data[storageKeys.savedEntries];
    return Array.isArray(entries) ? entries : [];
  }

  async function writeSavedEntries(entries) {
    await chrome.storage.local.set({ [storageKeys.savedEntries]: entries });
  }

  async function saveSelectedPhrase() {
    if (pendingSavePromise) {
      await pendingSavePromise;
      return;
    }

    pendingSavePromise = (async () => {
      if (selectedSaveButtonEl) selectedSaveButtonEl.setAttribute('disabled', 'true');
      if (!selectedInputEl) return;

      const phrase = utils.sanitizeText(selectedInputEl.value || '');
      if (!phrase) {
        if (saveStatusEl) {
          saveStatusEl.textContent = 'Type text to save';
          setTimeout(() => {
            if (saveStatusEl && saveStatusEl.textContent === 'Type text to save') saveStatusEl.textContent = '';
          }, 900);
        }
        return;
      }

      if (saveStatusEl) saveStatusEl.textContent = 'Saving...';

      const values = utils.calcValuesForText(phrase, settings);
      let link = 'https://num.qliphoth.systems/gematria';
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0] && typeof tabs[0].url === 'string' && tabs[0].url) {
          link = tabs[0].url;
        }
      } catch {}

      const entries = await readSavedEntries();
      const nextEntry = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        createdAt: Date.now(),
        context: 'popup',
        phrase,
        values,
        link,
      };

      await writeSavedEntries([nextEntry, ...entries].slice(0, 500));
      if (saveStatusEl) {
        saveStatusEl.textContent = 'Text saved';
        setTimeout(() => {
          if (saveStatusEl && saveStatusEl.textContent === 'Text saved') saveStatusEl.textContent = '';
        }, 900);
      }
    })().finally(() => {
      if (selectedSaveButtonEl) selectedSaveButtonEl.removeAttribute('disabled');
    });

    try {
      await pendingSavePromise;
    } finally {
      pendingSavePromise = null;
    }
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
      enableTweetOverlay: settings.enableTweetOverlay !== false,
      enableTweetComposition: settings.enableTweetComposition !== false,
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
    if (!interestingValuesInput) return;

    interestingValuesInput.setValues(settings.interestingValues);
    interestingValuesInput.onChange(async values => {
      settings.interestingValues = utils.parseInterestingValues(values);
      renderPhraseValues();
      await persistSettings();
    });
  }

  function bindSelectionToggle() {
    if (!autoSelectionInput) return;
    autoSelectionInput.checked = settings.autoShowSelectionOnSelect === true;
    autoSelectionInput.dispatchEvent(new Event('change'));

    autoSelectionInput.addEventListener('change', async () => {
      settings.autoShowSelectionOnSelect = autoSelectionInput.checked;
      await persistSettings();
    });
  }

  function bindTwitterFeatureToggles() {
    if (tweetOverlayInput) {
      tweetOverlayInput.checked = settings.enableTweetOverlay !== false;
      tweetOverlayInput.dispatchEvent(new Event('change'));
      tweetOverlayInput.addEventListener('change', async () => {
        settings.enableTweetOverlay = tweetOverlayInput.checked;
        await persistSettings();
      });
    }

    if (tweetCompositionInput) {
      tweetCompositionInput.checked = settings.enableTweetComposition !== false;
      tweetCompositionInput.dispatchEvent(new Event('change'));
      tweetCompositionInput.addEventListener('change', async () => {
        settings.enableTweetComposition = tweetCompositionInput.checked;
        await persistSettings();
      });
    }
  }

  async function openSavedPage() {
    if (pendingSavePromise) {
      try {
        await pendingSavePromise;
      } catch {}
    }

    let targetUrl = 'https://num.qliphoth.systems/gematria';

    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const active = tabs[0];
      if (active && active.url) {
        const base = new URL(active.url);
        const host = base.hostname.toLowerCase();
        const localHost = host === 'localhost' || host === '127.0.0.1';
        const appHost = host === 'num.qliphoth.systems';
        if ((base.protocol === 'http:' || base.protocol === 'https:') && (localHost || appHost)) {
          targetUrl = `${base.origin}/gematria`;
        }
      }
    } catch {
      targetUrl = 'https://num.qliphoth.systems/gematria';
    }

    await chrome.tabs.create({ url: targetUrl });
  }

  function mountUi() {
    popupRoot.innerHTML = '';

    const selectedPanel = ui.createPanel({
      title: 'Text',
    });

    const selectedInputField = document.createElement('span');
    selectedInputField.className = 'ui-terminal-field ui-terminal-field-area gm-popup-text-shell';

    selectedInputEl = ui.createTextArea({
      className: 'ui-terminal-input ui-terminal-area gm-popup-textarea',
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

    selectedInputField.appendChild(selectedInputEl);
    selectedPanel.body.appendChild(selectedInputField);
    selectedPanel.body.appendChild(selectedValuesEl);

    const selectedActions = document.createElement('div');
    selectedActions.className = 'gm-popup-action-row';
    const savedLink = document.createElement('a');
    savedLink.href = '#';
    savedLink.className = 'gm-popup-saved-link';
    savedLink.textContent = 'View saved items';
    savedLink.addEventListener('click', event => {
      event.preventDefault();
      void openSavedPage();
    });
    selectedActions.appendChild(savedLink);
    selectedSaveButtonEl = ui.createButton({ label: 'Save' });
    selectedSaveButtonEl.classList.add('gm-popup-save-text');
    selectedSaveButtonEl.addEventListener('click', async event => {
      event.preventDefault();
      await saveSelectedPhrase();
    });
    selectedActions.appendChild(selectedSaveButtonEl);
    selectedPanel.body.appendChild(selectedActions);

    const settingsPanel = ui.createPanel({
      title: 'Settings',
      collapsible: true,
      defaultOpen: false,
    });

    const behaviorField = document.createElement('section');
    behaviorField.className = 'gm-popup-field';
    const behaviorHeading = document.createElement('h3');
    behaviorHeading.className = 'gm-popup-field-title';
    behaviorHeading.textContent = 'Behavior';
    const selectionToggle = ui.createCheckboxRow({
      label: 'Auto-show values',
      description: 'Show selected-text values every time text is selected.',
      accent: '#10ff50',
      checked: false,
    });
    const tweetOverlayToggle = ui.createCheckboxRow({
      label: 'Twitter overlay',
      description: 'Show tweet hover cards and highlights on Twitter/X.',
      accent: '#10ff50',
      checked: true,
    });
    const tweetCompositionToggle = ui.createCheckboxRow({
      label: 'Tweet composition',
      description: 'Show live gematria values while composing tweets.',
      accent: '#10ff50',
      checked: true,
    });
    autoSelectionInput = selectionToggle.input;
    tweetOverlayInput = tweetOverlayToggle.input;
    tweetCompositionInput = tweetCompositionToggle.input;
    behaviorField.appendChild(behaviorHeading);
    behaviorField.appendChild(selectionToggle.row);
    behaviorField.appendChild(tweetOverlayToggle.row);
    behaviorField.appendChild(tweetCompositionToggle.row);

    const interestingField = document.createElement('section');
    interestingField.className = 'gm-popup-field';
    const interestingHeading = document.createElement('h3');
    interestingHeading.className = 'gm-popup-field-title';
    interestingHeading.textContent = 'Interesting values';

    interestingValuesInput = ui.createNumericPillInput({
      className: 'gm-popup-pill-input',
      listClassName: 'gm-popup-pill-list',
      entryClassName: 'gm-popup-pill-entry',
      pillClassName: 'gm-popup-pill',
      placeholder: 'Enter values',
      values: settings.interestingValues,
    });

    const valuesHint = document.createElement('p');
    valuesHint.className = 'gm-popup-hint';
    valuesHint.textContent = 'Separate numbers with commas, spaces, or new lines.';

    interestingField.appendChild(interestingHeading);
    interestingField.appendChild(interestingValuesInput.root);
    interestingField.appendChild(valuesHint);

    const cypherField = document.createElement('section');
    cypherField.className = 'gm-popup-field';
    const cypherLabelRow = document.createElement('div');
    cypherLabelRow.className = 'gm-popup-label-row';

    const cypherHeading = document.createElement('h3');
    cypherHeading.className = 'gm-popup-field-title';
    cypherHeading.textContent = 'Enabled cyphers';

    cypherCountEl = document.createElement('span');
    cypherCountEl.className = 'gm-popup-count';

    cypherLabelRow.appendChild(cypherHeading);
    cypherLabelRow.appendChild(cypherCountEl);

    cypherListEl = document.createElement('div');
    cypherListEl.className = 'gm-popup-list';

    cypherField.appendChild(cypherLabelRow);
    cypherField.appendChild(cypherListEl);

    settingsPanel.body.appendChild(behaviorField);
    settingsPanel.body.appendChild(interestingField);
    settingsPanel.body.appendChild(cypherField);

    saveStatusEl = document.createElement('div');
    saveStatusEl.className = 'gm-popup-status';

    popupRoot.appendChild(selectedPanel.root);
    popupRoot.appendChild(settingsPanel.root);
    popupRoot.appendChild(saveStatusEl);
  }

  async function init() {
    mountUi();
    await loadSettings();
    renderCypherList();
    bindInterestingValues();
    bindSelectionToggle();
    bindTwitterFeatureToggles();
    await refreshSelectedTextPreview({ forcePopulate: true });
  }

  init();
})();
