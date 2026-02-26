const CONTEXT_MENU_ID = 'gematria-calc-selection';

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
