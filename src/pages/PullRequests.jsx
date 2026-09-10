import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams} from "react-router-dom";
import api from "../services/api";

function PullRequests() {
    const [pullRequests, setPullRequests] = useState([]);
    const [repositories, setRepositories] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reviewingId, setReviewingId] = useState(null);
    const [reviewMessage, setReviewMessage] = useState({});

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const repositoryId = searchParams.get("repository");
    const selectedRepository = repositories.find(
        (repository) =>
            String(repository.id) === String(repositoryId)
    );
    useEffect(() => {
        loadPullRequests();
    }, [repositoryId]);

    const loadPullRequests = async () => {
        try {
            setLoading(true);
            setError("");

           const [
                pullRequestsResponse,
                repositoriesResponse,
                reviewsResponse,
            ] = await Promise.all([
                api.get("pull-requests/"),
                api.get("repositories/"),
                api.get("reviews/"),
            ]);

            setRepositories(repositoriesResponse.data);
            setReviews(reviewsResponse.data);

            const data = repositoryId
                ? pullRequestsResponse.data.filter(
                    (pullRequest) =>
                        String(pullRequest.repository) ===
                        String(repositoryId)
                )
                : pullRequestsResponse.data;

            setPullRequests(data);
        } catch (err) {
            console.error(
                "Failed to load pull requests:",
                err
            );

            setError(
                "Unable to load pull requests. Make sure the Django server is running."
            );
        } finally {
            setLoading(false);
        }
    };

    /*
     * Poll one specific review.
     *
     * Instead of requesting /reviews/ and searching through
     * every review, we request /reviews/<review_id>/ directly.
     */
    const waitForReview = async (reviewId) => {
        const maxAttempts = 30;
        const delay = 2000;

        for (
            let attempt = 0;
            attempt < maxAttempts;
            attempt++
        ) {
            try {
                const response = await api.get(
                    `reviews/${reviewId}/`
                );

                const review = response.data;

                console.log(
                    `Review ${reviewId} status:`,
                    review.status
                );

                if (review.status === "completed") {
                    return review;
                }

                if (review.status === "failed") {
                    throw new Error(
                        "The AI review failed during processing."
                    );
                }

                /*
                 * Keep polling while the review is pending
                 * or processing.
                 */
                if (
                    review.status === "pending" ||
                    review.status === "processing"
                ) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, delay)
                    );

                    continue;
                }

                /*
                 * If the backend returns an unexpected status,
                 * keep checking rather than immediately failing.
                 */
                await new Promise((resolve) =>
                    setTimeout(resolve, delay)
                );
            } catch (err) {
                /*
                 * Preserve the actual review failure.
                 */
                if (
                    err.message ===
                    "The AI review failed during processing."
                ) {
                    throw err;
                }

                console.error(
                    "Failed to check review status:",
                    err
                );

                /*
                 * Temporary API errors should not immediately
                 * terminate the review workflow.
                 */
                await new Promise((resolve) =>
                    setTimeout(resolve, delay)
                );
            }
        }

        return null;
    };

    const handleReview = async (pullRequestId) => {
        setReviewingId(pullRequestId);

        setReviewMessage((previous) => ({
            ...previous,
            [pullRequestId]: {
                type: "processing",
                text: "Starting AI review...",
            },
        }));

        try {
            const response = await api.post(
                `pull-requests/${pullRequestId}/review/`
            );

            console.log(
                "Review response:",
                response.data
            );

            const {
                review_id,
                commit_sha,
                status,
            } = response.data;

            console.log("Review ID:", review_id);
            console.log("Commit SHA:", commit_sha);
            console.log("Review status:", status);

            /*
             * If this commit has already been reviewed,
             * the backend returns the existing review ID.
             */
            if (
                review_id &&
                status === "completed"
            ) {
                setReviewMessage((previous) => ({
                    ...previous,
                    [pullRequestId]: {
                        type: "success",
                        text:
                            "This commit has already been reviewed.",
                    },
                }));

                navigate(`/reviews/${review_id}`);

                return;
            }

            /*
             * New reviews should also return a review_id.
             */
            if (review_id) {
                setReviewMessage((previous) => ({
                    ...previous,
                    [pullRequestId]: {
                        type: "processing",
                        text:
                            "AI is analyzing the pull request...",
                    },
                }));

                const review = await waitForReview(
                    review_id
                );

                if (review) {
                    setReviewMessage((previous) => ({
                        ...previous,
                        [pullRequestId]: {
                            type: "success",
                            text:
                                "AI review completed successfully.",
                        },
                    }));

                    navigate(`/reviews/${review.id}`);

                    return;
                }

                /*
                 * The review is still processing after the
                 * maximum polling period.
                 */
                setReviewMessage((previous) => ({
                    ...previous,
                    [pullRequestId]: {
                        type: "processing",
                        text:
                            "The review is taking longer than expected. Check the Reviews page shortly.",
                    },
                }));

                return;
            }

            /*
             * Fallback for the current backend response if it
             * does not yet return review_id for a new review.
             */
            if (!commit_sha) {
                setReviewMessage((previous) => ({
                    ...previous,
                    [pullRequestId]: {
                        type: "processing",
                        text:
                            "AI review started. Check the Reviews page for the result.",
                    },
                }));

                return;
            }

            /*
             * The backend may currently return a commit SHA
             * without a review ID. We do not search every
             * review here anymore because Step 7 is designed
             * around polling a specific review ID.
             */
            setReviewMessage((previous) => ({
                ...previous,
                [pullRequestId]: {
                    type: "processing",
                    text:
                        "AI review started. Check the Reviews page for the result.",
                },
            }));
        } catch (err) {
            console.error(
                "AI review failed:",
                err
            );

            const message =
                err.response?.data?.message ||
                err.message ||
                "Failed to start AI review.";

            setReviewMessage((previous) => ({
                ...previous,
                [pullRequestId]: {
                    type: "error",
                    text: message,
                },
            }));
        } finally {
            setReviewingId(null);
        }
    };

    const getReviewMessageClass = (message) => {
        if (!message) {
            return "";
        }

        return `review-message ${message.type}`;
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>

                    <h2>Loading pull requests</h2>

                    <p>
                        Fetching pull requests from GitHub...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <p className="eyebrow">
                            CODE REVIEW
                        </p>

                        <h1>Pull Requests</h1>
                    </div>
                </div>

                <div className="error-message">
                    {error}
                </div>

                <button
                    className="retry-button"
                    onClick={loadPullRequests}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="page-container">

            {/* HEADER */}

            <div className="page-header">

                <div>
                    <p className="eyebrow">
                        CODE REVIEW
                    </p>
                    <h1>Pull Requests</h1>

                    <p>
                        {selectedRepository
                            ? `Pull requests for ${selectedRepository.name}.`
                            : "Select a GitHub pull request and let AI analyze its code changes."}
                    </p>
                </div>

                <div className="review-count">
                    {pullRequests.length}{" "}
                    {pullRequests.length === 1
                        ? "Pull Request"
                        : "Pull Requests"}
                </div>

            </div>

            {/* INFORMATION BANNER */}

            <div className="review-workflow-banner">

                <div className="workflow-icon">
                    ✦
                </div>

                <div>
                    <strong>
                        AI-powered code analysis
                    </strong>

                    <p>
                        The AI reviewer analyzes changed code,
                        identifies potential problems and
                        generates recommendations.
                    </p>
                </div>

            </div>

            {/* EMPTY STATE */}

            {pullRequests.length === 0 ? (

                <div className="empty-state">

                    <div className="empty-state-icon">
                        ⑂
                    </div>

                    <h2>No pull requests found</h2>

                    <p>
                        There are currently no pull requests
                        available for the connected repositories.
                    </p>

                    <Link to="/repositories">
                        View Repositories
                    </Link>

                </div>

            ) : (

                <div className="pull-request-list">

                    {pullRequests.map((pullRequest) => {
                        const pullRequestReviews = reviews
                            .filter(
                                (review) =>
                                    String(review.pull_request) ===
                                    String(pullRequest.id)
                            )
                            .sort(
                                (a, b) =>
                                    new Date(b.created_at) -
                                    new Date(a.created_at)
                            );

                       
                        const latestReview = pullRequestReviews[0];

                        const currentCommitSha =
                            pullRequest.latest_commit_sha;

                        const latestReviewCommitSha =
                            latestReview?.commit_sha;

                        const isCurrentCommitReviewed =
                            Boolean(
                                currentCommitSha &&
                                latestReviewCommitSha &&
                                currentCommitSha === latestReviewCommitSha &&
                                latestReview.status === "completed"
                            );

                        const message =
                            reviewMessage[
                                pullRequest.id
                            ];

                        const isReviewing =
                            reviewingId ===
                            pullRequest.id;

                        return (
                            <article
                                className="pull-request-card"
                                key={pullRequest.id}
                            >

                                {/* PR HEADER */}

                                <div className="pull-request-header">

                                    <div>

                                        <p className="eyebrow">
                                            PULL REQUEST
                                        </p>

                                        <h2>
                                            #
                                            {
                                                pullRequest.github_pr_number
                                            }{" "}
                                            {pullRequest.title}
                                        </h2>

                                    </div>

                                    <span className="pr-status">
                                        {pullRequest.status ||
                                            "Open"}
                                    </span>

                                </div>

                                {/* BRANCH INFORMATION */}

                                <div className="branch-info">

                                    <div>
                                        <span>
                                            Source branch
                                        </span>

                                        <strong>
                                            {
                                                pullRequest.source_branch
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Target branch
                                        </span>

                                        <strong>
                                            {
                                                pullRequest.target_branch
                                            }
                                        </strong>
                                    </div>

                                </div>
                                {latestReview ? (
                                    <div className="latest-review-panel">
                                        <div>
                                            <span>Latest AI Review</span>

                                            <strong>
                                                {latestReview.score !== null &&
                                                latestReview.score !== undefined
                                                    ? `${latestReview.score}/10`
                                                    : "No score"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Findings</span>

                                            <strong>
                                                {latestReview.finding_count || 0}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Status</span>

                                            <strong>
                                                {latestReview.status}
                                            </strong>
                                        </div>

                                        <Link to={`/reviews/${latestReview.id}`}>
                                            View Latest Review →
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="no-review-panel">
                                        <span>✦</span>

                                        <div>
                                            <strong>No AI review yet</strong>

                                            <p>
                                                This pull request has not been
                                                analyzed by the AI reviewer.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* REVIEW STATUS */}

                                {message && (
                                    <div
                                        className={getReviewMessageClass(
                                            message
                                        )}
                                    >
                                        <span>
                                            {message.type ===
                                                "success" &&
                                                "✓"}

                                            {message.type ===
                                                "error" &&
                                                "!"}

                                            {message.type ===
                                                "processing" &&
                                                "◌"}
                                        </span>

                                        <p>
                                            {message.text}
                                        </p>
                                    </div>
                                )}

                                {/* ACTIONS */}

                                <div className="pull-request-actions">
                                
                                <button
                                    className={`ai-review-button ${
                                        isCurrentCommitReviewed
                                            ? "already-reviewed"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleReview(
                                            pullRequest.id
                                        )
                                    }
                                    disabled={
                                        isReviewing ||
                                        isCurrentCommitReviewed
                                    }
                                >
                                    {isReviewing ? (
                                        <>
                                            <span className="button-spinner"></span>
                                            AI Reviewing...
                                        </>
                                    ) : isCurrentCommitReviewed ? (
                                        <>
                                            ✓ Reviewed
                                        </>
                                    ) : (
                                        <>
                                            ✦ Review with AI
                                        </>
                                    )}
                                </button>


                                    <Link
                                        to="/reviews"
                                        className="reviews-button"
                                    >
                                        View Reviews
                                    </Link>

                                </div>

                            </article>
                        );
                    })}

                </div>

            )}

        </div>
    );
}

export default PullRequests;