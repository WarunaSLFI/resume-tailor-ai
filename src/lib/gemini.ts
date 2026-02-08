import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateTailoredContent(resumeText: string, jobDescription: string) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const contactInfo = `
Kind regards,
Waruna Bandara Rathnamalala
Tampere, Finland
Email: warunaslfi@gmail.com
LinkedIn: https://www.linkedin.com/in/waruna-bandara
GitHub: https://github.com/WarunaSLFI
Portfolio: https://warunaslfi.com
`;

  const additionalResumeSections = `
PLATFORMS & CMS EXPERIENCE
- Experience building and customizing websites using WordPress
- Experience working with Wix platform for responsive website creation
- Familiar with theme customization, content management, and basic SEO practices

DEVELOPER WORKFLOW & TOOLING
- AI-assisted development tools used for ideation, debugging, and UI prototyping
- Strong emphasis on manual implementation, clean code, and understanding fundamentals
- Experience iterating designs and code based on feedback and continuous improvement

ADDITIONAL INFORMATION
- Actively seeking internship and junior developer opportunities
- Strong interest in modern front-end development, UI/UX, and full-stack foundations
- Comfortable working in English-based technical environments and international teams
- Actively building portfolio projects and contributing to GitHub
`;

  const prompt = `
    You are an expert career coach and ATS optimization specialist.
    I will provide you with a resume and a job description.
    
    Current Date: ${today}

    Tasks:
    1. Extract the "Job Title" and "Company Name" from the provided job description.
    2. Rewrite the resume to align perfectly with the job description to achieve a 100% ATS Match Score.
       - **CRITICAL: KEYWORD DENSITY**: Scan the Job Description for ALL hard skills, tools, and technologies. Ensure these EXACT keywords appear in the "Technical Skills" or "Professional Experience" sections of the resume.
       - **ATS Formatting**: Use simple, standard structure. No columns, no graphics, no creative headers. Use standard headings like "Professional Experience", "Technical Skills", "Education".
       - **Impact-Driven Bullets**: Rewrite bullet points to focus on results and impact. Use action verbs (e.g., "Developed", "Optimized", "Led").
       - **Finland/EU Standard**: Keep the layout clean and professional, suitable for European AI screening systems.
       - **Mandatory Sections**: You MUST append the following three sections EXACTLY as provided to the end of the rewritten resume:
       ${additionalResumeSections}
    3. Write a professional, compelling cover letter for this specific job description.
       - **Hook**: Start with a strong opening that explicitly states the role and why you are the perfect fit based on the JD.
       - **Body**: Use the "STAR" method (Situation, Task, Action, Result) to describe relevant experience.
       - **Keywords**: Mirror the language and tone of the Job Description.
       - Use the current date: ${today}.
       - Address the hiring manager or company professionally.
       - The sign-off MUST be exactly as follows:
       ${contactInfo}

    Please provide the output in the following JSON format:
    {
      "files": {
        "jobTitle": "Extracted Job Title",
        "companyName": "Extracted Company Name"
      },
      "rewrittenResume": "The full text of the rewritten resume",
      "coverLetter": "The full text of the cover letter"
    }

    Resume:
    ${resumeText}

    Job Description:
    ${jobDescription}
  `;

  try {
    console.log("Calling Gemini API with model: gemini-2.5-flash");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Gemini API response received.");

    // Log raw response to file for debugging
    try {
      fs.writeFileSync(path.join(process.cwd(), 'debug_gemini_response.txt'), text);
    } catch (filesysError) {
      console.error("Failed to write debug log:", filesysError);
    }

    // Robust JSON extraction
    let data: any = {};
    const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
    let match;
    let foundBlocks = false;

    // Loop to find all JSON blocks
    while ((match = codeBlockRegex.exec(text)) !== null) {
      foundBlocks = true;
      try {
        const blockObj = JSON.parse(match[1]);
        data = { ...data, ...blockObj };
      } catch (e) {
        console.error("Failed to parse a JSON block", e);
      }
    }

    // Fallback if no code blocks found or data is still empty
    if (!foundBlocks || Object.keys(data).length === 0) {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const cleanedText = text.substring(jsonStart, jsonEnd);
        try {
          data = JSON.parse(cleanedText);
        } catch (e) {
          console.error("Failed fallback JSON parse", e);
        }
      }
    }

    if (Object.keys(data).length === 0) {
      throw new Error("No valid JSON found in response");
    }

    // Helper to strip markdown formatting characters (specifically * and **)
    const cleanMarkdown = (str: string) => {
      if (!str) return "";
      return str
        .replace(/\*\*/g, "")  // Remove bolding **
        .replace(/\*/g, "")    // Remove italics/bullets *
        .replace(/###/g, "")   // Remove headings ###
        .replace(/##/g, "")    // Remove headings ##
        .replace(/#/g, "");     // Remove headings #
    };

    if (data.rewrittenResume) {
      data.rewrittenResume = cleanMarkdown(data.rewrittenResume);
    }
    if (data.coverLetter) {
      data.coverLetter = cleanMarkdown(data.coverLetter);
    }

    return data;
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    if (error.status) console.error("Error Status:", error.status);
    if (error.statusText) console.error("Error Status Text:", error.statusText);
    throw new Error(`Failed to generate content using AI: ${error.message || 'Unknown error'}`);
  }
}
