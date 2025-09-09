import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { GeneratorService } from "./generator.service";
import { GeneratorDTO } from "./generator.dto";

@Controller('generator')
export class GeneratorController{
    constructor(
        private readonly service: GeneratorService
    ){}

    @Post('curriculum')
    @HttpCode(HttpStatus.OK)
    async generate(@Body(new ValidationPipe({ transform: true })) dto: GeneratorDTO): Promise<GeneratorDTO>{
        return this.service.generate(dto);
    }
}