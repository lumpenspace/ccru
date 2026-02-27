export type CcruCipher = {
    id: string;
    name: string;
    shortName: string;
    icon: string;
    summary: string;
    category: 'CCRU';
    hue: number;
    saturation: number;
    lightness: number;
    chars: string;
    values: number[];
    diacriticsAsRegular: boolean;
    caseSensitive: boolean;
};
export declare const CCRU_CIPHERS: CcruCipher[];
