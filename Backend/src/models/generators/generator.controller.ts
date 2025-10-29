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

        // Determine filename from dto.empTitle (safe fallback)
        const rawName = dto.empTitle || 'curriculum';
        // sanitize filename: remove path separators and control chars
        const safeName = rawName.replace(/[^a-zA-Z0-9-_\. ]/g, '_').trim() || 'curriculum';
        const filename = `${safeName}.zip`;

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${filename}"`,
        });

        return new StreamableFile(fileBuffer);
    }
}