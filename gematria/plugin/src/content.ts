(() => {
  if (!(globalThis as any).chrome || !chrome.storage || !(globalThis as any).GematriaPlugin) return;

  const namespace = (globalThis as any).GematriaPlugin;
  const { storageKeys, defaultSettings, utils, ui } = namespace;

  const TWITTER_HOST_PATTERN = /(^|\.)twitter\.com$|(^|\.)x\.com$/i;
  const SAVED_PATH_PATTERN = /^\/gematria\/saved\/?$/i;

  const TWEET_CARD_CLASS = 'gm-tweet-name-widget';
  const TWEET_OVERLAY_CLASS = 'gm-tweet-hover-overlay';
  const COMPOSER_WIDGET_CLASS = 'gm-composer-widget';
  const SAVED_ROOT_ID = 'gematria-saved-root';

  let settings = sanitizeSettings(defaultSettings);
  let twitterObserver = null;
  let refreshQueued = false;
  let selectionRefreshHandle = 0;
  let lastSelectionSignature = '';

  function sanitizeSettings(raw) {
    const next = raw || {};
    const enabledCypherIds = Array.isArray(next.enabledCypherIds)
      ? next.enabledCypherIds.filter(value => typeof value === 'string')
      : defaultSettings.enabledCypherIds;

    const interestingValues = utils.parseInterestingValues(next.interestingValues);

    return {
      enabledCypherIds: enabledCypherIds.length > 0 ? enabledCypherIds : defaultSettings.enabledCypherIds,
      interestingValues,
      autoShowSelectionOnSelect: next.autoShowSelectionOnSelect === true,
    };
  }

  async function readSettings() {
    const data = await chrome.storage.local.get(storageKeys.settings);
    return sanitizeSettings(data[storageKeys.settings] || defaultSettings);
  }

  async function readSavedEntries() {
    const data = await chrome.storage.local.get(storageKeys.savedEntries);
    const entries = data[storageKeys.savedEntries];
    return Array.isArray(entries) ? entries : [];
  }

  async function writeSavedEntries(entries) {
    await chrome.storage.local.set({ [storageKeys.savedEntries]: entries });
  }

  async function saveEntry(payload) {
    const entries = await readSavedEntries();
    const nextEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      createdAt: Date.now(),
      context: payload.context || 'unknown',
      phrase: `${payload.phrase || ''}`,
      values: Array.isArray(payload.values) ? payload.values : [],
      link: `${payload.link || location.href}`,
    };

    const nextEntries = [nextEntry, ...entries].slice(0, 500);
    await writeSavedEntries(nextEntries);
    return nextEntry;
  }

  function escapeHtml(value) {
    return `${value || ''}`
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function cypherColor(row) {
    const hue = Number.isFinite(row.hue) ? row.hue : 120;
    const saturation = Number.isFinite(row.saturation) ? row.saturation : 65;
    const lightness = Number.isFinite(row.lightness) ? row.lightness : 62;
    return `hsl(${hue} ${saturation}% ${lightness}%)`;
  }

  function cypherGlyph(row) {
    return `${row.icon || row.shortName || row.name || row.id || '?'}`;
  }

  function settingsSignature() {
    return `${settings.enabledCypherIds.join(',')}|${settings.interestingValues.join(',')}`;
  }

  function renderValuesBadges(values, interesting) {
    if (values.length === 0) {
      return '<span class="gm-cyber-muted">No cyphers enabled.</span>';
    }

    return values
      .map(row => {
        const isHit = interesting.has(row.value);
        const hitClass = isHit ? ' gm-cyber-badge-hit' : '';
        return `<span class="gm-cyber-badge${hitClass}" style="--gm-accent:${cypherColor(row)}">${escapeHtml(cypherGlyph(row))}: ${row.value}</span>`;
      })
      .join('');
  }

  function renderValuesIndicators(values, interesting) {
    if (values.length === 0) {
      return '<span class="gm-cyber-muted">-</span>';
    }

    return values
      .map(row => {
        const isHit = interesting.has(row.value);
        const hitClass = isHit ? ' gm-cyber-indicator-hit' : '';
        const glyph = cypherGlyph(row);
        const tooltip = `${escapeHtml(glyph)}: ${row.value}`;
        return `<span class="gm-cyber-indicator${hitClass}" style="--gm-accent:${cypherColor(row)}" title="${tooltip}">${escapeHtml(glyph)} ${row.value}</span>`;
      })
      .join('');
  }

  function extractTweetLink(article) {
    const link = article.querySelector('a[href*="/status/"]');
    if (!link) return location.href;

    try {
      const href = link.getAttribute('href') || '';
      if (!href) return location.href;
      return new URL(href, location.origin).href;
    } catch {
      return location.href;
    }
  }

  function getTweetText(article) {
    const node = article.querySelector('[data-testid="tweetText"]');
    return utils.sanitizeText(node ? node.innerText || node.textContent || '' : '');
  }

  function findTweetCardHost(article) {
    return { host: article, variant: 'right' };
  }

  function clearTweetCard(article) {
    const card = article.querySelector(`.${TWEET_CARD_CLASS}`);
    if (card) card.remove();
    const overlay = article.querySelector(`.${TWEET_OVERLAY_CLASS}`);
    if (overlay) overlay.remove();
    article.classList.remove('gm-tweet-host');
    delete article.dataset.gematriaSignature;
  }

  function bindTweetOverlaySaveButton(overlay, article) {
    if (!(overlay instanceof HTMLElement)) return;
    if (overlay.dataset.gematriaSaveBound === '1') return;

    const saveButton = overlay.querySelector('.gm-btn-save');
    if (!(saveButton instanceof HTMLElement)) return;

    overlay.dataset.gematriaSaveBound = '1';
    saveButton.addEventListener('click', async event => {
      event.preventDefault();
      event.stopPropagation();

      const phrase = getTweetText(article);
      if (!phrase) return;

      const values = utils.calcValuesForText(phrase, settings);
      const link = extractTweetLink(article);
      await saveEntry({
        context: 'tweet',
        phrase,
        values,
        link,
      });

      saveButton.textContent = 'Saved';
      setTimeout(() => {
        saveButton.textContent = 'Save';
      }, 900);
    });
  }

  function ensureTweetCard(article) {
    let card = article.querySelector(`.${TWEET_CARD_CLASS}`);
    let overlay = article.querySelector(`.${TWEET_OVERLAY_CLASS}`);
    const target = findTweetCardHost(article);
    if (!target || !(target.host instanceof HTMLElement)) return null;

    if (card) {
      card.classList.toggle('gm-tweet-right-widget', target.variant === 'right');
      if (card.parentElement !== target.host) {
        if (target.variant === 'right') {
          target.host.appendChild(card);
        } else {
          target.host.appendChild(card);
        }
      }
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = `${TWEET_OVERLAY_CLASS} gm-cyber-panel`;
        overlay.innerHTML = [
          '<div class="gm-cyber-panel-body">',
          '<div class="gm-values"></div>',
          '<div class="gm-cyber-panel-actions">',
          '<button type="button" class="gm-cyber-button gm-btn-save">Save</button>',
          '</div>',
          '</div>',
        ].join('');
        article.appendChild(overlay);
      }
      bindTweetOverlaySaveButton(overlay, article);
      article.classList.add('gm-tweet-host');
      return { card, overlay };
    }

    card = document.createElement('div');
    card.className = TWEET_CARD_CLASS;
    card.classList.toggle('gm-tweet-right-widget', target.variant === 'right');
    card.innerHTML = [
      '<span class="gm-tweet-inline-values"></span>',
    ].join('');

    overlay = document.createElement('div');
    overlay.className = `${TWEET_OVERLAY_CLASS} gm-cyber-panel`;
    overlay.innerHTML = [
      '<div class="gm-cyber-panel-body">',
      '<div class="gm-values"></div>',
      '<div class="gm-cyber-panel-actions">',
      '<button type="button" class="gm-cyber-button gm-btn-save">Save</button>',
      '</div>',
      '</div>',
    ].join('');
    article.appendChild(overlay);

    bindTweetOverlaySaveButton(overlay, article);
    if (overlay.dataset.gematriaSaveBound !== '1') return null;

    if (target.variant === 'right') {
      target.host.appendChild(card);
    } else {
      target.host.appendChild(card);
    }
    article.classList.add('gm-tweet-host');
    return { card, overlay };
  }

  function decorateTweet(article) {
    const phrase = getTweetText(article);
    if (!phrase) {
      clearTweetCard(article);
      article.classList.remove('gm-interesting-tweet');
      return;
    }

    const signature = `${phrase}|${settingsSignature()}`;
    const values = utils.calcValuesForText(phrase, settings);
    const interesting = utils.interestingSetFromSettings(settings);
    const matchesInteresting = values.some(row => interesting.has(row.value));

    const widgets = ensureTweetCard(article);
    if (!widgets || !widgets.card || !widgets.overlay) {
      clearTweetCard(article);
      return;
    }
    const { card, overlay } = widgets;

    if (article.dataset.gematriaSignature === signature && card.dataset.gematriaSignature === signature) {
      article.classList.toggle('gm-interesting-tweet', matchesInteresting);
      return;
    }

    article.dataset.gematriaSignature = signature;
    card.dataset.gematriaSignature = signature;

    const interestingValues = values.filter(row => interesting.has(row.value));

    const inlineValuesNode = card.querySelector('.gm-tweet-inline-values');
    if (inlineValuesNode) {
      inlineValuesNode.innerHTML = renderValuesIndicators(interestingValues, interesting);
    }
    card.classList.toggle('gm-hidden', interestingValues.length === 0);

    const valuesNode = overlay.querySelector('.gm-values');
    if (valuesNode) {
      valuesNode.innerHTML = renderValuesBadges(values, interesting);
    }

    article.classList.toggle('gm-interesting-tweet', matchesInteresting);
  }

  function decorateTweets() {
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    tweets.forEach(article => decorateTweet(article));
  }

  function findAudienceNode(startNode: Element | null): Element | null {
    let node: Element | null = startNode;
    for (let depth = 0; depth < 10 && node; depth += 1) {
      const selectorMatch = node.querySelector('[data-testid="tweetAudienceSelector"]');
      if (selectorMatch) return selectorMatch;

      const buttonMatch = Array.from(node.querySelectorAll('button, [role="button"]')).find(candidate =>
        /\beveryone\b/i.test((candidate as HTMLElement).textContent || '')
      );
      if (buttonMatch) return buttonMatch;

      node = node.parentElement;
    }

    return null;
  }

  function ensureComposerWidget(textbox) {
    if (textbox._gematriaComposerWidget && textbox._gematriaComposerWidget.isConnected) {
      return textbox._gematriaComposerWidget;
    }

    const widget = document.createElement('div');
    widget.className = COMPOSER_WIDGET_CLASS;

    const audienceNode = findAudienceNode(textbox);
    if (audienceNode && audienceNode.parentElement) {
      audienceNode.parentElement.classList.add('gm-composer-row');
      audienceNode.parentElement.appendChild(widget);
    } else {
      const fallbackParent = textbox.parentElement || textbox;
      fallbackParent.classList.add('gm-composer-fallback-host');
      fallbackParent.appendChild(widget);
    }

    textbox._gematriaComposerWidget = widget;
    return widget;
  }

  function updateComposerWidget(textbox) {
    const widget = ensureComposerWidget(textbox);
    const phrase = utils.sanitizeText(textbox.innerText || textbox.textContent || '');
    const values = utils.calcValuesForText(phrase, settings);

    if (!phrase) {
      widget.innerHTML = '<span class="gm-cyber-muted">Gematria: type to calculate</span>';
      return;
    }

    widget.innerHTML = values
      .map(row => `<span class="gm-cyber-inline-value" style="--gm-accent:${cypherColor(row)}">${escapeHtml(cypherGlyph(row))} ${row.value}</span>`)
      .join('');
  }

  function bindComposerTextbox(textbox) {
    if (textbox.dataset.gematriaComposerBound === '1') {
      updateComposerWidget(textbox);
      return;
    }

    textbox.dataset.gematriaComposerBound = '1';
    const refresh = () => updateComposerWidget(textbox);

    textbox.addEventListener('input', refresh);
    textbox.addEventListener('keyup', refresh);
    refresh();
  }

  function decorateComposers() {
    const textboxes = document.querySelectorAll('[role="textbox"][data-testid^="tweetTextarea_"]');
    textboxes.forEach(textbox => bindComposerTextbox(textbox));
  }

  function queueTwitterRefresh() {
    if (refreshQueued) return;
    refreshQueued = true;

    requestAnimationFrame(() => {
      refreshQueued = false;
      decorateTweets();
      decorateComposers();
    });
  }

  function initTwitter() {
    if (!TWITTER_HOST_PATTERN.test(location.hostname)) return;

    queueTwitterRefresh();

    if (twitterObserver) return;
    twitterObserver = new MutationObserver(() => queueTwitterRefresh());
    twitterObserver.observe(document.body, { childList: true, subtree: true });
  }

  function notifyBackgroundSelectionChanged(payload) {
    try {
      chrome.runtime.sendMessage({
        type: 'GEMATRIA_SELECTION_CHANGED',
        phrase: payload.phrase,
        values: payload.values,
        pageUrl: payload.pageUrl,
      });
    } catch {}
  }

  function notifyBackgroundSelectionCleared() {
    try {
      chrome.runtime.sendMessage({ type: 'GEMATRIA_SELECTION_CLEARED' });
    } catch {}
  }

  function getTextInputSelectionText() {
    const active = document.activeElement;
    if (active instanceof HTMLTextAreaElement) {
      const start = Number(active.selectionStart);
      const end = Number(active.selectionEnd);
      if (Number.isInteger(start) && Number.isInteger(end) && end > start) {
        return `${active.value || ''}`.slice(start, end);
      }
      return '';
    }

    if (active instanceof HTMLInputElement) {
      const selectableType = /^(text|search|url|tel|password|email)$/i;
      if (!selectableType.test(active.type || 'text')) return '';
      const start = Number(active.selectionStart);
      const end = Number(active.selectionEnd);
      if (Number.isInteger(start) && Number.isInteger(end) && end > start) {
        return `${active.value || ''}`.slice(start, end);
      }
    }

    return '';
  }

  function getCurrentSelectionPhrase() {
    const selectionText = (globalThis as any).getSelection ? `${(globalThis as any).getSelection()?.toString() || ''}` : '';
    const normalized = utils.sanitizeText(selectionText);
    if (normalized) return normalized;
    return utils.sanitizeText(getTextInputSelectionText());
  }

  function getCurrentSelectionPayload() {
    const phrase = getCurrentSelectionPhrase();
    if (!phrase) return null;
    return {
      phrase,
      values: utils.calcValuesForText(phrase, settings),
      pageUrl: location.href,
    };
  }

  function removeAutoSelectionPanel() {
    const panel = document.getElementById('gm-selection-panel');
    if (panel && panel.dataset.gematriaAuto === '1') panel.remove();
  }

  function syncSelectionState({ allowAutoPanel = false, force = false } = {}) {
    const payload = getCurrentSelectionPayload();
    const signature = payload ? `${payload.phrase}|${settingsSignature()}` : '';
    if (!force && signature === lastSelectionSignature) return;
    lastSelectionSignature = signature;

    if (!payload) {
      notifyBackgroundSelectionCleared();
      removeAutoSelectionPanel();
      return;
    }

    notifyBackgroundSelectionChanged(payload);

    if (allowAutoPanel && settings.autoShowSelectionOnSelect) {
      showSelectionPanel(payload.phrase, payload.pageUrl, { origin: 'auto', values: payload.values });
    } else {
      removeAutoSelectionPanel();
    }
  }

  function scheduleSelectionSync(options: { allowAutoPanel?: boolean; force?: boolean } = {}) {
    if (selectionRefreshHandle) {
      clearTimeout(selectionRefreshHandle);
    }
    selectionRefreshHandle = window.setTimeout(() => {
      selectionRefreshHandle = 0;
      syncSelectionState(options);
    }, 90);
  }

  function showSelectionPanel(text, pageUrl, options: { origin?: string; values?: GematriaValueResult[] } = {}) {
    const origin = options.origin || 'manual';
    const phrase = utils.sanitizeText(text);
    if (!phrase) return;

    const interesting = utils.interestingSetFromSettings(settings);
    const values = Array.isArray(options.values) ? options.values : utils.calcValuesForText(phrase, settings);

    const existing = document.getElementById('gm-selection-panel');
    if (existing) existing.remove();

    const panel = ui && typeof ui.createPanel === 'function'
      ? ui.createPanel({ title: 'Selected Text' }).root
      : document.createElement('div');
    panel.id = 'gm-selection-panel';
    panel.className = 'gm-selection-panel gm-cyber-panel';
    if (origin === 'auto') panel.dataset.gematriaAuto = '1';

    if (ui && typeof ui.createPanel === 'function' && panel.querySelector('.gm-cyber-panel-body')) {
      const body = panel.querySelector('.gm-cyber-panel-body');
      const phraseNode = document.createElement('div');
      phraseNode.className = 'gm-selection-phrase';
      phraseNode.textContent = phrase;

      const valuesNode = document.createElement('div');
      valuesNode.className = 'gm-values';
      valuesNode.innerHTML = renderValuesBadges(values, interesting);

      const actions = document.createElement('div');
      actions.className = 'gm-cyber-panel-actions';
      const saveButton = ui.createButton({ label: 'Save' });
      saveButton.classList.add('gm-btn-save');
      const closeButton = ui.createButton({ label: 'Close' });
      closeButton.classList.add('gm-btn-close');

      actions.appendChild(saveButton);
      actions.appendChild(closeButton);
      body.appendChild(phraseNode);
      body.appendChild(valuesNode);
      body.appendChild(actions);
    } else {
      panel.innerHTML = [
        '<div class="gm-cyber-panel-head"><div class="gm-cyber-panel-title">Selected Text</div></div>',
        '<div class="gm-cyber-panel-body">',
        `<div class="gm-selection-phrase">${escapeHtml(phrase)}</div>`,
        `<div class="gm-values">${renderValuesBadges(values, interesting)}</div>`,
        '<div class="gm-cyber-panel-actions">',
        '<button type="button" class="gm-cyber-button gm-btn-save">Save</button>',
        '<button type="button" class="gm-cyber-button gm-btn-close">Close</button>',
        '</div>',
        '</div>',
      ].join('');
    }

    const saveButton = panel.querySelector('.gm-btn-save');
    const closeButton = panel.querySelector('.gm-btn-close');
    if (!(saveButton instanceof HTMLElement) || !(closeButton instanceof HTMLElement)) {
      document.documentElement.appendChild(panel);
      return;
    }

    saveButton.addEventListener('click', async event => {
      event.preventDefault();
      await saveEntry({
        context: 'selection',
        phrase,
        values,
        link: pageUrl || location.href,
      });
      saveButton.textContent = 'Saved';
      setTimeout(() => {
        saveButton.textContent = 'Save';
      }, 900);
    });

    closeButton.addEventListener('click', event => {
      event.preventDefault();
      panel.remove();
    });

    document.documentElement.appendChild(panel);
  }

  function formatEntryTime(timestamp) {
    if (!Number.isFinite(timestamp)) return '-';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return '-';
    }
  }

  function renderSavedEntry(entry) {
    const valueMarkup = Array.isArray(entry.values)
      ? entry.values
          .map(row => {
            const color = cypherColor(row);
            return `<span class="gm-cyber-inline-value" style="--gm-accent:${color}">${escapeHtml(cypherGlyph(row))} ${row.value}</span>`;
          })
          .join('')
      : '<span class="gm-cyber-muted">No values</span>';

    const link = escapeHtml(entry.link || '');
    const phrase = escapeHtml(entry.phrase || '');

    return [
      `<article class="gm-saved-item gm-cyber-panel" data-entry-id="${escapeHtml(entry.id)}">`,
      '<div class="gm-saved-head">',
      `<span class="gm-saved-context">${escapeHtml(entry.context || 'item')}</span>`,
      `<span class="gm-saved-time">${escapeHtml(formatEntryTime(entry.createdAt))}</span>`,
      '</div>',
      `<div class="gm-saved-phrase">${phrase}</div>`,
      `<div class="gm-saved-values">${valueMarkup}</div>`,
      `<div class="gm-saved-link"><a href="${link}" target="_blank" rel="noreferrer">${link}</a></div>`,
      '<div class="gm-saved-actions">',
      '<button type="button" class="gm-cyber-button gm-cyber-button-danger gm-btn-delete" data-action="delete">Delete</button>',
      '</div>',
      '</article>',
    ].join('');
  }

  async function renderSavedPage() {
    if (!SAVED_PATH_PATTERN.test(location.pathname)) return;

    const root = document.getElementById(SAVED_ROOT_ID);
    if (!root) return;

    const entries = await readSavedEntries();
    if (entries.length === 0) {
      root.innerHTML = '<div class="gm-empty">No saved entries yet. Save from tweet hover cards or right-click selection overlays.</div>';
      return;
    }

    const markup = entries.map(entry => renderSavedEntry(entry)).join('');

    root.innerHTML = [
      '<div class="gm-saved-toolbar">',
      `<div class="gm-saved-count">${entries.length} saved</div>`,
      '<button type="button" class="gm-cyber-button gm-cyber-button-danger gm-btn-clear" data-action="clear">Clear all</button>',
      '</div>',
      `<div class="gm-saved-list">${markup}</div>`,
    ].join('');
  }

  function bindSavedPageActions() {
    if (!SAVED_PATH_PATTERN.test(location.pathname)) return;

    const root = document.getElementById(SAVED_ROOT_ID);
    if (!root || root.dataset.gematriaBound === '1') return;

    root.dataset.gematriaBound = '1';

    root.addEventListener('click', async event => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const action = target.dataset.action;
      if (!action) return;

      if (action === 'clear') {
        await writeSavedEntries([]);
        await renderSavedPage();
        return;
      }

      if (action === 'delete') {
        const item = target.closest('[data-entry-id]');
        const entryId = item ? item.getAttribute('data-entry-id') : '';
        if (!entryId) return;

        const entries = await readSavedEntries();
        const next = entries.filter(entry => `${entry.id}` !== `${entryId}`);
        await writeSavedEntries(next);
        await renderSavedPage();
      }
    });
  }

  function bindRuntimeMessages() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (!message || !message.type) return;

      if (message.type === 'GEMATRIA_SELECTION_REQUEST') {
        showSelectionPanel(message.text || '', message.pageUrl || location.href, { origin: 'manual' });
        return;
      }

      if (message.type === 'GEMATRIA_SELECTION_QUERY') {
        const payload = getCurrentSelectionPayload();
        sendResponse({
          ok: true,
          phrase: payload ? payload.phrase : '',
          values: payload ? payload.values : [],
          pageUrl: location.href,
        });
      }
    });
  }

  function bindSelectionTracking() {
    if (document.documentElement.dataset.gematriaSelectionBound === '1') return;
    document.documentElement.dataset.gematriaSelectionBound = '1';

    const onSelectionEvent = () => scheduleSelectionSync({ allowAutoPanel: true });

    document.addEventListener('selectionchange', onSelectionEvent, true);
    document.addEventListener('mouseup', onSelectionEvent, true);
    document.addEventListener('keyup', onSelectionEvent, true);
    window.addEventListener('blur', () => scheduleSelectionSync({ allowAutoPanel: false }), true);

    scheduleSelectionSync({ allowAutoPanel: false, force: true });
  }

  function bindStorageWatch() {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') return;

      const nextSettingsChange = changes[storageKeys.settings];
      if (nextSettingsChange) {
        const prevAuto = settings.autoShowSelectionOnSelect === true;
        settings = sanitizeSettings(nextSettingsChange.newValue || defaultSettings);
        const autoEnabledNow = !prevAuto && settings.autoShowSelectionOnSelect === true;
        if (TWITTER_HOST_PATTERN.test(location.hostname)) queueTwitterRefresh();
        scheduleSelectionSync({ allowAutoPanel: autoEnabledNow, force: true });
      }

      if (changes[storageKeys.savedEntries] && SAVED_PATH_PATTERN.test(location.pathname)) {
        renderSavedPage();
      }
    });
  }

  async function init() {
    settings = await readSettings();

    bindRuntimeMessages();
    bindStorageWatch();
    bindSelectionTracking();

    if (TWITTER_HOST_PATTERN.test(location.hostname)) {
      initTwitter();
    }

    if (SAVED_PATH_PATTERN.test(location.pathname)) {
      bindSavedPageActions();
      renderSavedPage();
    }
  }

  init();
})();
