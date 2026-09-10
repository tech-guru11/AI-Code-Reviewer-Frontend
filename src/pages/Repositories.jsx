import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Repositories() {
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState("");
    const [syncMessage, setSyncMessage] = useState("");

    const loadRepositories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("repositories/");

            console.log("Repositories:", response.data);

            setRepositories(response.data);
        } catch (err) {
            console.error(
                "Failed to load repositories:",
                err
            );

            setError(
                "Unable to load repositories. Make sure the Django server is running."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRepositories();
    }, []);

    const handleSyncRepositories = async () => {
        try {
            setSyncing(true);
            setError("");
            setSyncMessage("");

            /*
             * The backend currently synchronizes a specific
             * repository. For now we use the connected
             * AI-Code-Reviewer repository.
             */
            const response = await api.post(
                "github/sync-repository/",
                {
                    repo_full_name:
                        "tech-guru11/AI-Code-Reviewer",
                }
            );

            console.log(
                "Repository synchronized:",
                response.data
            );

            setSyncMessage(
                "GitHub repository synchronized successfully."
            );

            await loadRepositories();
        } catch (err) {
            console.error(
                "Failed to sync GitHub repository:",
                err
            );

            const message =
                err.response?.data?.error ||
                "Unable to synchronize the GitHub repository.";

            setError(message);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>

                    <h2>Loading repositories</h2>

                    <p>
                        Fetching your connected GitHub
                        repositories...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">

            {/* HEADER */}

            <div className="page-header">

                <div>
                    <p className="eyebrow">
                        CODE MANAGEMENT
                    </p>

                    <h1>Repositories</h1>

                    <p>
                        Manage the GitHub repositories connected
                        to your AI code review system.
                    </p>
                </div>

                <div className="repository-header-actions">

                    <div className="review-count">
                        {repositories.length}{" "}
                        {repositories.length === 1
                            ? "Repository"
                            : "Repositories"}
                    </div>

                    <button
                        className="sync-repositories-button"
                        onClick={handleSyncRepositories}
                        disabled={syncing}
                    >
                        {syncing ? (
                            <>
                                <span className="button-spinner"></span>
                                Syncing...
                            </>
                        ) : (
                            <>
                                ↻ Sync GitHub
                            </>
                        )}
                    </button>

                </div>

            </div>

            {/* MESSAGES */}

            {syncMessage && (
                <div className="success-message">
                    {syncMessage}
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* EMPTY STATE */}

            {repositories.length === 0 ? (

                <div className="empty-state">

                    <div className="empty-state-icon">
                        ▣
                    </div>

                    <h2>No repositories connected</h2>

                    <p>
                        Synchronize a GitHub repository to start
                        reviewing pull requests with AI.
                    </p>

                    <button
                        className="sync-repositories-button"
                        onClick={handleSyncRepositories}
                        disabled={syncing}
                    >
                        {syncing ? (
                            <>
                                <span className="button-spinner"></span>
                                Syncing...
                            </>
                        ) : (
                            <>
                                ↻ Sync GitHub Repository
                            </>
                        )}
                    </button>

                </div>

            ) : (

                <div className="repository-grid">

                    {repositories.map((repository) => (

                        <article
                            className="repository-card"
                            key={repository.id}
                        >

                            <div className="repository-card-header">

                                <div className="repository-icon">
                                    ▣
                                </div>

                                <span className="repository-status">
                                    Connected
                                </span>

                            </div>

                            <div className="repository-content">

                                <p className="repository-label">
                                    GITHUB REPOSITORY
                                </p>

                                <h2>
                                    {repository.name}
                                </h2>

                                <p className="repository-description">
                                    {repository.description ||
                                        "No description provided for this repository."}
                                </p>

                            </div>

                            <div className="repository-details">

                                <div>
                                    <span>
                                        Repository ID
                                    </span>

                                    <strong>
                                        #{repository.id}
                                    </strong>
                                </div>

                                {repository.created_at && (
                                    <div>
                                        <span>
                                            Connected
                                        </span>

                                        <strong>
                                            {new Date(
                                                repository.created_at
                                            ).toLocaleDateString()}
                                        </strong>
                                    </div>
                                )}

                            </div>

                            <div className="repository-actions">

                                <Link
                                    to={`/pull-requests?repository=${repository.id}`}
                                >
                                    View Pull Requests
                                </Link>

                                {repository.github_url && (
                                    <a
                                        href={
                                            repository.github_url
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="repository-github-button"
                                    >
                                        View on GitHub ↗
                                    </a>
                                )}

                            </div>

                        </article>

                    ))}

                </div>

            )}

        </div>
    );
}

export default Repositories;