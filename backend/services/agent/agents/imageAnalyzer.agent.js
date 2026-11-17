import { getModel } from "../config/llmModels.js"
import fs from "fs/promises"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { deductCredits } from "../utils/deductCredits.js"
import { chatAgentLimit } from "../config/agentLimit.js"

export const imageAnalyzer = async (state) => {

    const filePath = state?.file?.path
    const mimeType = state?.file?.mimetype || "image/png"

    if (!filePath) {
        return {
            ...state,
            aiResponse: "No image file was provided for analysis."
        }
    }

    try {
        await chatAgentLimit(state.userId, "chat")

        const llm = await getModel("imageAnalyzer")
        const imageBuffer = await fs.readFile(filePath)
        const base64Image = imageBuffer.toString("base64")

        const messages = [
            new SystemMessage(
                `You are NemesisAI Image Agent.
                
                Rules:
                
                - Analyze only the uploaded image.
                - Answer the user's question accurately.
                - If text exists in the image, extract it.
                - If charts or tables exist, explain them.
                - If something is unclear, say so.
                - Use Markdown when helpful.
                - Do not hallucinate.
                `
            ),
            new HumanMessage({
                content: [{
                    type: "text",
                    text: state?.prompt || "analyze the image",
                }, {
                    type: "image_url",
                    image_url: {
                        url: `data:${mimeType};base64,${base64Image}`
                    }
                }]
            })
        ]

        const response = await llm.invoke(messages)
        await deductCredits(state.userId, "vision")

        return {
            ...state,
            aiResponse: response.content
        }
    } catch (error) {
        console.error("Image analysis failed:", error)
        return {
            ...state,
            aiResponse: error?.data?.message || "failed to analyze image"
        }
    } finally {
        if (filePath) {
            await fs.unlink(filePath).catch(() => { })
        }
    }
}