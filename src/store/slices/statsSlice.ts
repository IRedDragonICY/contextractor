
import type { StoreSlice, StatsSlice } from '../types';

export const createStatsSlice: StoreSlice<StatsSlice> = (set) => ({
    // Initial State
    isProcessing: false,
    processingProgress: null,

    // Actions
    updateSessionStats: (sessionId, stats) => {
        set((state) => {
            const session = state.sessions.find(s => s.id === sessionId);
            if (session) {
                session.stats = { ...session.stats, ...stats };
                // Calculate cost (simple estimate: $5/1M tokens input for GPT-4o approx)
                // This is a placeholder; we'll make this dynamic later
                session.stats.estimatedCost = (session.stats.selectedTokensCount / 1000000) * 5.00;
                session.updatedAt = Date.now();
            }
        });
    },

    startProcessing: (totalFiles, totalBytes) => {
        set((state) => {
            state.isProcessing = true;
            state.processingProgress = {
                current_file_name: 'Starting...',
                processed_files_count: 0,
                total_files_count: totalFiles,
                processed_bytes: 0,
                total_bytes: totalBytes,
                tokens_saved: 0
            };
        });
    },

    updateProcessingProgress: (progress) => {
        set((state) => {
            state.processingProgress = progress;
        });
    },

    endProcessing: () => {
        set((state) => {
            state.isProcessing = false;
            state.processingProgress = null;
        });
    },
});
