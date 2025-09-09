import { IsNotEmpty, IsString } from "class-validator";
import { GeminiInterface } from "./gemini.interface";

export class GeminiDTO implements GeminiInterface{
    @IsString()
    @IsNotEmpty()
    prompt: string;

    constructor(prompt: string){
        this.prompt = prompt;
    }

    getPrompt():string{return this.prompt};
}