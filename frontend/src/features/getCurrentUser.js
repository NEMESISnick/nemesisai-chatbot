import api from "../../utils/axios"

const getCurrentUser = async () => {
    try {
        const {data} = await api.get("/api/me")
        return data
    } catch (error) {
        const status = error.response?.status
        const message = error.response?.data?.message

        if (status === 400 && (message === "session not found" || message === "session expired")) {
            return null
        }

        console.error(
            "Failed to fetch current user:",
            status,
            error.response?.data || error.message
        )
        return null
    }
}

export default getCurrentUser