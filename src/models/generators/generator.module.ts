import { Module } from "@nestjs/common";

import { GeneratorController } from "./generator.controller";
import { GeneratorService } from "./generator.service";
import { GeminiController } from "../gemini/gemini.controller";

@Module({
    imports: [GeminiController],
    providers: [GeneratorService],
    controllers: [GeneratorController],
    exports: [GeneratorService],
})
export class GeneratorModule{}