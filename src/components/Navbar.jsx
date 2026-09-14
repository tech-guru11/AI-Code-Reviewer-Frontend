import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const {
        user,
        githubConnected,
        githubUsername,
        githubMessage,
        setGithubMessage,
        logout,
    } = useAuth();

    const navigate = useNavigate();

    const handleGitHubConnect = () => {
        window.location.href =
            `${import.meta.env.VITE_API_BASE_URL}auth/github/connect/`;
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <>
            {githubMessage && (
                <div
                    className={`github-oauth-message ${githubMessage.type}`}
                    role="alert"
                >
                    <span>{githubMessage.text}</span>

                    <button
                        type="button"
                        onClick={() => setGithubMessage(null)}
                        aria-label="Dismiss GitHub message"
                    >
                        ×
                    </button>
                </div>
            )}

            <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon">
                    AI
                </div>

                <div>
                    <h2>AI Code Reviewer</h2>
                    <span>Code Intelligence</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <p className="nav-section-title">
                    MAIN MENU
                </p>

                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `nav-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="nav-icon">⌂</span>
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/repositories"
                    className={({ isActive }) =>
                        `nav-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="nav-icon">▣</span>
                    <span>Repositories</span>
                </NavLink>

                <NavLink
                    to="/pull-requests"
                    className={({ isActive }) =>
                        `nav-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="nav-icon">⑂</span>
                    <span>Pull Requests</span>
                </NavLink>

                <NavLink
                    to="/reviews"
                    className={({ isActive }) =>
                        `nav-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    <span className="nav-icon">✦</span>
                    <span>AI Reviews</span>
                </NavLink>
            </nav>

            <div className="sidebar-bottom">
                <div className="user-section">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <strong>{user?.username}</strong>
                            <span>{user?.email}</span>
                        </div>
                    </div>

                    {githubConnected ? (
                        <div className="github-connected">
                            <span className="connection-dot"></span>

                            <div>
                                <strong>GitHub Connected</strong>
                                <span>
                                    @{githubUsername}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <button
                            className="github-connect-button"
                            onClick={handleGitHubConnect}
                        >
                            <span>◉</span>
                            <span>Connect GitHub</span>
                        </button>
                    )}

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        <span>Logout</span>
                    </button>

                    <div className="connection-status">
                        <span className="connection-dot"></span>

                        <div>
                            <strong>System Online</strong>
                            <span>Django API connected</span>
                        </div>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <span>AI Code Reviewer</span>
                    <span>v1.0</span>
                </div>
            </div>
            </aside>
        </>
    );
}

export default Navbar;