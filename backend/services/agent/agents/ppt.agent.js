import { getModel } from "../config/llmModels.js"
import { generatePpt } from "../utils/generatePpt.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { deductCredits } from "../utils/deductCredits.js"
import { chatAgentLimit } from "../config/agentLimit.js"


export const pptAgent = async (state) => {

    try {
        await chatAgentLimit(state.userId, "ppt")

        const llm = await getModel("ppt")

        const prompt = `
        You are a professional presentation designer.

        Return a complete JSON object with exactly this structure:
        {
          "title": "Presentation title",
          "subtitle": "Short subtitle",
          "slides": [
            {
              "title": "Slide title",
              "points": ["Concise point", "Concise point", "Concise point", "Concise point"]
            }
          ]
        }

        Generate exactly 6 slides, each with 4 concise bullet points.
        Keep every point brief so the complete JSON fits in the response.
        Return only JSON, with no Markdown fences or explanations.

        Topic:
        ${state.prompt}
    `

        const res = await llm.invoke(prompt)

        const data = JSON.parse(res.content)

        await deductCredits(state.userId, "ppt")

        const ppt = await generatePpt(data)

        const buffer = await ppt.write({
            outputType: "nodebuffer"
        })

        const filename = `ppt-${Date.now()}.pptx`

        await uploadToS3(filename, buffer, "application/vnd.openxmlformats-officedocument.presentationml.presentation")

        const downloadUrl = await getFromS3(filename, 60 * 60 * 24)

        return {
            ...state,
            aiResponse: `# Presentation Generated

**${data.title}**
        
[Download PPT](${downloadUrl})
        
_Link expires in 24 hours._`
        }

    } catch (error) {
        console.log(error)


        return {
            ...state,
            aiResponse: error?.data?.message || "failed to generate PPT"
        }


    }


}