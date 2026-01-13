
import ignore from 'ignore';

// Simple interface for file-like objects to be filtered
export interface FileLike {
    path?: string;
    webkitRelativePath?: string;
    name: string;
}

/**
 * Filter files based on .gitignore rules
 * @param files List of files to filter
 * @returns Filtered list of files
 */
export const filterWithGitIgnore = async (files: File[]): Promise<File[]> => {
    // 1. Find all .gitignore files
    const gitIgnoreFiles = files.filter(f => f.name === '.gitignore');

    if (gitIgnoreFiles.length === 0) {
        return files;
    }

    // 2. Build ignore manager
    const ig = ignore();

    // Add default ignores
    ig.add(['.git', '.DS_Store', 'node_modules']);

    // 3. Process .gitignore contents
    for (const file of gitIgnoreFiles) {
        try {
            const content = await file.text();
            // TODO: Correctly handle relative paths for nested .gitignores
            // For now, we assume a single root .gitignore or merge them all (less accurate but functional PoC)
            ig.add(content);
        } catch (e) {
            console.error('Failed to read .gitignore:', e);
        }
    }

    // 4. Filter
    return files.filter(file => {
        const path = file.webkitRelativePath || file.name;
        // Ignore requires paths not to start with /
        const relativePath = path.startsWith('/') ? path.slice(1) : path;

        // Don't filter out the .gitignore files themselves! (Or maybe we do? Users usually want code)
        // Let's keep them for now, visible in the list.
        if (file.name === '.gitignore') return true;

        return !ig.ignores(relativePath);
    });
};
