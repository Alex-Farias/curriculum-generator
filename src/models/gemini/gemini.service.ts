import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private generativeModel: GenerativeModel;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')!;
    const genAI = new GoogleGenerativeAI(apiKey);
    const config = {
      responseModalities: [
          'IMAGE',
          'TEXT',
      ],
    };
    const model = 'gemini-2.5-flash-image-preview';
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `INSERT_INPUT_HERE`,
          },
        ],
      },
    ];
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });
    let fileIndex = 0;

    // Para chat, use 'gemini-pro'. Para texto apenas, 'gemini-1.5-flash' ou outro modelo de sua escolha.
    this.generativeModel = genAI.getGenerativeModel({ model: model });
  }

  async generateCurriculum(prompt: string): Promise<string> {
    let fileIndex = 0;
    for await (const chunk of response) {
      if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
        continue;
      }
      if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        const fileName = `ENTER_FILE_NAME_${fileIndex++}`;
        const inlineData = chunk.candidates[0].content.parts[0].inlineData;
        const fileExtension = mime.getExtension(inlineData.mimeType || '');
        const buffer = Buffer.from(inlineData.data || '', 'base64');
        saveBinaryFile(`${fileName}.${fileExtension}`, buffer);
      }
      else {
        console.log(chunk.text);
      }
    }


    try {
      this.logger.log(`Enviando prompt para o Gemini: "${prompt}"`);
      const result = await this.generativeModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      this.logger.log('Resposta recebida do Gemini.');
      return text;
    } catch (error) {
      this.logger.error('Erro ao chamar a API do Gemini', error.stack);
      throw new InternalServerErrorException('Falha ao gerar conteúdo do Gemini.');
    }
  }

  function saveBinaryFile(fileName: string, content: Buffer) {
    writeFile(fileName, content, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing file ${fileName}:`, err);
        return;
      }
      console.log(`File ${fileName} saved to file system.`);
    });
  }
}




async function main() {
  
  const config = {
    responseModalities: [
        'IMAGE',
        'TEXT',
    ],
  };
  const model = 'gemini-2.5-flash-image-preview';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `INSERT_INPUT_HERE`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  let fileIndex = 0;
  for await (const chunk of response) {
    if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
      continue;
    }
    if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const fileName = `ENTER_FILE_NAME_${fileIndex++}`;
      const inlineData = chunk.candidates[0].content.parts[0].inlineData;
      const fileExtension = mime.getExtension(inlineData.mimeType || '');
      const buffer = Buffer.from(inlineData.data || '', 'base64');
      saveBinaryFile(`${fileName}.${fileExtension}`, buffer);
    }
    else {
      console.log(chunk.text);
    }
  }
}

main();
