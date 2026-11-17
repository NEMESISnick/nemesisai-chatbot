import fs from "fs/promises"
import { PDFParse } from "pdf-parse"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { vectorStore } from "../config/vectorDb.js"
import { getModel } from "../config/llmModels.js"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { deductCredits } from "../utils/deductCredits.js"
import { chatAgentLimit } from "../config/agentLimit.js"

export const pdfRag = async (state) => {
    const filePath = state?.file?.path
    const prompt = state?.prompt || ""

    if (!filePath) {
        return {
            ...state,
            aiResponse: "No PDF file was provided."
        }
    }

    try {
        await chatAgentLimit(state.userId, "pdf")

        const buffer = await fs.readFile(filePath)
        const parser = new PDFParse({ data: buffer })
        const result = await parser.getText()
        const text = result?.text || ""

        if (!text.trim()) {
            return {
                ...state,
                aiResponse: "I couldn't find any readable text in the uploaded PDF."
            }
        }

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200
        })

        const docs = await splitter.createDocuments([text])
        const collectionName = `pdf-${Date.now()}`
        const store = await vectorStore(docs, collectionName)

        const relevantDocs = await store.similaritySearch(prompt, 5)
        const context = relevantDocs.map((d) => d.pageContent).join("\n\n")

        const llm = await getModel("pdf")

        const messages = [
            new SystemMessage(`You are NemesisAI PDF Assistant.
                
                Rules:
                
                - Answer ONLY from the uploaded PDF.
                - Never make up information.
                - If the answer is not present in the PDF, reply:
                "I couldn't find this information in the uploaded PDF."

                - Use Markdown formatting.
            `),

            new HumanMessage(`
                Context:${context}
                Question:${prompt}
            `)
        ]

        const response = await llm.invoke(messages)
        await deductCredits(state.userId, "pdf")

        return {
            ...state,
            aiResponse: response.content
        }
    } catch (error) {
        console.error("PDF analysis failed:", error)

        return {
            ...state,
            aiResponse: "Failed to Analyze PDF"
        }
    } finally {
        if (filePath) {
            await fs.unlink(filePath).catch(() => { })
        }
    }
}