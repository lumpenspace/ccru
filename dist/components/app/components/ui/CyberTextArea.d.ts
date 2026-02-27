type CyberTextAreaProps = {
    label: string;
    value: string;
    onChange: (next: string) => void;
    rows?: number;
    placeholder?: string;
    pillCollection?: boolean;
};
export declare function CyberTextArea({ label, value, onChange, rows, placeholder, pillCollection, }: CyberTextAreaProps): import("react/jsx-runtime").JSX.Element;
export {};
