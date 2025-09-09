import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private generativeModel: GenerativeModel;

  constructor(private readonly configService: ConfigService) { // The constructor should be synchronous.
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in the environment variables: ' + apiKey);
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    // For chat, use 'gemini-pro'. For text only, 'gemini-1.5-flash' or another model of your choice.
    // The 'gemini-pro' model is suitable for text-only prompts.
    this.generativeModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
  }

  private async getPromptTemplate(): Promise<string> {
    // This path will resolve correctly whether running from /src (ts-node) or /dist (node)
    const isDist = __dirname.includes(path.sep + 'dist' + path.sep);
    const basePath = isDist ? path.join(__dirname, '..', '..', '..') : path.join(__dirname, '..', '..');
    const templatePath = path.join(basePath, 'src', 'models', 'generators', 'curriculum.prompt.template');
    return fs.readFile(templatePath, 'utf-8');
  }

  async generateCurriculum(prompt: string): Promise<string> {
    this.logger.log(`Generating curriculum for prompt: ${prompt}`);
    const template = await this.getPromptTemplate();
    const fullPrompt = template.replace('{{prompt}}', prompt);
    this.logger.log(`Full prompt constructed: ${fullPrompt}`);

    try {
      this.logger.log(`Sending prompt for curriculum generation...`);
      const result = await this.generativeModel.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();
      this.logger.log('Response received from Gemini.');
      return text;
    } catch (error) {
      this.logger.error('Error calling Gemini API', error.stack);
      throw new InternalServerErrorException('Failed to generate content from Gemini.');
    }
  }
}
