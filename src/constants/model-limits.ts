
export interface ModelLimit {
    id: string;
    name: string;
    limit: number;
    provider: 'OpenAI' | 'Anthropic' | 'Google';
    color: string;
}

export const MODEL_LIMITS: ModelLimit[] = [
    // OpenAI
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', limit: 16385, provider: 'OpenAI', color: '#10a37f' },
    { id: 'gpt-4o', name: 'GPT-4o', limit: 128000, provider: 'OpenAI', color: '#000000' },
    { id: 'gpt-5.2', name: 'GPT-5.2', limit: 400000, provider: 'OpenAI', color: '#74AA9C' },

    // Anthropic
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', limit: 200000, provider: 'Anthropic', color: '#d97757' },
    { id: 'claude-4.5-opus', name: 'Claude 4.5 Opus', limit: 200000, provider: 'Anthropic', color: '#d97757' },

    // Google
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', limit: 2000000, provider: 'Google', color: '#4285F4' },
    { id: 'gemini-3-pro', name: 'Gemini 3 Pro', limit: 2000000, provider: 'Google', color: '#4285F4' },
];

export const PROVIDERS = ['OpenAI', 'Anthropic', 'Google'] as const;
