import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import api from "../services/api";

function Settings() {
    const { user, githubConnected, githubUsername } = useAuth();

    const { theme } = useTheme();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [saving, setSaving] = useState(false);

    const handleConnectGitHub = () => {
        window.location.href =
            `${import.meta.env.VITE_API_BASE_URL}auth/github/connect/`;
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setSaving(true);

        try {
            await api.patch("auth/password/", {
                current_password: currentPassword,
                new_password: newPassword,
                password_confirm: confirmPassword,
            });

            setMessage("Password updated successfully.");

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                    err.response?.data?.new_password?.join(" ") ||
                    err.response?.data?.current_password?.join(" ") ||
                    err.response?.data?.error ||
                    "Unable to change your password. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <p className="eyebrow">ACCOUNT</p>

                    <h1>Settings</h1>

                    <p>
                        Manage your security and connected
                        services.
                    </p>
                </div>
            </div>

            <div className="settings-grid">
                {/* CHANGE PASSWORD */}

                <div className="profile-card">
                    <h2>Change password</h2>

                    <p className="profile-card-subtitle">
                        Use a strong, unique password.
                    </p>

                    {message && (
                        <div className="success-message">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleChangePassword}>
                        <div className="form-group">
                            <label htmlFor="current-password">
                                Current password
                            </label>

                            <input
                                id="current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(event) =>
                                    setCurrentPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your current password"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="new-password">
                                New password
                            </label>

                            <input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(event) =>
                                    setNewPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter a new password"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm-password">
                                Confirm new password
                            </label>

                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Repeat new password"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-submit profile-save-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Updating..."
                                : "Update password"}
                        </button>
                    </form>
                </div>

                {/* CONNECTED SERVICES */}

                <div className="profile-card">
                    <h2>Connected services</h2>

                    <p className="profile-card-subtitle">
                        Link your tools to unlock more
                        features.
                    </p>

                    <div className="profile-github-box settings-service-box">
                        <div>
                            <strong>GitHub</strong>

                            <p>
                                {githubConnected
                                    ? `Connected as @${githubUsername}`
                                    : "Connect GitHub to import repositories and review pull requests."}
                            </p>
                        </div>

                        {githubConnected ? (
                            <span className="github-connected-badge">
                                <span className="connection-dot"></span>
                                Connected
                            </span>
                        ) : (
                            <button
                                className="github-connect-button-profile"
                                onClick={handleConnectGitHub}
                            >
                                Connect
                            </button>
                        )}
                    </div>

                    <div className="settings-account-info">
                        <div>
                            <span>Username</span>
                            <strong>{user?.username}</strong>
                        </div>

                        <div>
                            <span>Email</span>
                            <strong>{user?.email}</strong>
                        </div>

                        <div>
                            <span>Account type</span>
                            <strong>
                                {githubConnected
                                    ? "GitHub"
                                    : "Standard"}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* APPEARANCE */}

                <div className="profile-card">
                    <h2>Appearance</h2>

                    <p className="profile-card-subtitle">
                        Switch between light and dark mode.
                    </p>

                    <div className="settings-appearance-row">
                        <div>
                            <strong>
                                {theme === "dark"
                                    ? "Dark mode"
                                    : "Light mode"}
                            </strong>

                            <p>
                                Your preference is saved on
                                this device.
                            </p>
                        </div>

                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;