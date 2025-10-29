import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiDTO } from './gemini.dto';

@Controller('geminiApi')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateText(@Body(new ValidationPipe({ transform: true })) dto: GeminiDTO) {
    const generated = await this.geminiService.generateCurriculum(dto);

    // If service returned an object with xml and prompt, return the xml for compatibility
    const responseText = typeof generated === 'string' ? generated : (generated && (generated as any).xml) || '';

    return {
      success: true,
      response: responseText,
    };
  }
}