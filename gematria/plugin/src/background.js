const CONTEXT_MENU_ID = 'gematria-calc-selection';
const DEFAULT_ACTION_TITLE = 'Gematria';
const BADGE_BG_COLOR = '#0b121d';
const BADGE_TEXT_COLOR = '#10ff50';
const selectionStateByTab = new Map();

function sanitizeSelectionValues(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(row => row && Number.isFinite(Number(row.value)))
    .map(row => ({
      id: `${row.id || ''}`,
      shortName: `${row.shortName || row.name || row.id || ''}`,
      icon: `${row.icon || ''}`,
      value: Number(row.value),
    }));
}

function formatBadgeText(values) {
  if (!Array.isArray(values) || values.length === 0) return '';
  const joined = values.map(row => `${row.value}`).join('/');
  if (joined.length <= 4) return joined;

  const first = `${values[0].value}`;
  if (values.length === 1) return first.slice(0, 4);
  if (first.length <= 3) return `${first}+`;
  return `${first.slice(0, 3)}+`;
}

function formatActionTitle(selection) {
  if (!selection || !selection.phrase || !Array.isArray(selection.values) || selection.values.length === 0) {
    return DEFAULT_ACTION_TITLE;
  }

  const phrase = `${selection.phrase}`.slice(0, 110);
  const values = selection.values
    .map(row => `${row.icon || row.shortName || row.id || 'C'}:${row.value}`)
    .join(' | ');
  return `${phrase}\n${values}`;
}

function clearTabBadge(tabId) {
  if (!Number.isInteger(tabId)) return;
  chrome.action.setBadgeText({ tabId, text: '' });
  chrome.action.setTitle({ tabId, title: DEFAULT_ACTION_TITLE });
}

function applyTabBadge(tabId, selection) {
  if (!Number.isInteger(tabId)) return;

  const badgeText = formatBadgeText(selection.values);
  if (!badgeText) {
    clearTabBadge(tabId);
    return;
  }

  chrome.action.setBadgeText({ tabId, text: badgeText });
  chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_BG_COLOR });
  if (typeof chrome.action.setBadgeTextColor === 'function') {
    chrome.action.setBadgeTextColor({ tabId, color: BADGE_TEXT_COLOR });
  }
  chrome.action.setTitle({ tabId, title: formatActionTitle(selection) });
}

function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Gematria values for "%s"',
      contexts: ['selection'],
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});

chrome.runtime.onStartup.addListener(() => {
  createContextMenu();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID) return;
  if (!tab || typeof tab.id !== 'number') return;

  chrome.tabs.sendMessage(tab.id, {
    type: 'GEMATRIA_SELECTION_REQUEST',
    text: info.selectionText || '',
    pageUrl: info.pageUrl || tab.url || '',
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return;

  if (message.type === 'GEMATRIA_SELECTION_CHANGED') {
    const tabId = sender && sender.tab && typeof sender.tab.id === 'number' ? sender.tab.id : null;
    if (tabId === null) return;

    const phrase = `${message.phrase || ''}`.trim();
    const values = sanitizeSelectionValues(message.values);
    if (!phrase || values.length === 0) {
      selectionStateByTab.delete(tabId);
      clearTabBadge(tabId);
      return;
    }

    const selection = { phrase, values, pageUrl: `${message.pageUrl || ''}` };
    selectionStateByTab.set(tabId, selection);
    applyTabBadge(tabId, selection);
    return;
  }

  if (message.type === 'GEMATRIA_SELECTION_CLEARED') {
    const tabId = sender && sender.tab && typeof sender.tab.id === 'number' ? sender.tab.id : null;
    if (tabId === null) return;
    selectionStateByTab.delete(tabId);
    clearTabBadge(tabId);
    return;
  }

  if (message.type === 'GEMATRIA_GET_SELECTION_CACHE') {
    const tabId = Number(message.tabId);
    const payload = Number.isInteger(tabId) ? selectionStateByTab.get(tabId) || null : null;
    sendResponse(payload);
  }
});

chrome.tabs.onRemoved.addListener(tabId => {
  selectionStateByTab.delete(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status !== 'loading') return;
  selectionStateByTab.delete(tabId);
  clearTabBadge(tabId);
});
