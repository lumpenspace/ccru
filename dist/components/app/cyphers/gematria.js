"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcGematria = calcGematria;
const numberCodes = new Set([48, 49, 50, 51, 52, 53, 54, 55, 56, 57]);
const charMapCache = new Map();
function buildCharMap(cipher) {
    const cached = charMapCache.get(cipher.id);
    if (cached)
        return cached;
    const map = new Map();
    for (let i = 0; i < cipher.chars.length; i++) {
        map.set(cipher.chars.charCodeAt(i), cipher.values[i]);
    }
    charMapCache.set(cipher.id, map);
    return map;
}
function calcGematria(phrase, cipher) {
    let prepared = phrase;
    prepared = prepared.replace(/\[.+\]/g, '').trim();
    if (cipher.diacriticsAsRegular) {
        prepared = prepared.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    if (!cipher.caseSensitive)
        prepared = prepared.toLowerCase();
    const valueMap = buildCharMap(cipher);
    let sum = 0;
    for (let i = 0; i < prepared.length; i++) {
        const code = prepared.charCodeAt(i);
        const value = valueMap.get(code);
        if (value !== undefined)
            sum += value;
    }
    // cyphers.news behavior: if a cipher does not map character "1",
    // treat number groups in phrase as full numbers and add them to total.
    if (!valueMap.has(49)) {
        let curNum = '';
        for (let i = 0; i < prepared.length; i++) {
            const code = prepared.charCodeAt(i);
            if (numberCodes.has(code)) {
                curNum += String(code - 48);
            }
            else if (curNum.length > 0 && code !== 44) {
                sum += Number(curNum);
                curNum = '';
            }
        }
        if (curNum.length > 0)
            sum += Number(curNum);
    }
    return sum;
}
