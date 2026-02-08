import { Document, Packer, Paragraph, TextRun } from "docx";

export async function generateDocx(content: string, title: string) {
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: content.split('\n').map(line => {
                    return new Paragraph({
                        children: [
                            new TextRun({
                                text: line,
                                font: "Calibri",
                                size: 24,
                            }),
                        ],
                    });
                }),
            },
        ],
    });

    // Packer.toBuffer works in both environments. 
    // We cast to any to avoid type mismatches between Node Buffer and Browser BlobPart in some environments.
    return (await Packer.toBuffer(doc)) as any;
}
