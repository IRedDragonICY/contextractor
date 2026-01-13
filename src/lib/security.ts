import { FileData } from '@/types';
import { SecuritySettings } from '@/types/settings';

export interface SecurityIssue {
    fileId: string;
    fileName: string;
    path: string;
    type: 'filename' | 'content';
    match: string;
    line?: number;
}

const MAX_LINE_LENGTH = 500;
const MAX_ISSUES_PER_FILE = 5;
const MIN_ENTROPY_LENGTH = 16;
const MAX_WHITESPACE_RATIO = 0.5;

export const calculateShannonEntropy = (str: string): number => {
    if (!str) return 0;

    const frequencies = new Map<string, number>();
    for (const char of str) {
        frequencies.set(char, (frequencies.get(char) ?? 0) + 1);
    }

    return Array.from(frequencies.values()).reduce((sum, count) => {
        const p = count / str.length;
        return sum - p * Math.log2(p);
    }, 0);
};

const isLikelyDataImage = (line: string): boolean =>
    line.trimStart().startsWith('data:image');

const isWhitespaceHeavy = (line: string): boolean => {
    if (!line) return false;
    const whitespaceCount = (line.match(/\s/g) ?? []).length;
    return whitespaceCount / line.length > MAX_WHITESPACE_RATIO;
};

export const COMMON_SECRET_PATTERNS = [
    { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g },
    { name: 'AWS Secret Key', pattern: /[0-9a-zA-Z/+]{40}/g }, // Be careful with this one, might be too broad? Limited by context usually.
    // Better AWS Secret: 
    { name: 'AWS Secret Key (Context)', pattern: /(?:aws_secret_access_key|aws_session_token|secret_key|secret)[ \t]*[:=][ \t]*["']?([0-9a-zA-Z/+]{40})["']?/gi },

    { name: 'Google API Key', pattern: /AIza[0-9A-Za-z\\-_]{35}/g },
    { name: 'Stripe Publishable Key', pattern: /pk_(?:test|live)_[0-9a-zA-Z]{24}/g },
    { name: 'Stripe Secret Key', pattern: /sk_(?:test|live)_[0-9a-zA-Z]{24}/g },
    { name: 'OpenAI API Key', pattern: /sk-[a-zA-Z0-9]{48}/g },
    { name: 'GitHub Token', pattern: /(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36}/g },
    { name: 'RSA Private Key', pattern: /-----BEGIN RSA PRIVATE KEY-----/g },
    { name: 'SSH Private Key', pattern: /-----BEGIN OPENSSH PRIVATE KEY-----/g },
    { name: 'Generic Private Key', pattern: /-----BEGIN PRIVATE KEY-----/g },
    { name: 'Facebook Access Token', pattern: /EAACEdEose0cBA[0-9A-Za-z]+/g },
    { name: 'Slack Token', pattern: /xox[baprs]-([0-9a-zA-Z]{10,48})/g },
];

export const scanForSecrets = (files: FileData[], settings: SecuritySettings): SecurityIssue[] => {
    if (!settings.enablePreFlightCheck) return [];

    const issues: SecurityIssue[] = [];

    // Compile regex patterns
    const filenameRegexes = settings.blockedFilePatterns.map(p =>
        new RegExp('^' + p.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$', 'i')
    );

    const contentRegexes = settings.blockedContentPatterns.map(p => new RegExp(p, 'g'));

    // Common patterns
    const commonPatterns = settings.enableCommonSecretsScanning
        ? COMMON_SECRET_PATTERNS
        : [];

    const entropyEnabled = settings.enableEntropyScanning;
    const entropyThreshold = settings.entropyThreshold ?? 4.5;

    for (const file of files) {
        let issuesForFile = 0;

        // 1. Check Filename
        for (const regex of filenameRegexes) {
            regex.lastIndex = 0;
            if (regex.test(file.name)) {
                issues.push({
                    fileId: file.id,
                    fileName: file.name,
                    path: file.path,
                    type: 'filename',
                    match: file.name,
                });
                issuesForFile++;
                break; // Stop checking other filename patterns for this file
            }
        }

        if (!file.isText || !file.content) continue;

        // 2. Check Content (only for text files)
        const lines = file.content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (issuesForFile >= MAX_ISSUES_PER_FILE) break;

            const line = lines[i];
            // Skip if line is too long (performance)
            if (line.length > MAX_LINE_LENGTH) continue;

            // Custom patterns
            for (const regex of contentRegexes) {
                regex.lastIndex = 0;
                if (regex.test(line)) {
                    issues.push({
                        fileId: file.id,
                        fileName: file.name,
                        path: file.path,
                        type: 'content',
                        match: regex.source,
                        line: i + 1,
                    });
                    issuesForFile++;
                    break;
                }
            }

            // Common patterns
            if (settings.enableCommonSecretsScanning) {
                for (const { name, pattern } of commonPatterns) {
                    pattern.lastIndex = 0;
                    if (pattern.test(line)) {
                        issues.push({
                            fileId: file.id,
                            fileName: file.name,
                            path: file.path,
                            type: 'content',
                            match: `${name} detected`, // Don't show the secret itself in the match description for common patterns
                            line: i + 1,
                        });
                        issuesForFile++;
                        break;
                    }
                }
            }

            if (issuesForFile >= MAX_ISSUES_PER_FILE || !entropyEnabled) {
                continue;
            }


            // Entropy-based scanning for secrets that don't match regexes
            if (isLikelyDataImage(line) || isWhitespaceHeavy(line)) {
                continue;
            }

            const tokens = line.split(/\s+/).filter(Boolean);
            for (const token of tokens) {
                if (token.length <= MIN_ENTROPY_LENGTH) continue;

                const entropy = calculateShannonEntropy(token);
                if (entropy >= entropyThreshold) {
                    const match = token.length > 64 ? `${token.slice(0, 64)}...` : token;
                    issues.push({
                        fileId: file.id,
                        fileName: file.name,
                        path: file.path,
                        type: 'content',
                        match: `Potential high-entropy secret: ${match}`,
                        line: i + 1,
                    });
                    issuesForFile++;
                    break;
                }
            }
        }
    }

    return issues;
};

export const redactSecrets = (content: string, settings: SecuritySettings): string => {
    if (!content) return content;
    let redacted = content;

    const commonPatterns = settings.enableCommonSecretsScanning
        ? COMMON_SECRET_PATTERNS
        : [];

    // Redact Common Patterns
    for (const { pattern } of commonPatterns) {
        // Reset lastIndex because we are doing global replace or multiple tests
        // Actually for replace(regex, string), global flag matters.
        // Our patterns have /g flag.
        redacted = redacted.replace(pattern, 'REDACTED_SECRET');
    }

    // Redact Custom Patterns
    const contentRegexes = settings.blockedContentPatterns.map(p => new RegExp(p, 'g'));
    for (const regex of contentRegexes) {
        redacted = redacted.replace(regex, 'REDACTED_CUSTOM_PATTERN');
    }

    return redacted;
};
