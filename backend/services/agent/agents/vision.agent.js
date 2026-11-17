import { getModel } from "../config/llmModels.js"
import axios from "axios"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { deductCredits } from "../utils/deductCredits.js"
import { chatAgentLimit } from "../config/agentLimit.js"


export const visionAgent = async (state) => {
    try {
        await chatAgentLimit(state.userId, "image")

        if (typeof state.prompt !== "string" || !state.prompt.trim()) {
            throw new TypeError("Image prompt must be a non-empty string")
        }

        const llm = await getModel("image")

        const res = await llm.invoke(`
            You are an elite AI image prompt engineer.
            
            Convert the user request into a highly detailed image generation prompt.
            
            Requirements:
            
            - Cinematic lighting
            - Professional composition
            - Ultra realistic
            - High detail
            - Beautiful color palette
            - Sharp focus
            - 8K quality
            - Photorealistic
            - Depth of field
            - Professional photography
            - Stunning visuals
            
            Return only the image prompt.
            
            User request:
            ${state.prompt}
        `)

        if (typeof res.content !== "string" || !res.content.trim()) {
            throw new TypeError("Image prompt model returned an invalid prompt")
        }

        const prompt = res.content.trim()

        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`

        const imageRes = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            timeout: 120000
        })

        await deductCredits(state.userId, "vision")

        const buffer = Buffer.from(imageRes.data)
        const contentType = imageRes.headers["content-type"]?.split(";")[0]

        if (!contentType?.startsWith("image/") || buffer.length === 0) {
            throw new Error("Image generation service returned an invalid image response")
        }

        const filename = `image-${Date.now()}`

        await uploadToS3(filename, buffer, contentType)

        const downloadUrl = await getFromS3(filename, 60 * 60 * 24)

        return {
            ...state,
            aiResponse: `# Image generated successfully

[Download Image](${downloadUrl})

Link expires in 24 hours.`,
            images: [downloadUrl]
        }
    } catch (error) {
        console.error(error)
        return {
            ...state,
            aiResponse: error?.data?.message || "failed to generate image"
        }
    }
}