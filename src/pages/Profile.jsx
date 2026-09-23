import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://ai-code-reviewer-backend-0f6s.onrender.com/api/";

function resolveAvatar(avatar) {
    if (!avatar) return null;

    if (/^https?:\/\//.test(avatar)) return avatar;

    return `${API_BASE_URL}${avatar.replace(/^\//, "")}`;
}

function Profile() {
    const { user, refreshUser, githubConnected, githubUsername } =
        useAuth();

    const fileInputRef = useRef(null);

    const [email, setEmail] = useState(user?.email || "");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const avatar = resolveAvatar(user?.avatar);

    const initial =
        user?.username?.charAt(0).toUpperCase() || "U";

    const handleSaveEmail = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");
        setSaving(true);

        try {
            await api.patch("auth/me/", { email });

            await refreshUser();

            setMessage(
                "Profile updated successfully."
            );
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                    err.response?.data?.email?.join(" ") ||
                    "Unable to update your profile. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setError("");
        setMessage("");
        setUploading(true);

        try {
            const formData = new FormData();

            formData.append("avatar", file);

            await api.patch("auth/me/", formData);

            await refreshUser();

            setMessage("Profile picture updated.");
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                    err.response?.data?.avatar?.join(" ") ||
                    "Unable to upload a profile picture. Try a smaller image."
            );
        } finally {
            setUploading(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleConnectGitHub = () => {
        window.location.href =
            `${import.meta.env.VITE_API_BASE_URL}auth/github/connect/`;
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <p className="eyebrow">ACCOUNT</p>

                    <h1>My Profile</h1>

                    <p>
                        Manage your personal information and
                        profile picture.
                    </p>
                </div>
            </div>

            <div className="profile-grid">
                {/* AVATAR CARD */}

                <div className="profile-card profile-avatar-card">
                    <div className="profile-avatar-block">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt="Profile"
                                className="profile-avatar-large"
                            />
                        ) : (
                            <span className="profile-avatar-large profile-avatar-fallback">
                                {initial}
                            </span>
                        )}
                    </div>

                    <h2>{user?.username}</h2>

                    <p className="profile-card-subtitle">
                        {user?.email}
                    </p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        id="profile-avatar-input"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        hidden
                    />

                    <label htmlFor="profile-avatar-input" className="profile-upload-button">
                        {uploading
                            ? "Uploading..."
                            : "Upload picture"}
                    </label>

                    <p className="profile-avatar-hint">
                        PNG or JPG. Keep it small for best
                        results.
                    </p>

                    <div className="profile-account-meta">
                        <span>Account</span>
                        <strong>
                            {githubConnected
                                ? "GitHub connected"
                                : "Basic account"}
                        </strong>
                    </div>
                </div>

                {/* DETAILS CARD */}

                <div className="profile-card">
                    <h2>Profile details</h2>

                    <p className="profile-card-subtitle">
                        Update your account information.
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

                    <form onSubmit={handleSaveEmail}>
                        <div className="form-group">
                            <label htmlFor="profile-username">
                                Username
                            </label>

                            <input
                                id="profile-username"
                                type="text"
                                value={user?.username || ""}
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="profile-email">
                                Email
                            </label>

                            <input
                                id="profile-email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-submit profile-save-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save changes"}
                        </button>
                    </form>

                    <div className="profile-github-box">
                        <div>
                            <strong>GitHub</strong>

                            <p>
                                {githubConnected
                                    ? `Connected as @${githubUsername}`
                                    : "Connect GitHub to review repositories."}
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
                                Connect GitHub
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;