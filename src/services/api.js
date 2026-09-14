import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://ai-code-reviewer-backend-0f6s.onrender.com/api/";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const getCookie = (name) => {
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
        const [key, value] = cookie.trim().split("=");

        if (key === name) {
            return decodeURIComponent(value);
        }
    }

    return null;
};

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
            let csrfToken = getCookie("csrftoken");

            if (!csrfToken) {
                await axios.get(
                    `${API_BASE_URL}auth/csrf/`,
                    {
                        withCredentials: true,
                    }
                );

                csrfToken = getCookie("csrftoken");
            }

            if (csrfToken) {
                config.headers["X-CSRFToken"] = csrfToken;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;