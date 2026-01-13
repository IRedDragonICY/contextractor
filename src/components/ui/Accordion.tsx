
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItemProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    className?: string;
}

export const AccordionItem = ({ title, isOpen, onToggle, children, className }: AccordionItemProps) => {
    return (
        <div className={cn("border-b border-gray-200 dark:border-gray-800 last:border-0", className)}>
            <button
                onClick={onToggle}
                className="flex w-full items-center justify-between py-4 text-sm font-medium transition-all hover:text-blue-600 dark:hover:text-blue-400"
            >
                {title}
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4 pt-0 text-sm opacity-90">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface AccordionProps {
    children: React.ReactNode;
    className?: string;
}

export const Accordion = ({ children, className }: AccordionProps) => {
    return <div className={cn("w-full", className)}>{children}</div>;
};
