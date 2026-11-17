import api from "../../utils/axios";

async function logOut() {
    try {
        await api.get("/api/auth/logout")
        return true
    } catch (error) {
        console.error("Logout failed:", error.response?.data || error.message || error)
        return false
    }
}

export default logOut