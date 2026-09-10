import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function ReviewDetail() {
    const { id } = useParams();

    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadReview = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `reviews/${id}/`
                );

                console.log(
                    "Review details:",
                    response.data
                );

                setReview(response.data);
            } catch (err) {
                console.error(
                    "Failed to load review:",
                    err
                );

                setError(
                    "Unable to load this review. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        loadReview();
    }, [id]);

    const getScoreClass = (score) => {
        if (score >= 7) return "score-good";
        if (score >= 4) return "score-warning";
        return "score-danger";
    };

    const getSeverityClass = (severity) => {
        return `severity-${severity?.toLowerCase()}`;
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case "completed":
                return "status-completed";

            case "processing":
                return "status-processing";

            case "pending":
                return "status-pending";

            case "failed":
                return "status-failed";

            default:
                return "";
        }
    };

    const getFindingCounts = (findings = []) => {
        return {
            critical: findings.filter(
                (finding) =>
                    finding.severity?.toLowerCase() ===
                    "critical"
            ).length,

            high: findings.filter(
                (finding) =>
                    finding.severity?.toLowerCase() ===
                    "high"
            ).length,

            medium: findings.filter(
                (finding) =>
                    finding.severity?.toLowerCase() ===
                    "medium"
            ).length,

            low: findings.filter(
                (finding) =>
                    finding.severity?.toLowerCase() ===
                    "low"
            ).length,
        };
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>

                    <h2>Loading review</h2>

                    <p>
                        Fetching AI review results...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">

                <Link
                    to="/reviews"
                    className="back-link"
                >
                    ← Back to Reviews
                </Link>

                <div className="error-state">

                    <h1>Review Error</h1>

                    <p className="error-message">
                        {error}
                    </p>

                    <Link
                        to="/reviews"
                        className="retry-button"
                    >
                        Back to Reviews
                    </Link>

                </div>

            </div>
        );
    }

    if (!review) {
        return (
            <div className="page-container">

                <Link
                    to="/reviews"
                    className="back-link"
                >
                    ← Back to Reviews
                </Link>

                <div className="empty-state">

                    <div className="empty-state-icon">
                        ?
                    </div>

                    <h1>Review Not Found</h1>

                    <p>
                        The requested AI review could not
                        be found.
                    </p>

                    <Link to="/reviews">
                        View All Reviews
                    </Link>

                </div>

            </div>
        );
    }

    const findings = review.findings || [];

    const counts = getFindingCounts(findings);

    const score = Number(review.score) || 0;

    return (
        <div className="page-container">

            {/* HEADER */}

            <div className="review-detail-header">

                <div>

                    <Link
                        to="/reviews"
                        className="back-link"
                    >
                        ← Back to Reviews
                    </Link>

                    <p className="eyebrow">
                        AI CODE REVIEW
                    </p>

                    <h1>
                        Pull Request #
                        {review.pull_request}
                    </h1>

                    <p>
                        {review.pull_request_title ||
                            "Pull request review"}
                    </p>

                </div>

                <div
                    className={`large-score ${getScoreClass(
                        score
                    )}`}
                >
                    <strong>
                        {score}
                    </strong>

                    <span>/10</span>
                </div>

            </div>

            {/* STATUS */}

            <div className="review-status-bar">

                <div>

                    <span className="status-label">
                        Review Status
                    </span>

                    <span
                        className={`review-status-badge ${getStatusClass(
                            review.status
                        )}`}
                    >
                        {review.status}
                    </span>

                </div>

                <div>

                    <span className="status-label">
                        Findings
                    </span>

                    <strong>
                        {findings.length}
                    </strong>

                </div>

            </div>

            {/* SCORE OVERVIEW */}

            <section className="review-summary">

                <div className="section-heading-row">

                    <div>
                        <p className="eyebrow">
                            ANALYSIS RESULT
                        </p>

                        <h2>
                            Review Summary
                        </h2>
                    </div>

                    <span
                        className={`score-label ${getScoreClass(
                            score
                        )}`}
                    >
                        {score >= 7
                            ? "Good"
                            : score >= 4
                            ? "Needs Improvement"
                            : "Critical Issues"}
                    </span>

                </div>

                <p>
                    {review.summary ||
                        "No summary was provided for this review."}
                </p>

                {/* Score bar */}

                <div className="score-progress">

                    <div className="score-progress-label">
                        <span>
                            Code Quality Score
                        </span>

                        <strong>
                            {score}/10
                        </strong>
                    </div>

                    <div className="score-progress-track">

                        <div
                            className={`score-progress-fill ${getScoreClass(
                                score
                            )}`}
                            style={{
                                width: `${Math.min(
                                    Math.max(score * 10, 0),
                                    100
                                )}%`,
                            }}
                        ></div>

                    </div>

                </div>

                {/* META */}

                <div className="review-meta">

                    <span>
                        <strong>Status:</strong>{" "}
                        {review.status}
                    </span>

                    <span>
                        <strong>Started:</strong>{" "}
                        {review.started_at
                            ? new Date(
                                  review.started_at
                              ).toLocaleString()
                            : "N/A"}
                    </span>

                    <span>
                        <strong>Completed:</strong>{" "}
                        {review.completed_at
                            ? new Date(
                                  review.completed_at
                              ).toLocaleString()
                            : "N/A"}
                    </span>

                </div>

            </section>

            {/* FINDING OVERVIEW */}

            {findings.length > 0 && (

                <section className="finding-overview">

                    <div className="findings-header">

                        <div>

                            <p className="eyebrow">
                                CODE ANALYSIS
                            </p>

                            <h2>
                                Finding Overview
                            </h2>

                        </div>

                        <span>
                            {findings.length}{" "}
                            {findings.length === 1
                                ? "issue"
                                : "issues"}{" "}
                            detected
                        </span>

                    </div>

                    <div className="finding-stats">

                        <div className="finding-stat critical">
                            <strong>
                                {counts.critical}
                            </strong>

                            <span>
                                Critical
                            </span>
                        </div>

                        <div className="finding-stat high">
                            <strong>
                                {counts.high}
                            </strong>

                            <span>
                                High
                            </span>
                        </div>

                        <div className="finding-stat medium">
                            <strong>
                                {counts.medium}
                            </strong>

                            <span>
                                Medium
                            </span>
                        </div>

                        <div className="finding-stat low">
                            <strong>
                                {counts.low}
                            </strong>

                            <span>
                                Low
                            </span>
                        </div>

                    </div>

                </section>

            )}

            {/* FINDINGS */}

            <section>

                <div className="findings-header">

                    <div>

                        <p className="eyebrow">
                            DETAILED RESULTS
                        </p>

                        <h2>
                            Findings
                        </h2>

                    </div>

                    <span>
                        {findings.length}{" "}
                        {findings.length === 1
                            ? "issue"
                            : "issues"}{" "}
                        detected
                    </span>

                </div>

                {findings.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-state-icon">
                            ✓
                        </div>

                        <h3>
                            No Issues Found
                        </h3>

                        <p>
                            The AI reviewer did not detect
                            any security or quality issues
                            in this pull request.
                        </p>

                    </div>

                ) : (

                    <div className="findings-list">

                        {findings.map(
                            (finding, index) => (

                                <article
                                    className="finding-card"
                                    key={
                                        finding.id ||
                                        index
                                    }
                                >

                                    {/* FINDING HEADER */}

                                    <div className="finding-header">

                                        <div className="finding-tags">

                                            <span
                                                className={`severity-badge ${getSeverityClass(
                                                    finding.severity
                                                )}`}
                                            >
                                                {finding.severity ||
                                                    "Unknown"}
                                            </span>

                                            <span className="category-badge">
                                                {finding.category ||
                                                    "General"}
                                            </span>

                                        </div>

                                        <span className="finding-location">
                                            {finding.file_path ||
                                                "Unknown file"}

                                            {finding.line_number
                                                ? `:${finding.line_number}`
                                                : ""}
                                        </span>

                                    </div>

                                    {/* FINDING NUMBER */}

                                    <div className="finding-number">
                                        Finding #
                                        {index + 1}
                                    </div>

                                    {/* TITLE */}

                                    <h3>
                                        {finding.title ||
                                            "Issue detected"}
                                    </h3>

                                    {/* DESCRIPTION */}

                                    <p className="finding-description">
                                        {finding.description ||
                                            "No description was provided."}
                                    </p>

                                    {/* SUGGESTION */}

                                    {finding.suggestion && (

                                        <div className="suggestion">

                                            <strong>
                                                Recommended Fix
                                            </strong>

                                            <p>
                                                {
                                                    finding.suggestion
                                                }
                                            </p>

                                        </div>

                                    )}

                                    {/* CODE */}

                                    {finding.code_snippet && (

                                        <div className="code-section">

                                            <div className="code-section-header">

                                                <strong>
                                                    Code Snippet
                                                </strong>

                                                <span>
                                                    {
                                                        finding.file_path
                                                    }
                                                </span>

                                            </div>

                                            <pre>
                                                <code>
                                                    {
                                                        finding.code_snippet
                                                    }
                                                </code>
                                            </pre>

                                        </div>

                                    )}

                                </article>

                            )
                        )}

                    </div>

                )}

            </section>

        </div>
    );
}

export default ReviewDetail;