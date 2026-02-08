import { NextRequest, NextResponse } from "next/server";
import { parsePDF, parseDOCX } from "@/lib/parser";
import { generateTailoredContent } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const jobDescription = formData.get("jobDescription") as string;

        if (!file || !jobDescription) {
            return NextResponse.json(
                { error: "Missing file or job description" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let resumeText = "";

        if (file.name.endsWith(".pdf")) {
            resumeText = await parsePDF(buffer);
        } else if (file.name.endsWith(".docx")) {
            resumeText = await parseDOCX(buffer);
        } else {
            return NextResponse.json(
                { error: "Unsupported file format. Please upload PDF or DOCX." },
                { status: 400 }
            );
        }

        const tailoredContent = await generateTailoredContent(resumeText, jobDescription);

        return NextResponse.json(tailoredContent);
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || "An unexpected error occurred." },
            { status: 500 }
        );
    }
}
