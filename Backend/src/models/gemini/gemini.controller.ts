import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiDTO } from './gemini.dto';

@Controller('geminiApi')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateText(@Body(new ValidationPipe({ transform: true })) dto: GeminiDTO) {
    const generatedText = await this.geminiService.generateCurriculum(dto);
    
    return {
      success: true,
      response: generatedText,
    };
  }
}