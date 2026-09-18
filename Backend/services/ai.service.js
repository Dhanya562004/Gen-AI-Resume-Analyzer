import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import puppeteer from "puppeteer";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const interviewReportZodSchema = z.object({
  matchScore: z.number().describe("A score between 0 and 100 indicating how well the caandidate's profile matches the job describe"),
  technicalQuestionSchema: z.array(z.object({
    question: z.string().describe("The technical question can be asked in the interview"),
    intention: z.string().describe("The intention of interviewer behind asking this question"),
    answer: z.string().describe("How to answer this question , what points to cover, what approach to take etc.")
  })).describe("Behaviora questions that can be asked in the interview along with their intention and how to answer them"),
  behaviourQuestionSchema: z.array(z.object({
    question: z.string().describe("The technical question can be asked in the interview"),
    intention: z.string().describe("The intention of interviewer behind asking this question"),
    answer: z.string().describe("How to answer this question , what points to cover, what approach to take etc.")
  })).describe("Behaviora questions that can be asked in the interview along with their intention and how to answer them"),
  skillGapsSchema: z.array(z.object({
    skill: z.string().describe("The skill which the candidate is lacking"),
    severity: z.enum(["low", "medium", "high"]).describe("The severity of skill gap i.e, low,high,middle ")
  })).describe("List of skill gaps in the candidate profile along with their severity"),
  preparationPlanSchema: z.array(z.object({
    day: z.number().describe("The day number in the preparation plan, starting from 1"),
    focus: z.string().describe("The main focus of this dat in the preparation plan"),
    tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan e.g read a specific book ")
  })).describe("A day-wise preparation plan for the candidate to follow in order ")
})
async function generateInterviewReport({ resumeText, selfDescription, jobDescription }) {

  const prompt = `Generate a detailed interview report for a candidate with the following details:

Resume: ${resumeText}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

You MUST return a JSON object with EXACTLY these fields and no other fields:
{
  "matchScore": (number between 0-100),
  "technicalQuestionSchema": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "behaviourQuestionSchema": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "skillGapsSchema": [
    {
      "skill": "string",
      "severity": "low" or "medium" or "high"
    }
  ],
  "preparationPlanSchema": [
    {
      "day": (number),
      "focus": "string",
      "tasks": ["string", "string"]
    }
  ]
}

Important rules:
1. The report must be strongly based on the Resume, Self Description, and Job Description.
2. The matchScore must realistically reflect how well the candidate fits the job.
3. The number and difficulty of questions MUST vary according to the matchScore.

Question count rules:
- If matchScore is 80 to 100:
  - technicalQuestionSchema must contain exactly 4 questions
  - behaviourQuestionSchema must contain exactly 3 questions
  - questions should be advanced and role-specific
  - skillGapsSchema must contain 2 to 3 items
  - preparationPlanSchema must contain exactly 5 days

- If matchScore is 50 to 79:
  - technicalQuestionSchema must contain exactly 6 questions
  - behaviourQuestionSchema must contain exactly 4 questions
  - questions should be mixed: foundational + intermediate + role-specific
  - skillGapsSchema must contain 3 to 5 items
  - preparationPlanSchema must contain exactly 7 days

- If matchScore is below 50:
  - technicalQuestionSchema must contain exactly 8 questions
  - behaviourQuestionSchema must contain exactly 5 questions
  - questions should focus more on fundamentals, practical understanding, and common interview basics
  - skillGapsSchema must contain 5 to 7 items
  - preparationPlanSchema must contain exactly 10 days

Additional rules:
4. technicalQuestionSchema questions must be highly relevant to the job description.
5. behaviourQuestionSchema questions must test communication, teamwork, ownership, problem-solving, conflict handling, and adaptability.
6. skillGapsSchema should identify genuine gaps between the candidate profile and the job requirements.
7. preparationPlanSchema should be practical, structured, and personalized to the candidate's weaknesses.
8. Do NOT return empty arrays.
9. Do NOT add markdown, explanation, or text outside JSON.
10. Return valid JSON only.

Return the response in JSON format matching this structure: 
${JSON.stringify(zodToJsonSchema(interviewReportZodSchema))} 
`;
  // isme zod to Schema fir read krne ke liye JSON.stringify karke prompt me dalenge taki model ko pata chale ki hume kasia data chahiye aur uske according hi response de . Aur response ko parse krke use krenge
  const response = await groq.chat.completions.create({ // ye grok ka sdk api call hain 
    model: "llama-3.3-70b-versatile", // grok ke server par hosted llama model 
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });
  const content = response.choices?.[0]?.message?.content;
  const data = typeof content === "string" ? JSON.parse(content) : content;
  if (!data || typeof data !== "object") {
    throw new Error("Invalid AI response format: expected JSON object")
  }
  console.log('AI interview report data:', data)
  return data

}
export async function generateResumePdf({ resumeText, selfDescription, jobDescription }) {
  const prompt = `Create an attractive, professional, and friendly resume in HTML format for the candidate. The resume should closely follow the provided sample layout: a clean two-column design with the main content in the left column and a right sidebar for skills, certifications, and quick highlights.

Based on:
Resume: ${resumeText}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Layout and styling requirements:
1. Use a crisp header with the candidate name prominently displayed at the top left and contact details below it in a single line or tightly grouped line.
2. Implement a two-column page layout: left column for Experience and Education, right sidebar for Skills, Certifications, Selected Projects, and quick summary highlights.
3. Use clean, modern typography: professional fonts, subtle accent color (teal or blue), light section dividers, and balanced white space.
4. Headings should be bold and easy to scan; use bullet points for achievements and responsibilities.
5. Keep the design ATS-friendly: valid HTML, text-based layout, standard section headings, no embedded images or complex tables.
6. The Professional Summary should be friendly, confident, and tailored to the job description.
7. Include these sections: Contact Information, Professional Summary, Skills, Work Experience, Education, and Certifications. Add a "Selected Projects" or "Achievements" sidebar section if it improves the layout.
8. Ensure the resume looks polished in PDF output: use a page-width layout with a visible right sidebar, neat margins, and consistent spacing.
9. Return ONLY a JSON object with one field: "html".
10. The "html" field must contain a complete, valid HTML document with embedded CSS for styling.
11. Do NOT add markdown, explanation, or text outside JSON.

Return format:
{
  "html": "<!DOCTYPE html><html><head><style>/* CSS here */</style></head><body><!-- Resume content --></body></html>"
}`
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  })
  const data = JSON.parse(response.choices[0].message.content);
  console.log(data.html)
  const pdfBuffer = await generatePdfFormhtml(data.html)
  return pdfBuffer

}
async function generatePdfFormhtml(htmlContent) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setContent(htmlContent, { waitUntil: "networkidle0" })
  const pdfBuffer = await page.pdf({ format: "A4" })
  await browser.close()
  return pdfBuffer
}
export default generateInterviewReport

