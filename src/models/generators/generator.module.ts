import { Module } from "@nestjs/common";

import { GeneratorController } from "./generator.controller";
import { GeneratorService } from "./generator.service";
import { GeminiModule } from "../gemini/gemini.module";

@Module({
    imports: [GeminiModule],
    providers: [GeneratorService],
    controllers: [GeneratorController],
    exports: [GeneratorService],
})
export class GeneratorModule{}