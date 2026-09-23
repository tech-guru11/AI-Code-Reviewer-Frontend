import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://ai-code-reviewer-backend-0f6s.onrender.com/api/";

function resolveAvatar(avatar) {
    if (!avatar) return null;

    if (/^https?:\/\//.test(avatar)) return avatar;

    return `${API_BASE_URL}${avatar.replace(/^\//, "")}`;
}

function ProfileMenu() {
    const { user, logout } = useAuth();

    const navigate = useNavigate();

    const [open, setOpen] = useState(false);

    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, []);

    const avatar = resolveAvatar(user?.avatar);

    const initial =
        user?.username?.charAt(0).toUpperCase() || "U";

    const handleLogout = async () => {
        await logout();

        navigate("/login");
    };

    return (
        <div
            className="profile-menu"
            ref={menuRef}
        >
            <ThemeToggle />

            <button
                className={`profile-menu-trigger ${
                    open ? "active" : ""
                }`}
                onClick={() => setOpen(!open)}
                aria-label="Open profile menu"
                aria-haspopup="true"
                aria-expanded={open}
            >
                {avatar ? (
                    <img
                        src={avatar}
                        alt=""
                        className="profile-menu-avatar"
                    />
                ) : (
                    <span className="profile-menu-avatar profile-menu-avatar-fallback">
                        {initial}
                    </span>
                )}

                <span className="profile-menu-name">
                    {user?.username}
                </span>

                <span className="profile-menu-chevron">
                    ▾
                </span>
            </button>

            {open && (
                <div className="profile-menu-dropdown">
                    <div className="profile-menu-header">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt=""
                                className="profile-menu-avatar"
                            />
                        ) : (
                            <span className="profile-menu-avatar profile-menu-avatar-fallback">
                                {initial}
                            </span>
                        )}

                        <div>
                            <strong>
                                {user?.username}
                            </strong>

                            <span>{user?.email}</span>
                        </div>
                    </div>

                    <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                    >
                        <span className="profile-menu-icon">
                            ◈
                        </span>
                        My Profile
                    </Link>

                    <Link
                        to="/settings"
                        onClick={() => setOpen(false)}
                    >
                        <span className="profile-menu-icon">
                            ⚙
                        </span>
                        Settings
                    </Link>

                    <button
                        className="profile-menu-logout"
                        onClick={handleLogout}
                    >
                        <span className="profile-menu-icon">
                            ↪
                        </span>
                        Log Out
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProfileMenu;