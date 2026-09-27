import axios from "axios";

/**
 * Base URL for every API call. Import this instead of re-deriving it —
 * duplicating this expression previously let a dead host linger in four
 * other files after the backend moved.
 *
 * Defaults to the same-origin "/api/", which is how the app is served in
 * production. Because the request is then same-origin, the browser applies
 * neither CORS nor SameSite rules to it, so no cross-origin configuration is
 * needed. In development Vite proxies "/api" to the local Django server.
 *
 * Set VITE_API_BASE_URL only to target a backend on a different host.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/";

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