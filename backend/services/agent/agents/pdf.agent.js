import { getModel } from "../config/llmModels.js"
import { generatePdf } from "../utils/generatePdf.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { deductCredits } from "../utils/deductCredits.js"
import { chatAgentLimit } from "../config/agentLimit.js"


export const pdfAgent = async (state) => {
    try {

        await chatAgentLimit(state.userId, "pdf")
        const llm = await getModel("pdf")

        const prompt = `
        You are an expert document writer.
        
        Return ONLY valid JSON.
        
        Do NOT return Markdown.
        
        Do NOT return explanations.
        
        Structure:
        
        {
          "title": "",
          "subtitle": "",
          "sections": [
            {
              "heading": "",
              "points": []
            }
          ]
        }
        
        Generate 4-8 sections.
        
        Each section should have 3-6 concise bullet points.
        Return a complete JSON object with no Markdown fences.
        
        Topic:
        
        ${state.prompt}
        `
        const res = await llm.invoke(prompt)
        const content = typeof res.content === "string"
            ? res.content
            : res.content
                .map((part) => typeof part === "string" ? part : part.text || "")
                .join("")
        const jsonContent = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")

        if (!jsonContent) {
            throw new Error("The PDF model returned an empty response.")
        }

        let data
        try {
            data = JSON.parse(jsonContent)
        } catch {
            throw new Error("The PDF model returned invalid or incomplete JSON.")
        }

        if (
            !data ||
            typeof data.title !== "string" ||
            typeof data.subtitle !== "string" ||
            !Array.isArray(data.sections) ||
            data.sections.some((section) =>
                !section ||
                typeof section.heading !== "string" ||
                !Array.isArray(section.points) ||
                section.points.some((point) => typeof point !== "string")
            )
        ) {
            throw new Error("The PDF model returned content in an invalid format.")
        }

        await deductCredits(state.userId, "pdf")

        const pdfBuffer = await generatePdf(data)

        const filename = `pdf-${Date.now()}.pdf`

        await uploadToS3(filename, pdfBuffer, "application/pdf")

        const downloadUrl = await getFromS3(filename, 60 * 60 * 24)

        return {
            ...state,
            aiResponse: `# PDF Generated

**${data.title}**

[Download PDF](${downloadUrl})

_Link expires in 24 hours._`
        }

    } catch (error) {
        console.log(error)
        return {
            ...state,
            aiResponse: error?.data?.message || `Failed to Generate PDF: ${error}`
        }
    }
}