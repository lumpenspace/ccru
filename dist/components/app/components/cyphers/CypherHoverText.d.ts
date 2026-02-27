export type HoverCypher = {
    id?: string;
    name: string;
    shortName?: string;
    chars: string;
    values: number[];
    hue?: number;
    saturation?: number;
    lightness?: number;
    diacriticsAsRegular?: boolean;
    caseSensitive?: boolean;
};
type CypherHoverTextProps = {
    cyphers: HoverCypher[];
    markdown?: string;
    markup?: string;
    className?: string;
};
export declare function CypherHoverText({ cyphers, markdown, markup, className }: CypherHoverTextProps): import("react/jsx-runtime").JSX.Element;
export {};
