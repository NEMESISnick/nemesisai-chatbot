import { chatAgentLimit } from "../config/agentLimit.js"
import { searchTool } from "../config/tavily.js"
import { deductCredits } from "../utils/deductCredits.js"


export const searchAgent = async (state) => {
    try {
        await chatAgentLimit(state.userId, "search")

        const results = await searchTool.invoke({
            query: state.prompt
        })

        await deductCredits(state.userId, "search")

        console.log(results)
        return {
            ...state, searchResults: results, images: results.images
        }
    } catch (error) {
        return {
            ...state,
            aiResponse: error?.data?.message || "failed to generate search result",
            searchResults: [], images: []
        }
    }
}