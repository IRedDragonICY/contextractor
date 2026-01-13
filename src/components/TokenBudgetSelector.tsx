import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleIcon } from '@/components/ui/GoogleIcon';
import { UI_ICONS_MAP } from '@/lib/icon-mapping';
import { MODEL_LIMITS, PROVIDERS } from '@/constants/model-limits';

interface TokenBudgetSelectorProps {
    currentBudget: number;
    activeModelId?: string;
    onSelect: (budget: number, modelId: string) => void;
}

export const TokenBudgetSelector: React.FC<TokenBudgetSelectorProps> = ({
    currentBudget,
    activeModelId,
    onSelect
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const activeModel = MODEL_LIMITS.find(m => m.id === activeModelId)
        || MODEL_LIMITS.find(m => m.limit === currentBudget)
        || { name: 'Custom', limit: currentBudget, color: 'var(--theme-text-primary)' };

    const formatLimit = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace('.0', '')}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
        return num.toString();
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] transition-colors group"
            >
                <span className="text-xs font-medium text-[var(--theme-text-secondary)] group-hover:text-[var(--theme-text-primary)]">
                    {activeModel.name}
                </span>
                <span className="text-[10px] text-[var(--theme-text-tertiary)] bg-[var(--theme-bg)] px-1.5 py-0.5 rounded-md border border-[var(--theme-border)]">
                    {formatLimit(currentBudget)}
                </span>
                <GoogleIcon
                    icon={UI_ICONS_MAP.chevronDown}
                    className={`w-3 h-3 text-[var(--theme-text-tertiary)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-2 w-64 p-2 bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] rounded-xl shadow-xl z-50 backdrop-blur-xl"
                    >
                        <div className="max-h-[300px] overflow-y-auto pr-1">
                            {PROVIDERS.map(provider => (
                                <div key={provider} className="mb-3 last:mb-0">
                                    <div className="px-2 py-1 text-[10px] font-semibold text-[var(--theme-text-tertiary)] uppercase tracking-wider">
                                        {provider}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {MODEL_LIMITS.filter(m => m.provider === provider).map(model => {
                                            const isSelected = activeModelId
                                                ? activeModelId === model.id
                                                : currentBudget === model.limit;

                                            return (
                                                <button
                                                    key={model.id}
                                                    onClick={() => {
                                                        onSelect(model.limit, model.id);
                                                        setIsOpen(false);
                                                    }}
                                                    className={`
                                                        flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors
                                                        ${isSelected
                                                            ? 'bg-[var(--theme-primary)] text-[var(--theme-primary-contrast)]'
                                                            : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-surface-hover)] hover:text-[var(--theme-text-primary)]'
                                                        }
                                                    `}
                                                >
                                                    <span className="font-medium">{model.name}</span>
                                                    <span className={`text-[10px] opacity-80 ${isSelected ? 'text-white' : 'text-[var(--theme-text-tertiary)]'}`}>
                                                        {formatLimit(model.limit)}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
