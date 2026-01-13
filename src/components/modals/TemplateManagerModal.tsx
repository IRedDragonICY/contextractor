import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleIcon } from '../ui/GoogleIcon';
import { UI_ICONS_MAP } from '@/lib/icon-mapping';
import { useTemplateStore } from '@/store';
import { PromptTemplate, TEMPLATE_PLACEHOLDER } from '@/constants/templates';

interface TemplateManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TemplateManagerModal: React.FC<TemplateManagerModalProps> = ({ isOpen, onClose }) => {
    const { customTemplates, addCustomTemplate, updateCustomTemplate, removeCustomTemplate } = useTemplateStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<PromptTemplate>>({
        name: '',
        description: '',
        template: TEMPLATE_PLACEHOLDER,
        category: 'custom'
    });

    const isEditing = editingId !== null;

    const handleEdit = (template: PromptTemplate) => {
        setEditingId(template.id);
        setFormData({ ...template });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            name: '',
            description: '',
            template: TEMPLATE_PLACEHOLDER,
            category: 'custom'
        });
    };

    const handleSave = () => {
        if (!formData.name || !formData.template) return;

        if (isEditing && editingId) {
            updateCustomTemplate(editingId, formData);
        } else {
            addCustomTemplate({
                id: crypto.randomUUID(),
                name: formData.name,
                description: formData.description || '',
                template: formData.template,
                category: 'custom'
            } as PromptTemplate);
        }
        handleCancelEdit();
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this template?')) {
            removeCustomTemplate(id);
            if (editingId === id) handleCancelEdit();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 m-auto w-full max-w-4xl h-[80vh] bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl shadow-2xl z-[101] flex overflow-hidden lg:h-[700px]"
                    >
                        {/* Sidebar List */}
                        <div className="w-1/3 border-r border-[var(--theme-border)] flex flex-col bg-[var(--theme-surface)]">
                            <div className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center">
                                <h3 className="font-medium text-[var(--theme-text-primary)]">My Templates</h3>
                                <button
                                    onClick={handleCancelEdit}
                                    className="p-1.5 hover:bg-[var(--theme-surface-hover)] rounded-md text-[var(--theme-primary)]"
                                    title="Create New"
                                >
                                    <GoogleIcon icon={UI_ICONS_MAP.add} className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {customTemplates.length === 0 && (
                                    <div className="text-center py-8 text-[var(--theme-text-tertiary)] text-sm">
                                        No custom templates yet.
                                    </div>
                                )}
                                {customTemplates.map(t => (
                                    <div
                                        key={t.id}
                                        onClick={() => handleEdit(t)}
                                        className={`p-3 rounded-lg cursor-pointer border transition-colors group ${editingId === t.id
                                                ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)]'
                                                : 'bg-[var(--theme-bg)] border-transparent hover:border-[var(--theme-border)]'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="font-medium text-sm text-[var(--theme-text-primary)]">{t.name}</div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(t.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-[var(--theme-text-tertiary)] hover:text-[var(--theme-error)]"
                                            >
                                                <GoogleIcon icon={UI_ICONS_MAP.delete} className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="text-xs text-[var(--theme-text-secondary)] truncate mt-1">
                                            {t.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Editor Area */}
                        <div className="flex-1 flex flex-col bg-[var(--theme-bg)]">
                            <div className="p-4 border-b border-[var(--theme-border)] flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-[var(--theme-text-primary)]">
                                    {isEditing ? 'Edit Template' : 'New Template'}
                                </h2>
                                <button onClick={onClose} className="text-[var(--theme-text-tertiary)] hover:text-[var(--theme-text-primary)]">
                                    <GoogleIcon icon={UI_ICONS_MAP.close} className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--theme-text-secondary)]">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-lg focus:outline-none focus:border-[var(--theme-primary)] text-[var(--theme-text-primary)]"
                                        placeholder="e.g., Python Conversion Wrapper"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--theme-text-secondary)]">Description</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-lg focus:outline-none focus:border-[var(--theme-primary)] text-[var(--theme-text-primary)]"
                                        placeholder="Short description of what this template does"
                                    />
                                </div>
                                <div className="space-y-2 flex-1 flex flex-col min-h-[300px]">
                                    <label className="text-sm font-medium text-[var(--theme-text-secondary)] flex justify-between">
                                        <span>Template Content</span>
                                        <span className="text-xs text-[var(--theme-text-tertiary)]">Must include <code className="bg-[var(--theme-surface-hover)] px-1 rounded">{TEMPLATE_PLACEHOLDER}</code></span>
                                    </label>
                                    <textarea
                                        value={formData.template}
                                        onChange={e => setFormData({ ...formData, template: e.target.value })}
                                        className="flex-1 w-full p-4 font-mono text-sm bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-lg focus:outline-none focus:border-[var(--theme-primary)] text-[var(--theme-text-primary)] resize-none leading-relaxed"
                                        placeholder={`Enter your template here...\n\n${TEMPLATE_PLACEHOLDER}`}
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t border-[var(--theme-border)] flex justify-end gap-3 bg-[var(--theme-surface)]">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--theme-text-secondary)] hover:bg-[var(--theme-surface-hover)]"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!formData.name || !formData.template?.includes(TEMPLATE_PLACEHOLDER)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isEditing ? 'Update Template' : 'Create Template'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
