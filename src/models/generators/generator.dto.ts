import { IsNotEmpty, IsString } from "class-validator";

export class GeneratorDTO {
    @IsString()
    @IsNotEmpty()
    readonly content: string;
    
    constructor(content: string){
        this.content = content;
    }

    public getPrompt(): string{return this.content;}
}