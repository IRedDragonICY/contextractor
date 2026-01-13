
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { GoogleIcon } from '@/components/ui/GoogleIcon';
import { UI_ICONS_MAP } from '@/lib/icon-mapping';
import { SmartContextFilters } from '@/store/types';

interface SidebarFilterPanelProps {
    filters: SmartContextFilters;
    onTogglePreset: (preset: keyof SmartContextFilters['presets']) => void;
    onAddPattern: (pattern: string) => void;
    onRemovePattern: (pattern: string) => void;
    hiddenCount?: number;
    className?: string;
}

export const SidebarFilterPanel = ({
    filters,
    onTogglePreset,
    onAddPattern,
    onRemovePattern,
    hiddenCount = 0,
    className = ''
}: SidebarFilterPanelProps) => {

    const [newPattern, setNewPattern] = React.useState('');
    const { presets, excludePatterns } = filters;

    const handleAddPatternSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPattern.trim()) {
            onAddPattern(newPattern.trim());
            setNewPattern('');
        }
    };

    return (
        <div className={`flex flex-col h-full bg-[var(--theme-surface)] w-full ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-[var(--theme-border)]">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-semibold text-[var(--theme-text-primary)] flex items-center gap-2 uppercase tracking-wide">
                        Smart Context
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border-transparent">
                            Beta
                        </Badge>
                    </h2>
                    {hiddenCount > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--theme-error)]/10 border border-[var(--theme-error)]/20">
                            <GoogleIcon icon={UI_ICONS_MAP.warning} className="w-3 h-3 text-[var(--theme-error)]" />
                            <span className="text-[10px] font-medium text-[var(--theme-error)]">
                                {hiddenCount} hidden
                            </span>
                        </div>
                    )}
                </div>
                <p className="text-[11px] text-[var(--theme-text-tertiary)]">
                    Intelligently filter files to keep your context clean.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-[var(--theme-border)] scrollbar-track-transparent">
                {/* Presets Section */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <GoogleIcon icon={UI_ICONS_MAP.tune} className="w-3.5 h-3.5 text-[var(--theme-text-tertiary)]" />
                        <span className="text-[11px] font-semibold text-[var(--theme-text-tertiary)] uppercase tracking-wider">
                            Presets
                        </span>
                    </div>

                    <div className="bg-[var(--theme-surface-elevated)] rounded-xl border border-[var(--theme-border)] overflow-hidden">
                        <div className="divide-y divide-[var(--theme-border)]">
                            <div className="flex items-center justify-between p-3 hover:bg-[var(--theme-surface-hover)] transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-[var(--theme-text-primary)]">Source Code</span>
                                    <span className="text-[10px] text-[var(--theme-text-tertiary)]">Include source files</span>
                                </div>
                                <Switch checked={presets.source} onCheckedChange={() => onTogglePreset('source')} />
                            </div>
                            <div className="flex items-center justify-between p-3 hover:bg-[var(--theme-surface-hover)] transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-[var(--theme-text-primary)]">Documentation</span>
                                    <span className="text-[10px] text-[var(--theme-text-tertiary)]">Include markdown & docs</span>
                                </div>
                                <Switch checked={presets.documentation} onCheckedChange={() => onTogglePreset('documentation')} />
                            </div>
                            <div className="flex items-center justify-between p-3 hover:bg-[var(--theme-surface-hover)] transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-[var(--theme-text-primary)]">Config Files</span>
                                    <span className="text-[10px] text-[var(--theme-text-tertiary)]">Include config & setup</span>
                                </div>
                                <Switch checked={presets.config} onCheckedChange={() => onTogglePreset('config')} />
                            </div>
                            <div className="flex items-center justify-between p-3 hover:bg-[var(--theme-surface-hover)] transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-[var(--theme-text-primary)]">Hide Tests</span>
                                    <span className="text-[10px] text-[var(--theme-text-tertiary)]">Exclude test files</span>
                                </div>
                                <Switch checked={presets.noTests} onCheckedChange={() => onTogglePreset('noTests')} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exclude Patterns Section */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <GoogleIcon icon={UI_ICONS_MAP.filter} className="w-3.5 h-3.5 text-[var(--theme-text-tertiary)]" />
                        <span className="text-[11px] font-semibold text-[var(--theme-text-tertiary)] uppercase tracking-wider">
                            Exclude Patterns
                        </span>
                    </div>

                    <div className="bg-[var(--theme-surface-elevated)] rounded-xl border border-[var(--theme-border)] p-3 space-y-3">
                        <form onSubmit={handleAddPatternSubmit} className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={newPattern}
                                    onChange={(e) => setNewPattern(e.target.value)}
                                    placeholder="e.g. **/__tests__/**"
                                    className="w-full h-9 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-bg)] px-3 py-1.5 text-xs text-[var(--theme-text-primary)] placeholder-[var(--theme-text-muted)] focus:border-[var(--theme-primary)] outline-none transition-colors"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!newPattern.trim()}
                                className={`
                                    h-9 w-9 inline-flex items-center justify-center rounded-lg border transition-all
                                    ${newPattern.trim()
                                        ? 'bg-[var(--theme-primary)] border-[var(--theme-primary)] text-white shadow-sm hover:opacity-90'
                                        : 'bg-[var(--theme-bg)] border-[var(--theme-border)] text-[var(--theme-text-muted)] cursor-not-allowed'}
                                `}
                            >
                                <GoogleIcon icon={UI_ICONS_MAP.add} className="w-4 h-4" />
                            </button>
                        </form>

                        <div className="space-y-2">
                            <AnimatePresence initial={false}>
                                {excludePatterns.map((pattern) => (
                                    <motion.div
                                        key={pattern}
                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                        className="group flex items-center justify-between bg-[var(--theme-bg)] px-3 py-2 rounded-lg border border-[var(--theme-border)] hover:border-[var(--theme-text-tertiary)] transition-colors"
                                    >
                                        <span className="truncate font-mono text-[11px] text-[var(--theme-text-secondary)]">
                                            {pattern}
                                        </span>
                                        <button
                                            onClick={() => onRemovePattern(pattern)}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-[var(--theme-error)]/10 text-[var(--theme-text-tertiary)] hover:text-[var(--theme-error)] transition-all"
                                        >
                                            <GoogleIcon icon={UI_ICONS_MAP.close} className="w-3.5 h-3.5" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {excludePatterns.length === 0 && (
                                <div className="text-center py-4 border-2 border-dashed border-[var(--theme-border)] rounded-lg">
                                    <p className="text-[10px] text-[var(--theme-text-muted)] italic">
                                        No custom patterns added
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer / Tip */}
                <div className="mt-4 p-3 bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] rounded-xl">
                    <div className="flex items-start gap-2">
                        <GoogleIcon icon={UI_ICONS_MAP.check_circle} className="w-4 h-4 text-[var(--theme-success)] shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-[var(--theme-text-primary)]">Why Smart Context?</p>
                            <p className="text-[11px] leading-relaxed text-[var(--theme-text-tertiary)]">
                                Reduce token usage and improve AI accuracy by removing irrelevant files like lockfiles, tests, and build artifacts.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
