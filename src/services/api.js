import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://ai-code-reviewer-backend-0f6s.onrender.com/api/";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

let csrfToken = null;

api.interceptors.request.use(
    async (config) => {
        const method = config.method?.toLowerCase();

        const unsafeMethods = [
            "post",
            "put",
            "patch",
            "delete",
        ];

        if (unsafeMethods.includes(method)) {
            if (!csrfToken) {
                const response = await axios.get(
                    `${API_BASE_URL}auth/csrf/`,
                    {
                        withCredentials: true,
                    }
                );

                csrfToken = response.data.csrfToken;
            }

            config.headers["X-CSRFToken"] = csrfToken;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;