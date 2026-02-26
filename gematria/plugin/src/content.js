(() => {
  if (!globalThis.chrome || !chrome.storage || !globalThis.GematriaPlugin) return;

  const namespace = globalThis.GematriaPlugin;
  const { storageKeys, defaultSettings, utils, ui } = namespace;

  const TWITTER_HOST_PATTERN = /(^|\.)twitter\.com$|(^|\.)x\.com$/i;
  const SAVED_PATH_PATTERN = /^\/gematria\/saved\/?$/i;

  const TWEET_CARD_CLASS = 'gm-tweet-hover-card';
  const COMPOSER_WIDGET_CLASS = 'gm-composer-widget';
  const SAVED_ROOT_ID = 'gematria-saved-root';

  let settings = sanitizeSettings(defaultSettings);
  let twitterObserver = null;
  let refreshQueued = false;

  function sanitizeSettings(raw) {
    const next = raw || {};
    const enabledCypherIds = Array.isArray(next.enabledCypherIds)
      ? next.enabledCypherIds.filter(value => typeof value === 'string')
      : defaultSettings.enabledCypherIds;

    const interestingValues = utils.parseInterestingValues(next.interestingValues);

    return {
      enabledCypherIds: enabledCypherIds.length > 0 ? enabledCypherIds : defaultSettings.enabledCypherIds,
      interestingValues,
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
        return `<span class="gm-cyber-badge${hitClass}" style="--gm-accent:${cypherColor(row)}">${escapeHtml(row.shortName)}: ${row.value}</span>`;
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

  function ensureTweetCard(article) {
    let card = article.querySelector(`.${TWEET_CARD_CLASS}`);
    if (card) return card;

    if (ui && typeof ui.createPanel === 'function') {
      const panel = ui.createPanel({ title: 'Gematria' });
      panel.root.classList.add(TWEET_CARD_CLASS);

      const valuesNode = document.createElement('div');
      valuesNode.className = 'gm-values';

      const actions = document.createElement('div');
      actions.className = 'gm-cyber-panel-actions';

      const saveButton = ui.createButton({ label: 'Save' });
      saveButton.classList.add('gm-btn-save');

      actions.appendChild(saveButton);
      panel.body.appendChild(valuesNode);
      panel.body.appendChild(actions);
      card = panel.root;
    } else {
      card = document.createElement('div');
      card.className = `${TWEET_CARD_CLASS} gm-cyber-panel`;
      card.innerHTML = [
        '<div class="gm-cyber-panel-head"><div class="gm-cyber-panel-title">Gematria</div></div>',
        '<div class="gm-cyber-panel-body">',
        '<div class="gm-values"></div>',
        '<div class="gm-cyber-panel-actions">',
        '<button type="button" class="gm-cyber-button gm-btn-save">Save</button>',
        '</div>',
        '</div>',
      ].join('');
    }

    const saveButton = card.querySelector('.gm-btn-save');
    if (!(saveButton instanceof HTMLElement)) {
      article.classList.add('gm-tweet-host');
      article.appendChild(card);
      return card;
    }
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

    article.classList.add('gm-tweet-host');
    article.appendChild(card);
    return card;
  }

  function decorateTweet(article) {
    const phrase = getTweetText(article);
    if (!phrase) return;

    const signature = `${phrase}|${settingsSignature()}`;
    if (article.dataset.gematriaSignature === signature) return;
    article.dataset.gematriaSignature = signature;

    const values = utils.calcValuesForText(phrase, settings);
    const interesting = utils.interestingSetFromSettings(settings);
    const matchesInteresting = values.some(row => interesting.has(row.value));

    const card = ensureTweetCard(article);
    const valuesNode = card.querySelector('.gm-values');
    valuesNode.innerHTML = renderValuesBadges(values, interesting);

    article.classList.toggle('gm-interesting-tweet', matchesInteresting);
  }

  function decorateTweets() {
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    tweets.forEach(article => decorateTweet(article));
  }

  function findAudienceNode(startNode) {
    let node = startNode;
    for (let depth = 0; depth < 10 && node; depth += 1) {
      const selectorMatch = node.querySelector('[data-testid="tweetAudienceSelector"]');
      if (selectorMatch) return selectorMatch;

      const buttonMatch = Array.from(node.querySelectorAll('button, [role="button"]')).find(candidate =>
        /\beveryone\b/i.test(candidate.textContent || '')
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
      .map(row => `<span class="gm-cyber-inline-value" style="--gm-accent:${cypherColor(row)}">${escapeHtml(row.shortName)} ${row.value}</span>`)
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

  function showSelectionPanel(text, pageUrl) {
    const phrase = utils.sanitizeText(text);
    if (!phrase) return;

    const interesting = utils.interestingSetFromSettings(settings);
    const values = utils.calcValuesForText(phrase, settings);

    const existing = document.getElementById('gm-selection-panel');
    if (existing) existing.remove();

    const panel = ui && typeof ui.createPanel === 'function'
      ? ui.createPanel({ title: 'Selected Text' }).root
      : document.createElement('div');
    panel.id = 'gm-selection-panel';
    panel.className = 'gm-selection-panel gm-cyber-panel';

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
            return `<span class="gm-cyber-inline-value" style="--gm-accent:${color}">${escapeHtml(row.shortName || row.id)} ${row.value}</span>`;
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
    chrome.runtime.onMessage.addListener(message => {
      if (!message || message.type !== 'GEMATRIA_SELECTION_REQUEST') return;
      if (TWITTER_HOST_PATTERN.test(location.hostname)) return;
      showSelectionPanel(message.text || '', message.pageUrl || location.href);
    });
  }

  function bindStorageWatch() {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') return;

      const nextSettingsChange = changes[storageKeys.settings];
      if (nextSettingsChange) {
        settings = sanitizeSettings(nextSettingsChange.newValue || defaultSettings);
        if (TWITTER_HOST_PATTERN.test(location.hostname)) queueTwitterRefresh();
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
