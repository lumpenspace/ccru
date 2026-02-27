export type FigureDisplaySystem = 'decimal' | 'binary' | 'tic-xenotation';
type FigureProps = {
    title: string;
    value: string | number;
    accent?: string;
    className?: string;
    size?: 'md' | 'sm';
    align?: 'left' | 'center';
    showDisplaySystem?: boolean;
    displaySystem?: FigureDisplaySystem;
    restDisplaySystem?: FigureDisplaySystem;
    hoverDisplaySystem?: FigureDisplaySystem;
};
export declare function Figure({ title, value, accent, className, size, align, showDisplaySystem, displaySystem, restDisplaySystem, hoverDisplaySystem, }: FigureProps): import("react/jsx-runtime").JSX.Element;
export {};
