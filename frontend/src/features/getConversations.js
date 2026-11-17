import api from "../../utils/axios.js"

export const getConversation = async () => {
    try {
        const {data} = await api.get("/api/chat/get-conversations")
        return data
    } catch (error) {
        console.error(
            "Failed to fetch conversations:",
            error.response?.status,
            error.response?.data || error.message
        )
        return []
    }
}