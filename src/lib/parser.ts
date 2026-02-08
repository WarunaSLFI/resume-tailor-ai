import mammoth from 'mammoth';

export async function parsePDF(buffer: Buffer): Promise<string> {
    try {
        console.log('Parsing PDF, buffer size:', buffer.length, 'isBuffer:', Buffer.isBuffer(buffer));
        const pdf = require('pdf-parse/lib/pdf-parse.js');
        const data = await pdf(buffer);
        return data.text;
    } catch (error: any) {
        console.error('Error parsing PDF:', error);
        if (error.stack) console.error(error.stack);
        throw new Error(`Failed to parse PDF file: ${error.message || 'Unknown error'}`);
    }
}

export async function parseDOCX(buffer: Buffer): Promise<string> {
    try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } catch (error) {
        console.error('Error parsing DOCX:', error);
        throw new Error('Failed to parse DOCX file.');
    }
}
