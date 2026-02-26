(() => {
  const namespace = globalThis.GematriaPlugin;
  if (!namespace || !namespace.ui || !globalThis.chrome || !chrome.storage) return;

  const { ciphers, storageKeys, defaultSettings, utils, ui } = namespace;
  const popupRoot = document.getElementById('popup-root');
  if (!popupRoot) return;

  let settings = {
    enabledCypherIds: [...defaultSettings.enabledCypherIds],
    interestingValues: [...defaultSettings.interestingValues],
  };

  let interestingTextarea = null;
  let cypherListEl = null;
  let cypherCountEl = null;
  let saveStatusEl = null;

  function normalizeSettings(raw) {
    const next = raw || {};
    const enabledCypherIds = Array.isArray(next.enabledCypherIds)
      ? next.enabledCypherIds.filter(id => typeof id === 'string')
      : defaultSettings.enabledCypherIds;

    return {
      enabledCypherIds: enabledCypherIds.length > 0 ? enabledCypherIds : [...defaultSettings.enabledCypherIds],
      interestingValues: utils.parseInterestingValues(next.interestingValues),
    };
  }

  async function loadSettings() {
    const data = await chrome.storage.local.get(storageKeys.settings);
    settings = normalizeSettings(data[storageKeys.settings] || defaultSettings);
  }

  async function persistSettings() {
    const payload = {
      enabledCypherIds: settings.enabledCypherIds,
      interestingValues: settings.interestingValues,
    };

    await chrome.storage.local.set({ [storageKeys.settings]: payload });
    if (saveStatusEl) {
      saveStatusEl.textContent = 'Saved';
      setTimeout(() => {
        if (saveStatusEl) saveStatusEl.textContent = '';
      }, 700);
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
      const { row, input } = ui.createCheckboxRow({
        label: `${cipher.shortName} - ${cipher.name}`,
        description: cipher.summary,
        checked: enabled.has(cipher.id),
      });

      input.addEventListener('change', async () => {
        const next = new Set(settings.enabledCypherIds);
        if (input.checked) next.add(cipher.id);
        else next.delete(cipher.id);

        if (next.size === 0) {
          input.checked = true;
          return;
        }

        settings.enabledCypherIds = [...next];
        renderCypherCount();
        await persistSettings();
      });

      cypherListEl.appendChild(row);
    }

    renderCypherCount();
  }

  function bindInterestingValues() {
    if (!interestingTextarea) return;

    interestingTextarea.value = settings.interestingValues.join(', ');

    interestingTextarea.addEventListener('input', async () => {
      settings.interestingValues = utils.parseInterestingValues(interestingTextarea.value);
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

    const headPanel = ui.createPanel({
      title: 'Gematria Plugin',
      subtitle: 'Twitter hover, highlights, and right-click selection values.',
    });

    const valuesPanel = ui.createPanel({ title: 'Interesting Values' });
    interestingTextarea = document.createElement('textarea');
    interestingTextarea.className = 'gm-popup-textarea';
    interestingTextarea.rows = 3;
    interestingTextarea.placeholder = '33, 93, 119';
    interestingTextarea.spellcheck = false;

    const valuesHint = document.createElement('p');
    valuesHint.className = 'gm-popup-hint';
    valuesHint.textContent = 'Comma, space, or newline separated numbers.';

    valuesPanel.body.appendChild(interestingTextarea);
    valuesPanel.body.appendChild(valuesHint);

    const cypherPanel = ui.createPanel({ title: 'Cyphers' });
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

    const actionsPanel = ui.createPanel({ title: 'Actions' });
    const actionRow = document.createElement('div');
    actionRow.className = 'gm-popup-action-row';

    const openSavedButton = ui.createButton({ label: 'Open /gematria/saved' });
    openSavedButton.addEventListener('click', openSavedPage);

    saveStatusEl = document.createElement('div');
    saveStatusEl.className = 'gm-popup-status';

    actionRow.appendChild(openSavedButton);
    actionRow.appendChild(saveStatusEl);
    actionsPanel.body.appendChild(actionRow);

    popupRoot.appendChild(headPanel.root);
    popupRoot.appendChild(valuesPanel.root);
    popupRoot.appendChild(cypherPanel.root);
    popupRoot.appendChild(actionsPanel.root);
  }

  async function init() {
    mountUi();
    await loadSettings();
    renderCypherList();
    bindInterestingValues();
  }

  init();
})();
