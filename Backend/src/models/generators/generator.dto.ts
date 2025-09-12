import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { GeneratorInterface } from "./generator.interface";

export class GeneratorDTO implements GeneratorInterface{
  @IsString()
  @IsOptional()
  readonly language?: string;

  @IsString()
  @IsNotEmpty()
  readonly enterprise: string;

  @IsString()
  @IsNotEmpty()
  readonly candidate: string;

  public getPrompt(): string {
    return `Empresa:{${this.enterprise}}\nCandidato:{${this.candidate}}`;
  }

  public getLanguage(): string {
    return this.language || 'pt-br';
  }
}