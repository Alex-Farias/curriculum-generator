import { GeminiInterface } from "./gemini.interface";

export class GeminiDTO implements GeminiInterface{
    prompt: string;

    constructor(
        prompt: string
    ){
        this.prompt = prompt;
    }

    getPrompt():string{return this.prompt};
}