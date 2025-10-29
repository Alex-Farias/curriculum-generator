import { Injectable } from "@nestjs/common";
import { GeneratorDTO } from "./generator.dto";
import { GeminiService } from "../gemini/gemini.service";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ExternalHyperlink } from "docx";
import { parseStringPromise } from "xml2js";
import JSZip from 'jszip';

@Injectable()
export class GeneratorService{
    constructor(private readonly geminiService: GeminiService){}

    async generate(dto: GeneratorDTO): Promise<Buffer>{
    // Support for geminiService returning either a string (xml) or an object { xml, prompt }
        // Build a minimal DTO for Gemini so empTitle is not present in logs/payloads.
        const geminiPayload = {
            getLanguage: () => dto.getLanguage(),
            getPrompt: () => dto.getPrompt(),
        } as unknown as any;

        const generated: any = await this.geminiService.generateCurriculum(geminiPayload);
        let generatedXml = '';
        let promptText = '';

        if (typeof generated === 'string') {
            generatedXml = generated;
        } else if (generated && typeof generated === 'object') {
            // try common property names
            generatedXml = generated.xml ?? generated.generatedXml ?? generated.text ?? '';
            promptText = generated.prompt ?? generated.meta?.prompt ?? '';
        }

        // Clean up the XML string from Gemini in case it includes markdown fences
        const cleanedXml = (generatedXml || '').replace(/```xml\n?|```/g, '').trim();

        const parsedData = await parseStringPromise(cleanedXml, { explicitArray: false, trim: true });
        const resume = parsedData.resume;
        const header = resume.header;

        // Helper to find contact info
        const getContact = (type: string) => {
            if (!header.contacts || !header.contacts.contact) return '';
            const contacts = Array.isArray(header.contacts.contact) ? header.contacts.contact : [header.contacts.contact];
            const contact = contacts.find((c: { $: { type: string }; _: string }) => c.$.type === type);
            return contact ? contact._ : '';
        };

        const email = getContact('email');
        const linkedin = getContact('linkedin');
        const github = getContact('github');

        const contactChildren = [];
        if (email) {
            contactChildren.push(
                new ExternalHyperlink({
                    children: [
                        new TextRun({
                            text: "Email",
                            style: "Hyperlink",
                        }),
                    ],
                    link: `mailto:${email}`,
                }),
            );
        }
        if (linkedin) {
            if (contactChildren.length > 0) contactChildren.push(new TextRun(" | "));
            contactChildren.push(
                new ExternalHyperlink({
                    children: [new TextRun({ text: "LinkedIn", style: "Hyperlink" })],
                    link: linkedin,
                }),
            );
        }
        if (github) {
            if (contactChildren.length > 0) contactChildren.push(new TextRun(" | "));
            contactChildren.push(
                new ExternalHyperlink({
                    children: [new TextRun({ text: "GitHub", style: "Hyperlink" })],
                    link: github,
                }),
            );
        }

        const children = [
            new Paragraph({
                children: [new TextRun({ text: header.name, bold: true, size: 48, font: "Calibri", color: "000000" })],
                alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
                children: [new TextRun({ text: header.title, size: 22, font: "Calibri", color: "000000" })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
            }),
            new Paragraph({
                children: contactChildren.map(c => {
                    if (c instanceof TextRun) {
                        return new TextRun({ text: " | ", font: "Calibri", size: 22 });
                    }
                    if (c instanceof ExternalHyperlink) {
                        // Re-create the TextRun with styling, using the known text from the hyperlink's child.
                        // We can determine the text based on the link type.
                        let originalText = "Link";
                        if (c.options.link.startsWith("mailto:")) {
                            originalText = "Email";
                        } else if (c.options.link.includes("linkedin.com")) {
                            originalText = "LinkedIn";
                        } else if (c.options.link.includes("github.com")) {
                            originalText = "GitHub";
                        }
                        return new ExternalHyperlink({ children: [new TextRun({ text: originalText, style: "Hyperlink", font: "Calibri", size: 22 })], link: c.options.link });
                    }
                    return c; // Should not happen with current logic
                }),
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
            }),
        ];

        const sections = Array.isArray(resume.section) ? resume.section : [resume.section];

        for (const secao of sections) {
            children.push(new Paragraph({
                children: [new TextRun({ text: secao.$.title, bold: true, size: 24, font: "Calibri", color: "000000" })],
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
                border: { bottom: { color: "auto", space: 1, style: "single", size: 6 } },
            }));

            const jobs = secao.job ? (Array.isArray(secao.job) ? secao.job : [secao.job]) : [];
            for (const job of jobs) {
                children.push(new Paragraph({
                    children: [
                        new TextRun({ text: job.company, bold: true, font: "Calibri", size: 22 }),
                        new TextRun({ text: " | ", font: "Calibri", size: 22 }),
                        new TextRun({ text: job.role, italics: true, font: "Calibri", size: 22 }),
                        new TextRun({ text: " | ", font: "Calibri", size: 22 }),
                        new TextRun({ text: job.period, font: "Calibri", size: 22 }),
                    ],
                    spacing: { before: 200 }
                }));
                const responsibilities = job.responsibilities.item ? (Array.isArray(job.responsibilities.item) ? job.responsibilities.item : [job.responsibilities.item]) : [];
                for (const resp of responsibilities) {
                    children.push(new Paragraph({ text: resp, bullet: { level: 0 }, indent: { left: 720 }, style: "ListParagraph" }));
                }
            }

            const educations = secao.education ? (Array.isArray(secao.education) ? secao.education : [secao.education]) : [];
            for (const edu of educations) {
                children.push(new Paragraph({
                    children: [
                        new TextRun({ text: edu.institution, bold: true, font: "Calibri", size: 22 }),
                        new TextRun({ text: " | ", font: "Calibri", size: 22 }),
                        new TextRun({ text: edu.degree, italics: true, font: "Calibri", size: 22 }),
                        new TextRun({ text: " | ", font: "Calibri", size: 22 }),
                        new TextRun({ text: edu.period, font: "Calibri", size: 22 }),
                    ],
                    spacing: { before: 200 }
                }));
                children.push(new Paragraph({ text: edu.description, bullet: { level: 0 }, indent: { left: 720 }, style: "ListParagraph" }));
            }

            const courses = secao.course ? (Array.isArray(secao.course) ? secao.course : [secao.course]) : [];
            for (const course of courses) {
                children.push(new Paragraph({
                    children: [
                        new TextRun({ text: course.name, bold: true, font: "Calibri", size: 22 }),
                        new TextRun({ text: " | ", font: "Calibri", size: 22 }),
                        new TextRun({ text: course.institution, italics: true, font: "Calibri", size: 22 }),
                        new TextRun({ text: " | ", font: "Calibri", size: 22 }),
                        new TextRun({ text: course.period, font: "Calibri", size: 22 }),
                    ],
                    spacing: { before: 200 }
                }));
                children.push(new Paragraph({ text: course.description, bullet: { level: 0 }, indent: { left: 720 }, style: "ListParagraph" }));
            }

            // Legacy item support
            const legacyItems = secao.item ? (Array.isArray(secao.item) ? secao.item : [secao.item]) : [];
            for (const item of legacyItems) {
                if (typeof item === 'string') {
                    children.push(new Paragraph({ text: item, bullet: { level: 0 }, indent: { left: 720 }, style: "ListParagraph" }));
                } else if (item.titulo) {
                    children.push(new Paragraph({
                        children: [new TextRun({ text: item.titulo, bold: true, font: "Calibri", size: 22 })],
                        spacing: { before: 200 }
                    }));
                    if (item.subtitulo) {
                        children.push(new Paragraph({
                            children: [new TextRun({ text: item.subtitulo, italics: true, font: "Calibri", size: 22 })]
                        }));
                    }
                    if (item.periodo) {
                        children.push(new Paragraph({
                            children: [new TextRun({ text: item.periodo, font: "Calibri", size: 22 })]
                        }));
                    }
                    children.push(new Paragraph({ text: item.descricao, bullet: { level: 0 }, indent: { left: 720 }, style: "ListParagraph" }));
                }
            }
        }

        const doc = new Document({ sections: [{ children }] });

        const docBuffer = await Packer.toBuffer(doc);

        const zip = new JSZip();
        zip.file('curriculum.docx', docBuffer);
        zip.file('prompt.txt', promptText || '');

        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        return zipBuffer;
    }
}