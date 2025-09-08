import { Injectable } from "@nestjs/common";
import { GeneratorDTO } from "./generator.dto";
import { GeminiService } from "../gemini/gemini.service";

@Injectable()
export class GeneratorService{
    constructor(private readonly geminiService: GeminiService){}

    async generate(dto: GeneratorDTO): Promise<GeneratorDTO>{
        const generatedXml = await this.geminiService.generateCurriculum(dto.content);
        
        return new GeneratorDTO(generatedXml);
    }
}