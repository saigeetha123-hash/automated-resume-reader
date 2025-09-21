import { GoogleGenAI, Type, Part } from "@google/genai";
import type { AnalysisResult } from '../types';
import * as pdfjs from 'pdfjs-dist';

// Manually construct the URL to the worker script from the esm.sh CDN.
// This is necessary because bundler-specific syntax like `?url` doesn't work
// in this environment. The version should match the one in index.html importmap.
const pdfjsVersion = '4.4.168';
pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.js`;

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const atsAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: "An ATS compatibility score from 0 to 100. Start at 100 and deduct points for issues found."
    },
    issues: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of specific ATS compatibility issues found in the resume, such as use of images, columns, or missing standard headings."
    }
  },
  required: ["score", "issues"]
};

const learningResourcesSchema = {
  type: Type.OBJECT,
  properties: {
    skill: { 
      type: Type.STRING, 
      description: "The specific skill for which learning resources are being provided." 
    },
    links: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "An array of direct URLs to learning resources (e.g., Coursera, YouTube, official documentation)."
    }
  },
  required: ["skill", "links"]
};

const singleAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    relevanceScore: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 representing overall relevance.",
    },
    hardMatchPercentage: {
      type: Type.NUMBER,
      description: "A percentage (0-100) of direct keyword/skill matches.",
    },
    softMatchPercentage: {
      type: Type.NUMBER,
      description: "A percentage (0-100) of conceptual and experience alignment.",
    },
    verdict: {
      type: Type.STRING,
      enum: ["High", "Medium", "Low"],
      description: "The final verdict on the candidate's fit.",
    },
    matchingSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of key skills from the JD found in the resume.",
    },
    missingSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of critical skills from the JD missing from the resume.",
    },
    missingCertifications: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of relevant certifications from the JD missing from the resume.",
    },
    missingProjects: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of relevant project types or experiences from the JD missing from the resume.",
    },
    suggestedImprovements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Actionable suggestions for the candidate to improve their resume for this role.",
    },
    summary: {
      type: Type.STRING,
      description: "A concise, one or two-sentence summary of the candidate's fit."
    },
    atsAnalysis: atsAnalysisSchema,
    suggestedLearningResources: {
        type: Type.ARRAY,
        items: learningResourcesSchema,
        description: "A list of objects, each containing a missing skill and suggested learning resource links."
    }
  },
  required: [
    "relevanceScore", 
    "hardMatchPercentage", 
    "softMatchPercentage", 
    "verdict",
    "matchingSkills",
    "missingSkills",
    "missingCertifications",
    "missingProjects",
    "suggestedImprovements",
    "summary",
    "atsAnalysis",
    "suggestedLearningResources"
  ],
};

const batchAnalysisSchema = {
    type: Type.ARRAY,
    items: singleAnalysisSchema
};


const instructionPrompt = `
  You are an expert HR recruitment analyst and career coach with deep knowledge of Applicant Tracking Systems (ATS). Your task is to analyze the provided job description against a batch of multiple resumes. For each resume, perform a detailed analysis and return the results in a structured JSON array. Each object in the array must correspond to one resume.

  **Part 1: Relevance Analysis Instructions (for each resume):**
  1.  **Hard Match:** Identify and list keywords/skills (like 'Python', 'React', 'SQL', specific tools) present in both documents. Calculate a 'hardMatchPercentage' based on how many required skills are on the resume.
  2.  **Soft Match:** Analyze the conceptual similarity. Go beyond keywords. Evaluate if the candidate's experience, project descriptions, and roles align with the job's responsibilities and culture. Calculate a 'softMatchPercentage'.
  3.  **Relevance Score:** Calculate a final 'relevanceScore' from 0-100 using this weighted formula: (hardMatchPercentage * 0.55) + (softMatchPercentage * 0.45). This score should be a blend of both hard and soft matches.
  4.  **Verdict:** Based on the scores and any missing 'must-have' skills, classify the relevance as 'High', 'Medium', or 'Low'. A 'High' verdict requires strong alignment in both hard skills and relevant experience.
  5.  **Feedback:** 
      - List the key skills found on the resume that match the job description ('matchingSkills').
      - List critical skills from the job description that are missing from the resume ('missingSkills').
      - Also identify and list any specific certifications (e.g., 'PMP', 'AWS Certified Developer') or types of projects (e.g., 'experience with large-scale data migration projects') mentioned in the job description that are absent from the resume ('missingCertifications', 'missingProjects').
      - Provide a concise 'summary' of the candidate's fit.
      - Finally, offer specific, actionable 'suggestedImprovements' for the candidate to better tailor their resume to this job. Focus on highlighting relevant experience and adding missing keywords.

  **Part 2: ATS Compatibility Analysis Instructions (for each resume):**
  1.  **Analyze for ATS-unfriendly elements.** Scrutinize the resume text for common issues that hinder ATS parsing.
  2.  **Check for:**
      - **Images & Graphics:** Note if the text implies the presence of images, logos, or graphics that might contain important text. Since you only see text, infer this from context (e.g., placeholder text for an image).
      - **Complex Formatting:** Look for signs of columns, tables, or text boxes, which can confuse ATS parsers.
      - **Missing Standard Headings:** Verify the presence of standard headings like "Work Experience", "Education", and "Skills". The exact wording can vary, but the concepts must be present.
      - **Unusual Fonts/Symbols:** Note any non-standard characters or symbols.
  3.  **Calculate ATS Score:** Start with a score of 100. Deduct points for each issue found. For example, deduct 20 points for using columns, 15 for missing a key heading, etc.
  4.  **List Issues:** Create a clear, user-friendly list of all identified ATS compatibility issues.

  **Part 3: Personalized Feedback Engine Instructions (for each resume):**
  1.  **For each skill identified in the 'missingSkills' list, find 1-3 high-quality, publicly accessible online learning resources.**
  2.  **Prioritize links to official documentation, reputable educational platforms (like Coursera, edX, freeCodeCamp), or highly-rated YouTube tutorials.**
  3.  **Format this as a list of objects under 'suggestedLearningResources', where each object contains the 'skill' and a list of 'links'.**

  **Input & Output:**
  You will receive one Job Description, followed by multiple numbered resumes. Provide your complete analysis as a single JSON array. Each object in the array must conform to the provided schema and represent the analysis for one resume, in the same order they were provided.
`;


export const getInputAsText = async (input: string | File, label: string): Promise<string> => {
    if (typeof input === 'string') {
        return input;
    }

    if (input.type === 'application/pdf') {
        try {
            const arrayBuffer = await input.arrayBuffer();
            const loadingTask = pdfjs.getDocument(arrayBuffer);
            const pdf = await loadingTask.promise;
            
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => (item as any).str).join(' ');
                fullText += pageText + '\n';
            }
            return fullText;
        } catch (error) {
            console.error(`Failed to parse PDF file '${input.name}':`, error);
            throw new Error(`Failed to read content from PDF '${input.name}'. The file might be corrupted.`);
        }
    }

    if (input.type === 'text/plain') {
        return input.text();
    }
    
    throw new Error(`Unsupported file type for ${label} ('${input.name}'). Please upload a PDF or TXT file.`);
};

interface BatchAnalysisResult {
    analysis: AnalysisResult;
    fileName: string;
}

export const analyzeResume = async (
  jobDescription: string | File,
  resumes: File[]
): Promise<BatchAnalysisResult[]> => {
  try {
    const jdText = await getInputAsText(jobDescription, "Job Description");
    
    const resumeData = await Promise.all(resumes.map(async (file) => ({
        fileName: file.name,
        text: await getInputAsText(file, "Resume"),
    })));

    const parts: Part[] = [
      { text: instructionPrompt },
      { text: `**Job Description:**\n---\n${jdText}\n---` },
    ];

    resumeData.forEach((resume, index) => {
        parts.push({ text: `**Resume ${index + 1} (${resume.fileName}):**\n---\n${resume.text}\n---` });
    });


    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: parts,
      config: {
        responseMimeType: "application/json",
        responseSchema: batchAnalysisSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("The API returned an empty response.");
    }

    const parsedResults = JSON.parse(jsonText) as AnalysisResult[];
    if (parsedResults.length !== resumes.length) {
        throw new Error("The API returned a different number of results than resumes provided.");
    }
    
    return parsedResults.map((analysis, index) => ({
        analysis,
        fileName: resumeData[index].fileName,
    }));

  } catch (error) {
    console.error("Error during batch analysis:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unknown error occurred while communicating with the AI model.");
  }
};

export const rewriteResume = async (
  resumeText: string,
  jobDescriptionText: string
): Promise<string> => {
  try {
     const prompt = `
      You are an expert career coach and professional resume writer.
      Your task is to rewrite the provided resume to be better aligned with the provided job description.
      - Analyze the job description for key skills, responsibilities, and qualifications.
      - Restructure the resume's summary and experience sections to highlight the most relevant accomplishments.
      - Incorporate keywords from the job description naturally.
      - Do NOT invent new skills or experiences. Work only with the information given in the original resume.
      - Maintain a professional tone and format.
      - Output only the rewritten resume text, formatted nicely.
    `;

    const parts: Part[] = [
      { text: prompt },
      { text: `**Job Description:**\n---\n${jobDescriptionText}\n---` },
      { text: `**Original Resume:**\n---\n${resumeText}\n---` },
    ];
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: parts,
    });

    return response.text;
  } catch (error) {
     console.error("Error during resume rewrite:", error);
     if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unknown error occurred while rewriting the resume.");
  }
}