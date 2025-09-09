import { Injectable } from "@nestjs/common";
import { GeneratorDTO } from "./generator.dto";
import { GeminiService } from "../gemini/gemini.service";

@Injectable()
export class GeneratorService{
    constructor(private readonly geminiService: GeminiService){}

    async generate(dto: GeneratorDTO): Promise<GeneratorDTO>{
        const generatedContent = await this.geminiService.generateCurriculum(dto.getPrompt());
        return new GeneratorDTO(generatedContent);
    }
}