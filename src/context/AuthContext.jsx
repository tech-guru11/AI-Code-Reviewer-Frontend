import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [githubMessage, setGithubMessage] = useState(null);

    const fetchCurrentUser = async () => {
        try {
            const response = await api.get("auth/me/");

            setUser(response.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const githubStatus = params.get("github");

        if (githubStatus === "connected") {
            setGithubMessage({
                type: "success",
                text: "GitHub connected successfully.",
            });

            fetchCurrentUser();
        } else if (githubStatus === "already_connected") {
            setGithubMessage({
                type: "error",
                text:
                    "This GitHub account is already connected to another AI Code Reviewer account.",
            });

            fetchCurrentUser();
        } else {
            fetchCurrentUser();
        }

        if (githubStatus) {
            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );
        }
    }, []);

    const login = async (username, password) => {
        const response = await api.post("auth/login/", {
            username,
            password,
        });

        setUser(response.data.user);

        return response.data;
    };

    const register = async (
        username,
        email,
        password,
        password_confirm
    ) => {
        const response = await api.post("auth/register/", {
            username,
            email,
            password,
            password_confirm,
        });

        setUser(response.data.user);

        return response.data;
    };

    const logout = async () => {
        try {
            await api.get("auth/csrf/");

            const csrfToken = getCookie("csrftoken");

            await api.post(
                "auth/logout/",
                {},
                {
                    headers: {
                        "X-CSRFToken": csrfToken,
                    },
                }
            );
        } finally {
            setUser(null);
        }
    };

    const githubConnected =
        Boolean(user?.github_connected);

    const githubUsername =
        user?.github_username || null;

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: Boolean(user),

                githubConnected,
                githubUsername,
                githubMessage,
                setGithubMessage,

                login,
                register,
                logout,
                refreshUser: fetchCurrentUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}

function getCookie(name) {
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
        const [key, ...value] = cookie.trim().split("=");

        if (key === name) {
            return decodeURIComponent(value.join("="));
        }
    }

    return null;
}