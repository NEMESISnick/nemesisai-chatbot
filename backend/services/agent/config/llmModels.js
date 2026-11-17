import dotenv from "dotenv"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { ChatGroq } from "@langchain/groq"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatOpenRouter } from "@langchain/openrouter"

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") })

export const MAX_GROQ_INPUT_CHARACTERS = 6000

export const assertGroqInputSize = (prompt) => {
    if (prompt.length > MAX_GROQ_INPUT_CHARACTERS) {
        const error = new Error(
            "Your request is too long for the chat model. Please shorten it and try again."
        )
        error.statusCode = 413
        throw error
    }
}

const groq = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxTokens: 512,
    maxRetries: 2,
    // other params...
})

const pdfModel = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxTokens: 2048,
    maxRetries: 2,
})

const pptModel = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxTokens: 4096,
    maxRetries: 2,
})



const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-3.8-flash",
    temperature: 0,
    maxRetries: 2,
    maxTokens: 1024,
    // other params...
})

const openRouter = new ChatOpenRouter({
    model:"deepseek/deepseek-chat",
    temperature:0,
    maxTokens:2500,

})




export const getModel = async (agent) => {
    switch (agent) {
        case "chat":
            return groq;

        case "search":
            return gemini;

        case "coding":
            return openRouter;

        case "image":
            return groq;

        case "pdf":
            return pdfModel;

        case "ppt":
            return pptModel;

        case "imageAnalyzer":
            return gemini;
    
        default:
            return groq;
    }
}