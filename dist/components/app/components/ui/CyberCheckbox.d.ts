import React from 'react';
type CyberCheckboxProps = {
    checked: boolean;
    label: string;
    onChange: () => void;
    disabled?: boolean;
    icon?: React.ReactNode;
    accent?: string;
    className?: string;
};
export declare function CyberCheckbox({ checked, label, onChange, disabled, icon, accent, className, }: CyberCheckboxProps): import("react/jsx-runtime").JSX.Element;
export {};
