import { IsString } from "class-validator";

export interface GeneratorInterface{
    language?: string;
    enterprise: string;
    candidate: string;
    getPrompt(): string;
    getLanguage(): string;
}