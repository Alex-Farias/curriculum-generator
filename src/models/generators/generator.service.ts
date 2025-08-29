import { Injectable } from "@nestjs/common";
import { GeneratorDTO } from "./generator.dto";

@Injectable()
export class GeneratorService{
    async generate(dto: GeneratorDTO){
        //acessar api gemini
        return dto;
    }
}