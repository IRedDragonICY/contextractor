import React from 'react';
import { motion } from 'framer-motion';
import { GoogleIcon } from '@/components/ui/GoogleIcon';
import { UI_ICONS_MAP } from '@/lib/icon-mapping';
import { TokenBudgetSelector } from '@/components/TokenBudgetSelector';
import { MODEL_LIMITS } from '@/constants/model-limits';

interface TokenBudgetBarProps {
    currentTokens: number;
    tokenBudget: number;
    activeModelId?: string;
    onBudgetChange?: (budget: number, modelId?: string) => void;
}

export const TokenBudgetBar: React.FC<TokenBudgetBarProps> = ({
    currentTokens,
    tokenBudget,
    activeModelId,
    onBudgetChange
}) => {
    const percentage = Math.min((currentTokens / tokenBudget) * 100, 100);
    const isOverBudget = currentTokens > tokenBudget;

    // Determine color based on usage
    let progressColor = 'var(--theme-success)'; // Green
    if (percentage > 75) progressColor = 'var(--theme-warning)'; // Yellow
    if (percentage >= 100) progressColor = 'var(--theme-error)'; // Red

    const formatTokens = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };

    return (
        <div className="flex flex-col gap-3 p-4 bg-[var(--theme-bg)] rounded-xl border border-[var(--theme-border)]">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GoogleIcon icon={UI_ICONS_MAP.chart} className="w-4 h-4 text-[var(--theme-text-secondary)]" />
                    <span className="text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">
                        Token Budget
                    </span>
                </div>

                {onBudgetChange && (
                    <TokenBudgetSelector
                        currentBudget={tokenBudget}
                        activeModelId={activeModelId}
                        onSelect={onBudgetChange}
                    />
                )}

                {!onBudgetChange && (
                    <div className="flex items-center gap-1">
                        <span className={`text-xs font-mono font-medium ${isOverBudget ? 'text-[var(--theme-error)]' : 'text-[var(--theme-text-primary)]'}`}>
                            {formatTokens(currentTokens)}
                        </span>
                        <span className="text-xs text-[var(--theme-text-tertiary)]">/</span>
                        <span className="text-xs text-[var(--theme-text-secondary)] font-mono">
                            {formatTokens(tokenBudget)}
                        </span>
                    </div>
                )}
            </div>

            <div className="relative h-2 bg-[var(--theme-surface-elevated)] rounded-full overflow-hidden">
                <motion.div
                    className="absolute top-0 bottom-0 left-0 rounded-full"
                    style={{ backgroundColor: progressColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />

                {/* Markers for key limits if they fall within current budget */}
                {MODEL_LIMITS.map(model => {
                    // Only show markers for standard limits if they are less than current budget
                    // and not the current budget itself (to avoid overlap with end)
                    if (model.limit >= tokenBudget) return null;

                    const pos = (model.limit / tokenBudget) * 100;

                    return (
                        <div
                            key={model.id}
                            className="absolute top-0 bottom-0 w-0.5 bg-white/20 z-10"
                            style={{ left: `${pos}%` }}
                            title={`${model.name}: ${formatTokens(model.limit)}`}
                        />
                    );
                })}
            </div>

            {/* Usage Text below bar */}
            <div className="flex justify-between items-center text-[10px] text-[var(--theme-text-tertiary)]">
                <span>{((currentTokens / tokenBudget) * 100).toFixed(1)}% Used</span>
                <span>{formatTokens(tokenBudget - currentTokens)} Remaining</span>
            </div>
        </div>
    );
};
