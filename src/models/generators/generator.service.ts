import { Injectable } from "@nestjs/common";
import { GeneratorDTO } from "./generator.dto";
import { GeminiService } from "../gemini/gemini.service";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { parseStringPromise } from "xml2js";

@Injectable()
export class GeneratorService{
    constructor(private readonly geminiService: GeminiService){}

    async generate(dto: GeneratorDTO): Promise<Buffer>{
        const generatedXml = await this.geminiService.generateCurriculum(dto.getPrompt());
        
        // Clean up the XML string from Gemini in case it includes markdown fences
        const cleanedXml = generatedXml.replace(/```xml\n?|```/g, '').trim();

        const parsedData = await parseStringPromise(cleanedXml, { explicitArray: false, trim: true });
        const curriculum = parsedData.curriculo;

        const children = [
            new Paragraph({
                children: [new TextRun({ text: curriculum.cabecalho.nome, bold: true, size: 48 })],
                alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
                children: [new TextRun({ text: curriculum.cabecalho.titulo, size: 28 })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
            }),
            new Paragraph({
                text: `Email: ${curriculum.cabecalho.contatos.email} | LinkedIn: ${curriculum.cabecalho.contatos.linkedin} | GitHub: ${curriculum.cabecalho.contatos.github}`,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
            }),
        ];

        // Ensure sections are an array even if there's only one
        const sections = Array.isArray(curriculum.secao) ? curriculum.secao : [curriculum.secao];

        for (const secao of sections) {
            children.push(new Paragraph({
                text: secao.$.titulo,
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
                border: { bottom: { color: "auto", space: 1, style: "single", size: 6 } },
            }));

            const items = secao.item ? (Array.isArray(secao.item) ? secao.item : [secao.item]) : [];
            for (const item of items) {
                children.push(new Paragraph({ text: item, bullet: { level: 0 }, indent: { left: 720 } }));
            }
        }

        const doc = new Document({ sections: [{ children }] });

        return Packer.toBuffer(doc);
    }
}