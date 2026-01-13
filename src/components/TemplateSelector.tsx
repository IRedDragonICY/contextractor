import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleIcon } from './ui/GoogleIcon';
import { UI_ICONS_MAP } from '@/lib/icon-mapping';
import { DEFAULT_PROMPT_TEMPLATES, PromptTemplate } from '@/constants/templates';
import { useTemplateStore } from '@/store';

interface TemplateSelectorProps {
    className?: string;
    onManageTemplates?: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ className, onManageTemplates }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { customTemplates, selectedTemplateId, setSelectedTemplate } = useTemplateStore();

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search on open
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const allTemplates = [...DEFAULT_PROMPT_TEMPLATES, ...customTemplates];
    const selectedTemplate = allTemplates.find(t => t.id === selectedTemplateId);

    // Group templates
    const groups = {
        wrapper: allTemplates.filter(t => t.category === 'wrapper'),
        custom: allTemplates.filter(t => t.category === 'custom'),
        analysis: allTemplates.filter(t => t.category === 'analysis'),
        refactor: allTemplates.filter(t => t.category === 'refactor'),
        security: allTemplates.filter(t => t.category === 'security'),
        doc: allTemplates.filter(t => t.category === 'doc'),
        test: allTemplates.filter(t => t.category === 'test'),
    };

    const filteredGroups = Object.entries(groups).reduce((acc, [key, items]) => {
        const filtered = (items as PromptTemplate[]).filter(t =>
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filtered.length > 0) {
            acc[key as keyof typeof groups] = filtered;
        }
        return acc;
    }, {} as typeof groups);

    const handleSelect = (id: string | null) => {
        setSelectedTemplate(id);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${selectedTemplate
                    ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]'
                    : 'bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text-secondary)] hover:bg-[var(--theme-surface-hover)]'
                    }`}
            >
                <GoogleIcon icon={selectedTemplate ? UI_ICONS_MAP.template : UI_ICONS_MAP.code} className="w-4 h-4" />
                <span className="truncate max-w-[150px]">
                    {selectedTemplate ? selectedTemplate.name : 'No Template'}
                </span>
                <GoogleIcon icon={UI_ICONS_MAP.chevronDown} className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-full mt-2 w-80 max-h-[400px] flex flex-col bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                        {/* Search Header */}
                        <div className="p-3 border-b border-[var(--theme-border)]">
                            <div className="relative">
                                <GoogleIcon icon={UI_ICONS_MAP.search} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-tertiary)]" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search templates..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-lg text-sm text-[var(--theme-text-primary)] placeholder-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--theme-primary)]"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-3">
                            {/* None Option */}
                            {!searchTerm && (
                                <button
                                    onClick={() => handleSelect(null)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${selectedTemplateId === null
                                        ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]'
                                        : 'text-[var(--theme-text-primary)] hover:bg-[var(--theme-surface-hover)]'
                                        }`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-center shrink-0">
                                        <GoogleIcon icon={UI_ICONS_MAP.close} className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">No Template</div>
                                        <div className="text-xs text-[var(--theme-text-tertiary)]">Raw text output</div>
                                    </div>
                                    {selectedTemplateId === null && (
                                        <GoogleIcon icon={UI_ICONS_MAP.check} className="w-4 h-4 ml-auto" />
                                    )}
                                </button>
                            )}

                            {Object.entries(filteredGroups).map(([category, items]) => {
                                if ((items as PromptTemplate[]).length === 0) return null;
                                return (
                                    <div key={category}>
                                        <div className="px-3 py-1 text-[10px] font-bold text-[var(--theme-text-tertiary)] uppercase tracking-wider">
                                            {category}
                                        </div>
                                        <div className="space-y-1 mt-1">
                                            {(items as PromptTemplate[]).map(template => (
                                                <button
                                                    key={template.id}
                                                    onClick={() => handleSelect(template.id)}
                                                    className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg text-left transition-colors group ${selectedTemplateId === template.id
                                                        ? 'bg-[var(--theme-primary)]/10'
                                                        : 'hover:bg-[var(--theme-surface-hover)]'
                                                        }`}
                                                >
                                                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${selectedTemplateId === template.id
                                                        ? 'bg-[var(--theme-primary)] text-white shadow-sm'
                                                        : 'bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text-secondary)]'
                                                        }`}>
                                                        <GoogleIcon icon={category === 'wrapper' ? UI_ICONS_MAP.code : UI_ICONS_MAP.template} className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className={`font-medium text-sm truncate ${selectedTemplateId === template.id ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-text-primary)]'
                                                            }`}>
                                                            {template.name}
                                                        </div>
                                                        <div className="text-xs text-[var(--theme-text-tertiary)] truncate group-hover:text-wrap">
                                                            {template.description}
                                                        </div>
                                                    </div>
                                                    {selectedTemplateId === template.id && (
                                                        <GoogleIcon icon={UI_ICONS_MAP.check} className="w-4 h-4 text-[var(--theme-primary)] shrink-0 my-auto" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="p-2 border-t border-[var(--theme-border)] bg-[var(--theme-surface)]">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    onManageTemplates?.();
                                }}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[var(--theme-text-secondary)] hover:bg-[var(--theme-surface-hover)] hover:text-[var(--theme-primary)] transition-colors"
                            >
                                <GoogleIcon icon={UI_ICONS_MAP.settings} className="w-3.5 h-3.5" />
                                Manage Templates
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
