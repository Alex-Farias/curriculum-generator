import { GeneratorInterface } from "./generator.interface";

export class GeneratorDTO implements GeneratorInterface{
    content: string;
    
    constructor(content: string){
        this.content = content;
    }

    public getContent():string{return this.content}
}