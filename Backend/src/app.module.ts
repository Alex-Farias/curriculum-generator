import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GeneratorModule } from './models/generators/generator.module';
import { GeminiModule } from './models/gemini/gemini.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GeminiModule,
    GeneratorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
