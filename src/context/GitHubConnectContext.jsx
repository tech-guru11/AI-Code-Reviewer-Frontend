import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

import { useAuth } from "./authContext";
import VerifyEmailModal from "../components/VerifyEmailModal";
import { API_BASE_URL } from "../services/api";

export const GitHubConnectContext =
    createContext(null);

export function useGitHubConnect() {
    const context = useContext(
        GitHubConnectContext
    );

    if (!context) {
        throw new Error(
            "useGitHubConnect must be used inside GitHubConnectProvider"
        );
    }

    return context;
}

export function GitHubConnectProvider({
    children,
}) {
    const { user, refreshUser } = useAuth();

    const [verifying, setVerifying] =
        useState(false);

    const startOAuth = useCallback(() => {
        window.location.href =
            `${API_BASE_URL}auth/github/connect/`;
    }, []);

    const connectGitHub = useCallback(() => {
        if (user?.email_verified) {
            startOAuth();

            return;
        }

        setVerifying(true);
    }, [user?.email_verified, startOAuth]);

    const handleVerified = useCallback(async () => {
        await refreshUser();

        setVerifying(false);

        startOAuth();
    }, [refreshUser, startOAuth]);

    const value = useMemo(
        () => ({
            connectGitHub,
            verifying,
        }),
        [connectGitHub, verifying]
    );

    return (
        <GitHubConnectContext.Provider
            value={value}
        >
            {children}

            {verifying && (
                <VerifyEmailModal
                    email={user?.email || ""}
                    onClose={() =>
                        setVerifying(false)
                    }
                    onVerified={handleVerified}
                />
            )}
        </GitHubConnectContext.Provider>
    );
}
