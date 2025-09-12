export interface GeminiInterface{
    language?: string;
    enterprise: string;
    candidate: string;
    getPrompt(): string;
    getLanguage(): string;
}