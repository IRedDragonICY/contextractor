
import type { StoreSlice, FilterSlice } from '../types';

export const createFilterSlice: StoreSlice<FilterSlice> = (set) => ({
    togglePreset: (sessionId, preset) => {
        set((state) => {
            const session = state.sessions.find(s => s.id === sessionId);
            if (session) {
                session.filters.presets[preset] = !session.filters.presets[preset];
                session.updatedAt = Date.now();
            }
        });
    },

    addExcludePattern: (sessionId, pattern) => {
        set((state) => {
            const session = state.sessions.find(s => s.id === sessionId);
            if (session && !session.filters.excludePatterns.includes(pattern)) {
                session.filters.excludePatterns.push(pattern);
                session.updatedAt = Date.now();
            }
        });
    },

    removeExcludePattern: (sessionId, pattern) => {
        set((state) => {
            const session = state.sessions.find(s => s.id === sessionId);
            if (session) {
                session.filters.excludePatterns = session.filters.excludePatterns.filter(p => p !== pattern);
                session.updatedAt = Date.now();
            }
        });
    },

    setExcludePatterns: (sessionId, patterns) => {
        set((state) => {
            const session = state.sessions.find(s => s.id === sessionId);
            if (session) {
                session.filters.excludePatterns = patterns;
                session.updatedAt = Date.now();
            }
        });
    },
});
