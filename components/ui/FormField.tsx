"use client";

import { ReactNode } from "react";
import { Label, Input, TextFieldRoot } from "@heroui/react";

export function FormField({
    label,
    placeholder,
    value,
    onChange,
    type = "text",
    hint,
    className = "",
    disabled = false,
    max,
}: {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    hint?: string;
    className?: string;
    disabled?: boolean;
    max?: number;
}) {
    return (
        <TextFieldRoot className={`flex flex-col gap-1.5 ${className}`}>
            <Label className="text-[10px] font-black uppercase tracking-widest text-default-400">{label}</Label>
            <Input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-default-50 border-divider"
                disabled={disabled}
                maxLength={max}
            />
            {hint && <p className="text-[10px] text-default-400 italic">{hint}</p>}
        </TextFieldRoot>
    );
}