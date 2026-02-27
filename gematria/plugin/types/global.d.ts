// ── Chrome Extension API declarations ────────────────────────

declare namespace chrome {
  namespace storage {
    interface StorageChange {
      oldValue?: unknown
      newValue?: unknown
    }

    interface StorageArea {
      get(keys: string | string[]): Promise<Record<string, unknown>>
      set(items: Record<string, unknown>): Promise<void>
    }

    const local: StorageArea

    const onChanged: {
      addListener(
        callback: (changes: Record<string, StorageChange>, areaName: string) => void
      ): void
    }
  }

  namespace action {
    function setBadgeText(details: { tabId?: number; text: string }): void
    function setBadgeBackgroundColor(details: { tabId?: number; color: string }): void
    function setBadgeTextColor(details: { tabId?: number; color: string }): void
    function setTitle(details: { tabId?: number; title: string }): void
  }

  namespace contextMenus {
    function removeAll(callback?: () => void): void
    function create(properties: {
      id: string
      title: string
      contexts: string[]
    }): void

    const onClicked: {
      addListener(
        callback: (
          info: { menuItemId: string; selectionText?: string; pageUrl?: string },
          tab?: { id?: number; url?: string }
        ) => void
      ): void
    }
  }

  namespace tabs {
    function query(queryInfo: Record<string, unknown>): Promise<Array<{ id?: number; url?: string }>>
    function query(queryInfo: Record<string, unknown>, callback: (tabs: Array<{ id?: number; url?: string }>) => void): void
    function create(props: { url: string }): void
    function sendMessage(tabId: number, message: unknown): Promise<unknown>

    const onRemoved: {
      addListener(callback: (tabId: number) => void): void
    }

    const onUpdated: {
      addListener(
        callback: (tabId: number, changeInfo: { status?: string }) => void
      ): void
    }
  }

  namespace runtime {
    function sendMessage(message: unknown): Promise<unknown>

    const onMessage: {
      addListener(
        callback: (
          message: Record<string, unknown>,
          sender: { tab?: { id?: number } },
          sendResponse: (response?: unknown) => void
        ) => void
      ): void
    }

    const onInstalled: {
      addListener(callback: () => void): void
    }

    const onStartup: {
      addListener(callback: () => void): void
    }
  }

  namespace scripting {
    function executeScript<T>(details: {
      target: { tabId: number }
      func: () => T
    }): Promise<Array<{ result: T }>>
  }
}

// ── GematriaPlugin namespace ─────────────────────────────────

interface GematriaCipher {
  id: string
  name: string
  shortName: string
  icon: string
  summary: string
  hue: number
  saturation: number
  lightness: number
  chars: string
  values: number[]
  diacriticsAsRegular: boolean
  caseSensitive: boolean
}

interface GematriaValueResult {
  id: string
  name: string
  shortName: string
  icon: string
  hue: number
  saturation: number
  lightness: number
  value: number
}

interface GematriaSettings {
  enabledCypherIds: string[]
  interestingValues: number[]
  autoShowSelectionOnSelect: boolean
}

interface GematriaUtils {
  calcGematria(phrase: string, cipher: GematriaCipher): number
  calcValuesForText(text: string, settings: GematriaSettings): GematriaValueResult[]
  parseInterestingValues(raw: unknown): number[]
  sanitizeText(value: unknown): string
  interestingSetFromSettings(settings: GematriaSettings): Set<number>
  getEnabledCyphers(settings: GematriaSettings): GematriaCipher[]
}

interface GematriaUiPanel {
  root: HTMLElement
  head: HTMLElement
  body: HTMLElement
  titleEl: HTMLElement
  toggleButton: HTMLButtonElement | null
  setOpen(open: boolean): void
  isOpen(): boolean
}

interface GematriaUiBadgeOptions {
  label?: string
  value?: number | string
  accent?: string
  highlight?: boolean
  className?: string
}

interface GematriaUiCheckboxResult {
  row: HTMLLabelElement
  input: HTMLInputElement
  textWrap: HTMLSpanElement
  labelEl: HTMLSpanElement
}

interface GematriaUiSelectionRowResult {
  root: HTMLDivElement
  row: HTMLLabelElement
  input: HTMLInputElement
  textWrap: HTMLSpanElement
  labelEl: HTMLSpanElement
}

interface GematriaUi {
  createPanel(options?: {
    title?: string
    subtitle?: string
    className?: string
    collapsible?: boolean
    defaultOpen?: boolean
  }): GematriaUiPanel
  createButton(options?: {
    label?: string
    className?: string
    type?: string
  }): HTMLButtonElement
  createTextArea(options?: {
    className?: string
    rows?: number
    placeholder?: string
    spellcheck?: boolean
    value?: string
  }): HTMLTextAreaElement
  createBadge(options?: GematriaUiBadgeOptions): HTMLSpanElement
  createCheckboxRow(options?: {
    label?: string
    description?: string
    checked?: boolean
  }): GematriaUiCheckboxResult
  createSelectionRowWithPopup(options?: {
    label?: string
    description?: string
    checked?: boolean
    accent?: string
    popupTitle?: string
    popupText?: string
    popupBadges?: GematriaUiBadgeOptions[]
  }): GematriaUiSelectionRowResult
  createCypherSelectionRowWithPopup(options?: {
    label?: string
    icon?: string
    checked?: boolean
    accent?: string
    popupTitle?: string
    popupText?: string
    popupBadges?: GematriaUiBadgeOptions[]
  }): { root: HTMLDivElement; row: HTMLLabelElement; input: HTMLInputElement; labelEl: HTMLSpanElement }
}

interface GematriaPluginNamespace {
  ciphers: GematriaCipher[]
  defaultSettings: GematriaSettings
  storageKeys: {
    settings: string
    savedEntries: string
  }
  utils: GematriaUtils
  ui: GematriaUi
}

// Augment globalThis so files can access GematriaPlugin directly
declare var GematriaPlugin: GematriaPluginNamespace

interface Window {
  GematriaPlugin: GematriaPluginNamespace
}
