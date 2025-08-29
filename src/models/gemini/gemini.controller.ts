import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiDTO } from './gemini.dto';

@Controller('geminiApi')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateText(@Body() generateTextDto: GeminiDTO) {
    const { prompt } = generateTextDto;
    const generatedText = await this.geminiService.generateCurriculum(prompt);
    
    return {
      success: true,
      response: generatedText,
    };
  }
}