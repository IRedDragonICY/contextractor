
import { useMemo } from 'react';
import { SmartContextFilters } from '@/store/types';
import { minimatch } from 'minimatch';

interface FileLike {
    name: string;
    path: string;
}

export const useFilteredFiles = <T extends FileLike>(files: T[], filters?: SmartContextFilters): Array<T & { isHidden: boolean }> => {
    return useMemo(() => {
        if (!filters) return files.map(f => ({ ...f, isHidden: false }));

        const { presets, excludePatterns } = filters;

        return files.map(file => {
            let isHidden = false;

            // 1. Check Presets
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            const isSource = ['ts', 'tsx', 'js', 'jsx', 'py', 'rs', 'go', 'java', 'c', 'cpp', 'h', 'hpp', 'css', 'html', 'php', 'rb', 'swift', 'kt'].includes(ext);
            const isDoc = ['md', 'txt', 'pdf', 'rst', 'adoc'].includes(ext);
            const isConfig = ['json', 'toml', 'yaml', 'yml', 'xml', 'ini', 'env', 'gitignore', 'dockerfile', 'lock', 'config', 'conf'].includes(ext) || file.name.startsWith('.');
            // Expanded testing patterns
            const isTest = file.name.includes('.test.') || file.name.includes('.spec.') || file.name.includes('__tests__') || file.name.includes('test') || file.name.includes('spec');

            let included = false;

            if (isSource && presets.source) included = true;
            else if (isDoc && presets.documentation) included = true;
            else if (isConfig && presets.config) included = true;
            else if (!isSource && !isDoc && !isConfig) included = true; // Include other types by default

            if (isTest && presets.noTests) included = false;

            if (!included) isHidden = true;

            // 2. Check Exclude Patterns (Overrides everything)
            if (!isHidden && excludePatterns && excludePatterns.length > 0) {
                for (const pattern of excludePatterns) {
                    if (minimatch(file.path, pattern, { dot: true, matchBase: true })) {
                        isHidden = true;
                        break;
                    }
                }
            }

            return { ...file, isHidden };
        });
    }, [files, filters]);
};
