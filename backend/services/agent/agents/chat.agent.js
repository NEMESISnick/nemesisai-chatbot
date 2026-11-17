import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { assertGroqInputSize, getModel, MAX_GROQ_INPUT_CHARACTERS } from "../config/llmModels.js"
import { getMemory } from "../config/memory.js"
import { deductCredits } from "../utils/deductCredits.js"
import { chatAgentLimit } from "../config/agentLimit.js"

export const chatAgent = async (state) => {

    try {

        await chatAgentLimit(state.userId, "chat")

        const llm = await getModel("chat")

        const history = await getMemory(state.conversationId)

        if (!Array.isArray(history)) {
            throw new TypeError("Conversation history must be an array")
        }

        const searchContext = state.searchResults ? `
        Web Search Results: 
        
        ${JSON.stringify(state.searchResults)}
        
        Answer the user using only the above search results.
        ` : ""

        const systemPrompt = `
        you are NemesisAI, an intelligent AI assistant.

        ${searchContext}

        If searchContext exists:

        - Use search results to answer.
        - Do not mention internal tools.

        Rules:

        - For simple questions, greetings, and short queries, respond naturally in plain text.
        - For technical, education, coding, or detailed topics, use clean Markdown.
        - If user uses emojis in prompt, use emojis in response.
        - If user is less formal and more friendly, respond in the same way.

        Formatting:
        
        - use # for titles and ## for sections.
        - Leave a blank line after headings.
        - Use bullet points for lists.
        - Use numbered lists for steps.
        - Use fenced code blocks with language tags for code.
        - Keep paragraphs short and readable.
        - Never write headings and content on the same line.
        - Never generate large walls of text.
        - use bold font in every headline.
        - Leave gap of 3 lines after every paragraph.
        `

        if (typeof state.prompt !== "string") {
            throw new TypeError("Chat prompt must be a string")
        }

        assertGroqInputSize(systemPrompt + state.prompt)
        const remainingHistoryCharacters =
            MAX_GROQ_INPUT_CHARACTERS - systemPrompt.length - state.prompt.length

        let historyCharacters = 0
        const recentHistory = []

        for (let index = history.length - 1; index >= 0; index--) {
            const msg = history[index]
            if (
                !msg ||
                !["user", "assistant"].includes(msg.role) ||
                typeof msg.content !== "string"
            ) {
                console.warn("Skipping malformed conversation history message", {
                    role: msg?.role
                })
                continue
            }

            if (historyCharacters + msg.content.length > remainingHistoryCharacters) {
                break
            }

            recentHistory.unshift(msg)
            historyCharacters += msg.content.length
        }

        const messages = [
            new SystemMessage(systemPrompt)
        ]

        recentHistory.forEach(msg => {
            if (msg.role == "user") {
                messages.push(new HumanMessage(msg.content))
            }
            if (msg.role == "assistant") {
                messages.push(new AIMessage(msg.content))
            }
        });

        messages.push(new HumanMessage(state.prompt))

        const response = await llm.invoke(messages)

        await deductCredits(state.userId, "chat")

        return {
            ...state,
            aiResponse: response.content
        }

    } catch (error) {
        // console.error("ChatAgent error: ", error)
        // throw error

        return {
            ...state,
            aiResponse: error?.data?.message || "failed to generate chat" //change this if error occurs
        }
    }



}