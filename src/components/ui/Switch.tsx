
import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
    disabled?: boolean;
}

export const Switch = ({ checked, onCheckedChange, className, disabled }: SwitchProps) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onCheckedChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                checked ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            <span className="sr-only">Use setting</span>
            <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    checked ? "translate-x-5" : "translate-x-0"
                )}
            />
        </button>
    );
};
