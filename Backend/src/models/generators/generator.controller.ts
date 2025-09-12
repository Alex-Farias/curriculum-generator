import { Body, Controller, HttpCode, HttpStatus, Post, Res, StreamableFile, UsePipes, ValidationPipe } from "@nestjs/common";
import { GeneratorService } from "./generator.service";
import { GeneratorDTO } from "./generator.dto";
import type { Response } from "express";

@Controller('generator')
export class GeneratorController{
    constructor(
        private readonly service: GeneratorService
    ){}

    @Post('curriculum')
    @HttpCode(HttpStatus.CREATED)
    async generate(
        @Body(new ValidationPipe({ transform: true })) dto: GeneratorDTO,
        @Res({ passthrough: true }) res: Response,
    ): Promise<StreamableFile>{
        const fileBuffer = await this.service.generate(dto);

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': 'attachment; filename="curriculum.docx"',
        });
        
        return new StreamableFile(fileBuffer);
    }
}