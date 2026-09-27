import {
    useCallback,
    useEffect,
    useState,
} from "react";

import api from "../services/api";
import { AuthContext } from "./authContext";

const GITHUB_MESSAGES = {
    connected: {
        type: "success",
        text: "GitHub connected successfully.",
    },
    already_connected: {
        type: "error",
        text: "This GitHub account is already connected to another AI Code Reviewer account.",
    },
};

function getGithubStatusFromUrl() {
    return new URLSearchParams(
        window.location.search
    ).get("github");
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [githubMessage, setGithubMessage] = useState(
        () =>
            GITHUB_MESSAGES[
                getGithubStatusFromUrl()
            ] || null
    );

    const fetchCurrentUser = useCallback(async () => {
        try {
            const response = await api.get("auth/me/");

            setUser(response.data.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (getGithubStatusFromUrl()) {
            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );
        }

        fetchCurrentUser();
    }, [fetchCurrentUser]);

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
