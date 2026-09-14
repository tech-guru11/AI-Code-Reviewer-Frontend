import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Repositories() {
    const [githubRepositories, setGithubRepositories] = useState([]);
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncingRepo, setSyncingRepo] = useState("");
    const [error, setError] = useState("");
    const [syncMessage, setSyncMessage] = useState("");

    const loadRepositories = async () => {
        try {
            setLoading(true);
            setError("");

            const [githubResponse, databaseResponse] =
                await Promise.all([
                    api.get("github/repositories/"),
                    api.get("repositories/"),
                ]);

            console.log(
                "GitHub repositories:",
                githubResponse.data
            );

            console.log(
                "Database repositories:",
                databaseResponse.data
            );

            setGithubRepositories(githubResponse.data);
            setRepositories(databaseResponse.data);
        } catch (err) {
            console.error(
                "Failed to load repositories:",
                err
            );

            const message =
                err.response?.data?.error ||
                "Unable to load repositories. Make sure Django and GitHub are connected.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRepositories();
    }, []);

    const isRepositorySynced = (githubRepository) => {
        return repositories.some(
            (repository) =>
                repository.github_url ===
                githubRepository.github_url
        );
    };

    const handleSyncRepository = async (githubRepository) => {
        try {
            setSyncingRepo(githubRepository.full_name);
            setError("");
            setSyncMessage("");

            await api.post(
                "github/sync-repository/",
                {
                    repo_full_name:
                        githubRepository.full_name,
                }
            );

            setSyncMessage(
                `${githubRepository.name} synchronized successfully.`
            );

            await loadRepositories();
        } catch (err) {
            console.error(
                "Failed to sync repository:",
                err
            );

            const message =
                err.response?.data?.error ||
                "Unable to synchronize this repository.";

            setError(message);
        } finally {
            setSyncingRepo("");
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>

                    <h2>Loading repositories</h2>

                    <p>
                        Fetching your GitHub repositories...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <p className="eyebrow">
                        CODE MANAGEMENT
                    </p>

                    <h1>Repositories</h1>

                    <p>
                        Select a GitHub repository to connect
                        it to your AI code review system.
                    </p>
                </div>

                <div className="repository-header-actions">
                    <div className="review-count">
                        {githubRepositories.length}{" "}
                        {githubRepositories.length === 1
                            ? "Repository"
                            : "Repositories"}
                    </div>

                    <button
                        className="sync-repositories-button"
                        onClick={loadRepositories}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>
                </div>
            </div>

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

            {githubRepositories.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        ▣
                    </div>

                    <h2>No GitHub repositories found</h2>

                    <p>
                        Make sure your GitHub account is connected
                        and that you have access to at least one
                        repository.
                    </p>
                </div>
            ) : (
                <div className="repository-grid">
                    {githubRepositories.map(
                        (githubRepository) => {
                            const synced =
                                isRepositorySynced(
                                    githubRepository
                                );

                            const syncing =
                                syncingRepo ===
                                githubRepository.full_name;

                            const databaseRepository =
                                repositories.find(
                                    (repository) =>
                                        repository.github_url ===
                                        githubRepository.github_url
                                );

                            return (
                                <article
                                    className="repository-card"
                                    key={
                                        githubRepository.id
                                    }
                                >
                                    <div className="repository-card-header">
                                        <div className="repository-icon">
                                            ▣
                                        </div>

                                        <span
                                            className={
                                                synced
                                                    ? "repository-status"
                                                    : "repository-status repository-status-available"
                                            }
                                        >
                                            {synced
                                                ? "Connected"
                                                : "Available"}
                                        </span>
                                    </div>

                                    <div className="repository-content">
                                        <p className="repository-label">
                                            GITHUB REPOSITORY
                                        </p>

                                        <h2>
                                            {
                                                githubRepository.name
                                            }
                                        </h2>

                                        <p className="repository-description">
                                            {githubRepository.description ||
                                                "No description provided for this repository."}
                                        </p>
                                    </div>

                                    <div className="repository-details">
                                        <div>
                                            <span>
                                                GitHub
                                            </span>

                                            <strong>
                                                {
                                                    githubRepository.full_name
                                                }
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Language
                                            </span>

                                            <strong>
                                                {githubRepository.language ||
                                                    "Not specified"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Visibility
                                            </span>

                                            <strong>
                                                {githubRepository.private
                                                    ? "Private"
                                                    : "Public"}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="repository-actions">
                                        {synced &&
                                        databaseRepository ? (
                                            <Link
                                                to={`/pull-requests?repository=${databaseRepository.id}`}
                                            >
                                                View Pull Requests
                                            </Link>
                                        ) : (
                                            <button
                                                className="sync-repositories-button"
                                                onClick={() =>
                                                    handleSyncRepository(
                                                        githubRepository
                                                    )
                                                }
                                                disabled={
                                                    syncing
                                                }
                                            >
                                                {syncing ? (
                                                    <>
                                                        <span className="button-spinner"></span>
                                                        Syncing...
                                                    </>
                                                ) : (
                                                    "Sync Repository"
                                                )}
                                            </button>
                                        )}

                                        <a
                                            href={
                                                githubRepository.github_url
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="repository-github-button"
                                        >
                                            View on GitHub ↗
                                        </a>
                                    </div>
                                </article>
                            );
                        }
                    )}
                </div>
            )}
        </div>
    );
}

export default Repositories;