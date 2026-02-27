"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leastFactor = leastFactor;
exports.isPrime = isPrime;
exports.nextPrime = nextPrime;
exports.indexOfPrime = indexOfPrime;
exports.nthPrime = nthPrime;
exports.factorInteger = factorInteger;
exports.xenotateNumber = xenotateNumber;
exports.xenotationToNumber = xenotationToNumber;
exports.xenote = xenote;
exports.formatXenotationForDisplay = formatXenotationForDisplay;
exports.xenotationByZone = xenotationByZone;
const PRIME_CACHE = [2, 3, 5, 7, 11, 13];
function isFiniteInteger(n) {
    return Number.isFinite(n) && Math.floor(n) === n;
}
// Returns the smallest factor that divides n.
function leastFactor(n) {
    if (!Number.isFinite(n) || Number.isNaN(n))
        return Number.NaN;
    if (n === 0)
        return 0;
    if (!isFiniteInteger(n) || n * n < 2)
        return 1;
    if (n % 2 === 0)
        return 2;
    if (n % 3 === 0)
        return 3;
    if (n % 5 === 0)
        return 5;
    const m = Math.floor(Math.sqrt(n));
    for (let i = 7; i <= m; i += 30) {
        if (n % i === 0)
            return i;
        if (n % (i + 4) === 0)
            return i + 4;
        if (n % (i + 6) === 0)
            return i + 6;
        if (n % (i + 10) === 0)
            return i + 10;
        if (n % (i + 12) === 0)
            return i + 12;
        if (n % (i + 16) === 0)
            return i + 16;
        if (n % (i + 22) === 0)
            return i + 22;
        if (n % (i + 24) === 0)
            return i + 24;
    }
    return n;
}
function isPrime(n) {
    if (!isFiniteInteger(n) || n < 2)
        return false;
    return leastFactor(n) === n;
}
function nextPrime(value) {
    if (!isFiniteInteger(value))
        throw new Error('nextPrime expects a finite integer.');
    if (value < 2)
        return 2;
    if (value === 2)
        return 3;
    let candidate = value + (value % 2 === 0 ? 1 : 2);
    while (!isPrime(candidate)) {
        candidate += 2;
    }
    return candidate;
}
function ensurePrimesUpToValue(limit) {
    if (!isFiniteInteger(limit) || limit < 2)
        return;
    let current = PRIME_CACHE[PRIME_CACHE.length - 1];
    while (current < limit) {
        current = nextPrime(current);
        PRIME_CACHE.push(current);
    }
}
function ensurePrimeCount(count) {
    if (!isFiniteInteger(count) || count < 1)
        return;
    while (PRIME_CACHE.length < count) {
        const current = PRIME_CACHE[PRIME_CACHE.length - 1];
        PRIME_CACHE.push(nextPrime(current));
    }
}
// 1-based index among primes: 2 -> 1, 3 -> 2, 5 -> 3 ...
function indexOfPrime(n) {
    if (!isPrime(n))
        return -1;
    ensurePrimesUpToValue(n);
    for (let i = 0; i < PRIME_CACHE.length; i++) {
        if (PRIME_CACHE[i] === n)
            return i + 1;
    }
    return -1;
}
function nthPrime(index) {
    if (!isFiniteInteger(index) || index < 1) {
        throw new Error('nthPrime expects a positive integer index.');
    }
    ensurePrimeCount(index);
    return PRIME_CACHE[index - 1];
}
function factorInteger(n) {
    if (!isFiniteInteger(n) || n === 0)
        return [];
    if (n < 0)
        return [-1].concat(factorInteger(-n));
    const factors = [];
    let value = n;
    while (value > 1) {
        const f = leastFactor(value);
        factors.push(f);
        value = Math.floor(value / f);
    }
    return factors;
}
function encodeNumber(n) {
    if (!isFiniteInteger(n) || n < 1) {
        throw new Error('xenotateNumber expects a positive integer.');
    }
    if (n === 1)
        return '';
    const factors = factorInteger(n);
    let out = '';
    for (let i = 0; i < factors.length; i++) {
        const f = factors[i];
        if (f === 2) {
            out += ':';
            continue;
        }
        const idx = indexOfPrime(f);
        if (idx < 1)
            throw new Error('Failed to resolve prime index during xenotation.');
        out += `(${encodeNumber(idx)})`;
    }
    return out;
}
function decodeXenotation(input) {
    const source = input.trim();
    if (source.length === 0)
        return 1;
    let i = 0;
    const parseProduct = (stopAtParen) => {
        let product = 1;
        while (i < source.length) {
            const ch = source[i];
            if (ch === ')') {
                if (stopAtParen)
                    return product;
                throw new Error(`Invalid xenotation: unexpected ")" at index ${i}.`);
            }
            if (ch === ':') {
                product *= 2;
                i += 1;
                continue;
            }
            if (ch === '(') {
                i += 1;
                const inner = parseProduct(true);
                if (i >= source.length || source[i] !== ')') {
                    throw new Error('Invalid xenotation: missing closing ")".');
                }
                i += 1;
                product *= nthPrime(inner);
                continue;
            }
            throw new Error(`Invalid xenotation: unsupported token "${ch}" at index ${i}.`);
        }
        if (stopAtParen)
            throw new Error('Invalid xenotation: unclosed "(".');
        return product;
    };
    const value = parseProduct(false);
    if (i !== source.length) {
        throw new Error('Invalid xenotation: trailing tokens.');
    }
    return value;
}
function xenotateNumber(n) {
    return encodeNumber(n);
}
function xenotationToNumber(s) {
    return decodeXenotation(s);
}
function xenote(value) {
    if (typeof value === 'number')
        return xenotateNumber(value);
    return xenotationToNumber(value);
}
function formatXenotationForDisplay(n) {
    if (!isFiniteInteger(n))
        return '';
    if (n === 0)
        return '';
    if (n === 1)
        return 'n/a';
    return xenotateNumber(n);
}
function xenotationByZone() {
    const out = {};
    for (let z = 0; z <= 9; z++) {
        out[z] = formatXenotationForDisplay(z);
    }
    return out;
}
