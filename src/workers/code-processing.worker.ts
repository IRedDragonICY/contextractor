import type { CodeProcessingMode } from '@/types';
import { transformWithExtension } from '@/lib/ast/transforms';
import { processCode as regexProcess } from '@/lib/code-processing';

export interface WorkerMessage {
    type: 'process';
    id: string;
    files: Array<{
        id: string;
        name: string;
        path: string;
        content: string;
        isText: boolean;
    }>;
    outputStyle: string;
    mode: CodeProcessingMode;
}

import { ProcessingProgress } from '@/types/processing';
import { getEncoding } from 'js-tiktoken';

// Singleton encoder instance
const enc = getEncoding('cl100k_base'); // GPT-4 tokenizer

export interface WorkerResponse {
    type: 'result' | 'progress' | 'error';
    id: string;
    result?: string;
    lines?: string[];
    progress?: number;
    progressPayload?: ProcessingProgress;
    tokenSavings?: number;
    error?: string;
}

const MAX_PROCESS_SIZE = 2 * 1024 * 1024; // 2MB limit to avoid skipping large files too aggressively

function appendFileLines(
    lines: string[],
    outputStyle: string,
    pathLabel: string,
    ext: string,
    content: string,
    isFirst: boolean
): void {
    if (!isFirst) {
        lines.push('');
    }

    switch (outputStyle) {
        case 'hash':
            lines.push(`# --- ${pathLabel} ---`);
            break;
        case 'minimal':
            lines.push(`--- ${pathLabel} ---`);
            break;
        case 'xml':
            lines.push(`<file name="${pathLabel}">`);
            break;
        case 'markdown':
            lines.push(`### ${pathLabel}`);
            lines.push(`\`\`\`${ext}`);
            break;
        case 'standard':
        default:
            lines.push(`/* --- ${pathLabel} --- */`);
            break;
    }

    const contentLines = content.split('\n');
    for (const line of contentLines) {
        lines.push(line);
    }

    if (outputStyle === 'xml') {
        lines.push('</file>');
    } else if (outputStyle === 'markdown') {
        lines.push('```');
    }
}

async function processFile(
    content: string,
    extension: string,
    mode: CodeProcessingMode
): Promise<string> {
    if (mode === 'raw' || !content) return content;

    if (content.length > MAX_PROCESS_SIZE) {
        return content;
    }

    // Try AST transformation first for supported modes
    if (['remove-comments', 'signatures-only', 'interfaces-only', 'minify'].includes(mode)) {
        try {
            const astResult = await transformWithExtension(content, extension, mode);
            if (astResult !== null) {
                // If minify, we might want to do a secondary regex pass to cleanup whitespace
                // since AST typically just removes comments but leaves structure
                if (mode === 'minify') {
                    // For now, AST 'minify' just removes comments.
                    // We can pipe it into regexProcess for safe whitespace removal if we want.
                    // But let's trust AST result for now or do a simple whitespace cleanup?
                    // Actually, regexProcess('minify') does comments + whitespace.
                    // If AST did comments, we just need whitespace cleanup.
                    // Let's rely on regexProcess for the whitespace part if needed?
                    // Or just return astResult if it's "good enough" for Level 2?
                    // Level 2 is "Remove comments & excess whitespace".
                    // AST `remove-comments` returns code with blank lines where comments were.
                    // So we SHOULD run regex cleanup on it.
                    const cleaned = regexProcess(astResult, extension, 'minify');
                    return cleaned;
                }
                return astResult;
            }
        } catch (error) {
            console.warn('AST transform failed, falling back to regex', error);
        }
    }

    // Fallback to regex pipeline
    // For 'minify' fallback, it uses 'minify' mode.
    // For 'remove-comments' fallback, it uses 'remove-comments'.
    // For others (signatures-only etc), if AST failed, we might check if regex supports it?
    // Regex doesn't support signatures-only really. So fallback to raw or remove-comments?
    // Let's stick to existing logic:
    return regexProcess(content, extension, mode === 'signatures-only' || mode === 'interfaces-only' ? 'raw' : mode);
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
    const { type, id, files, outputStyle, mode } = e.data;
    if (type !== 'process') return;

    const textFiles = files.filter(f => f.isText);
    const total_files_count = textFiles.length;
    let total_bytes = 0;
    for (const f of textFiles) {
        total_bytes += f.content.length;
    }

    // Emit initial STARTING progress immediately
    self.postMessage({
        type: 'progress',
        id,
        progress: 0,
        progressPayload: {
            current_file_name: 'Starting...',
            processed_files_count: 0,
            total_files_count,
            processed_bytes: 0,
            total_bytes,
            tokens_saved: 0
        }
    } satisfies WorkerResponse);

    const lines: string[] = [];

    let processed_files_count = 0;
    let processed_bytes = 0;
    let tokens_saved = 0; // tracking chars saved

    let originalLengthTotal = 0;
    let processedLengthTotal = 0;

    for (let i = 0; i < textFiles.length; i++) {
        const file = textFiles[i];
        const ext = file.name.split('.').pop() || 'txt';
        const pathLabel = file.path || file.name;
        const originalLen = file.content.length;

        originalLengthTotal += originalLen;

        const processedContent = await processFile(file.content, ext, mode);
        const processedLen = processedContent.length;
        processedLengthTotal += processedLen;

        // Accurate token counting using tiktoken
        const originalTokens = enc.encode(file.content).length;
        const processedTokens = enc.encode(processedContent).length;
        tokens_saved += (originalTokens - processedTokens);

        processed_bytes += originalLen; // tracking input progress

        appendFileLines(lines, outputStyle, pathLabel, ext, processedContent, i === 0);

        processed_files_count++;

        // Emit progress periodically or on every file if total is small
        if (total_files_count < 100 || processed_files_count % 5 === 0 || processed_files_count === total_files_count) {
            const payload: ProcessingProgress = {
                current_file_name: file.name,
                processed_files_count,
                total_files_count,
                processed_bytes,
                total_bytes,
                tokens_saved
            };

            self.postMessage({
                type: 'progress',
                id,
                progress: Math.round((processed_files_count / total_files_count) * 100), // kept for legacy if needed
                progressPayload: payload
            } satisfies WorkerResponse);
        }
    }

    const tokenSavings = mode === 'raw' || originalLengthTotal === 0
        ? 0
        : Math.max(0, Math.round(((originalLengthTotal - processedLengthTotal) / originalLengthTotal) * 100));

    self.postMessage({
        type: 'result',
        id,
        lines,
        tokenSavings
    } satisfies WorkerResponse);
};

self.postMessage({ type: 'ready', id: 'code-processing' });

