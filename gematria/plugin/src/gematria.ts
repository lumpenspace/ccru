(() => {
  const namespace = (globalThis as any).GematriaPlugin || {} as Partial<GematriaPluginNamespace>;
  const numberCodes = new Set<number>([48, 49, 50, 51, 52, 53, 54, 55, 56, 57]);
  const charMapCache = new Map<string, Map<number, number>>();

  function buildCharMap(cipher: GematriaCipher): Map<number, number> {
    const cached = charMapCache.get(cipher.id);
    if (cached) return cached;

    const map = new Map<number, number>();
    for (let index = 0; index < cipher.chars.length; index += 1) {
      map.set(cipher.chars.charCodeAt(index), cipher.values[index]);
    }
    charMapCache.set(cipher.id, map);
    return map;
  }

  function calcGematria(phrase: string, cipher: GematriaCipher): number {
    let prepared = `${phrase || ''}`.replace(/\[.+\]/g, '').trim();

    if (cipher.diacriticsAsRegular) {
      prepared = prepared.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    if (!cipher.caseSensitive) prepared = prepared.toLowerCase();

    const valueMap = buildCharMap(cipher);
    let sum = 0;

    for (let index = 0; index < prepared.length; index += 1) {
      const code = prepared.charCodeAt(index);
      const value = valueMap.get(code);
      if (value !== undefined) sum += value;
    }

    if (!valueMap.has(49)) {
      let currentNumber = '';
      for (let index = 0; index < prepared.length; index += 1) {
        const code = prepared.charCodeAt(index);
        if (numberCodes.has(code)) {
          currentNumber += String(code - 48);
        } else if (currentNumber.length > 0 && code !== 44) {
          sum += Number(currentNumber);
          currentNumber = '';
        }
      }
      if (currentNumber.length > 0) sum += Number(currentNumber);
    }

    return sum;
  }

  function sanitizeText(value: unknown): string {
    return `${value || ''}`.replace(/\s+/g, ' ').trim();
  }

  function parseIntegerTokens(raw: unknown): number[] {
    const matches = `${raw || ''}`.match(/-?\d+/g);
    if (!matches) return [];
    return matches
      .map(chunk => Number(chunk))
      .filter(entry => Number.isFinite(entry));
  }

  function parseInterestingValues(raw: unknown): number[] {
    if (Array.isArray(raw)) {
      return raw.flatMap((entry: unknown) => parseIntegerTokens(entry));
    }

    return parseIntegerTokens(raw);
  }

  function getEnabledCyphers(settings: GematriaSettings): GematriaCipher[] {
    const ids = new Set(
      Array.isArray(settings.enabledCypherIds)
        ? settings.enabledCypherIds
        : namespace.defaultSettings!.enabledCypherIds
    );

    const enabled = namespace.ciphers!.filter(cipher => ids.has(cipher.id));
    return enabled.length > 0
      ? enabled
      : namespace.ciphers!.filter(cipher => namespace.defaultSettings!.enabledCypherIds.includes(cipher.id));
  }

  function calcValuesForText(text: string, settings: GematriaSettings): GematriaValueResult[] {
    const normalized = sanitizeText(text);
    const cyphers = getEnabledCyphers(settings);
    return cyphers.map(cypher => ({
      id: cypher.id,
      name: cypher.name,
      shortName: cypher.shortName,
      icon: cypher.icon,
      hue: cypher.hue,
      saturation: cypher.saturation,
      lightness: cypher.lightness,
      value: calcGematria(normalized, cypher),
    }));
  }

  function interestingSetFromSettings(settings: GematriaSettings): Set<number> {
    return new Set(parseInterestingValues(settings.interestingValues));
  }

  namespace.utils = {
    calcGematria,
    calcValuesForText,
    parseInterestingValues,
    sanitizeText,
    interestingSetFromSettings,
    getEnabledCyphers,
  };

  (globalThis as any).GematriaPlugin = namespace as GematriaPluginNamespace;
})();
