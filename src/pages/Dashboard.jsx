import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
    const [repositories, setRepositories] = useState([]);
    const [pullRequests, setPullRequests] = useState([]);
    const [reviews, setReviews] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    repositoriesResponse,
                    pullRequestsResponse,
                    reviewsResponse,
                ] = await Promise.all([
                    api.get("repositories/"),
                    api.get("pull-requests/"),
                    api.get("reviews/"),
                ]);

                setRepositories(repositoriesResponse.data);
                setPullRequests(pullRequestsResponse.data);
                setReviews(reviewsResponse.data);
            } catch (err) {
                console.error("Dashboard loading failed:", err);

                setError(
                    "Unable to load dashboard data. Make sure the Django server is running."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    
    const statistics = useMemo(() => {
        const completedReviews = reviews.filter(
            (review) => review.status === "completed"
        );

       const scores = completedReviews
            .map((review) => Number(review.score))
            .filter(
                (score) =>
                    !Number.isNaN(score) &&
                    score >= 0 &&
                    score <= 10
            );

        const averageScore =
            scores.length > 0
                ? scores.reduce(
                    (total, score) => total + score,
                    0
                ) / scores.length
                : 0;

        const severityCounts = completedReviews.reduce(
            (counts, review) => {
                counts.critical += Number(
                    review.critical_count || 0
                );

                counts.high += Number(
                    review.high_count || 0
                );

                counts.medium += Number(
                    review.medium_count || 0
                );

                counts.low += Number(
                    review.low_count || 0
                );

                return counts;
            },
            {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
            }
        );

        const totalFindings =
            severityCounts.critical +
            severityCounts.high +
            severityCounts.medium +
            severityCounts.low;

        return {
            repositories: repositories.length,
            pullRequests: pullRequests.length,
            reviews: reviews.length,
            completedReviews: completedReviews.length,
            averageScore,
            totalFindings,
            severityCounts,
        };
    }, [repositories, pullRequests, reviews]);


    const latestReviews = [...reviews]
        .sort(
            (a, b) =>
                new Date(b.created_at || 0) -
                new Date(a.created_at || 0)
        )
        .slice(0, 5);

   const getScoreClass = (score) => {
        const numericScore = Number(score);

        if (Number.isNaN(numericScore)) return "";

        if (numericScore >= 7) return "score-good";
        if (numericScore >= 4) return "score-warning";
        return "score-danger";
    };

   const getDisplayScore = (score) => {
        const numericScore = Number(score);

        if (Number.isNaN(numericScore)) return "—";

        return numericScore % 1 === 0
            ? numericScore
            : numericScore.toFixed(1);
    };

    const getStatusClass = (status) => {
        if (status === "completed") {
            return "status-completed";
        }

        if (
            status === "processing" ||
            status === "pending"
        ) {
            return "status-processing";
        }

        if (status === "failed") {
            return "status-failed";
        }

        return "";
    };

    const getStatusLabel = (status) => {
        if (status === "completed") {
            return "Completed";
        }

        if (status === "processing") {
            return "Processing";
        }

        if (status === "pending") {
            return "Pending";
        }

        if (status === "failed") {
            return "Failed";
        }

        return status || "Unknown";
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>

                    <h2>Loading dashboard</h2>

                    <p>
                        Gathering repositories, pull requests
                        and AI review data...
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
                        <h1>Dashboard</h1>

                        <p>
                            Monitor your AI-powered code review
                            system.
                        </p>
                    </div>
                </div>

                <div className="error-state">
                    <h2>Unable to load dashboard</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">

            {/* PAGE HEADER */}

            <div className="dashboard-welcome">

                <div>
                    <p className="eyebrow">
                        AI CODE REVIEW PLATFORM
                    </p>

                    <h1>Dashboard</h1>

                    <p className="dashboard-description">
                        Monitor repositories, pull requests and
                        AI-powered code quality analysis from one
                        place.
                    </p>
                </div>

                <div className="system-status">

                    <span className="system-status-dot"></span>

                    <div>
                        <strong>System Online</strong>
                        <span>Django API connected</span>
                    </div>

                </div>

            </div>


            {/* MAIN STATISTICS */}

            <section className="dashboard-section">

                <div className="section-header">

                    <div>
                        <h2>Overview</h2>

                        <p>
                            Current activity across your code
                            review system.
                        </p>
                    </div>

                </div>


                <div className="dashboard-stats">

                    {/* REPOSITORIES */}

                    <div className="stat-card">

                        <div className="stat-card-top">

                            <span className="stat-label">
                                Repositories
                            </span>

                            <span className="stat-icon">
                                ▣
                            </span>

                        </div>

                        <strong className="stat-value">
                            {statistics.repositories}
                        </strong>

                        <Link to="/repositories">
                            View repositories →
                        </Link>

                    </div>


                    {/* PULL REQUESTS */}

                    <div className="stat-card">

                        <div className="stat-card-top">

                            <span className="stat-label">
                                Pull Requests
                            </span>

                            <span className="stat-icon">
                                ⑂
                            </span>

                        </div>

                        <strong className="stat-value">
                            {statistics.pullRequests}
                        </strong>

                        <Link to="/pull-requests">
                            View pull requests →
                        </Link>

                    </div>


                    {/* AI REVIEWS */}

                    <div className="stat-card">

                        <div className="stat-card-top">

                            <span className="stat-label">
                                AI Reviews
                            </span>

                            <span className="stat-icon">
                                ✦
                            </span>

                        </div>

                        <strong className="stat-value">
                            {statistics.reviews}
                        </strong>

                        <Link to="/reviews">
                            View review history →
                        </Link>

                    </div>


                    {/* AVERAGE SCORE */}

                    <div className="stat-card">

                        <div className="stat-card-top">

                            <span className="stat-label">
                                Average Score
                            </span>

                            <span className="stat-icon">
                                ★
                            </span>

                        </div>

                        <strong
                            className={`stat-value ${getScoreClass(
                                statistics.averageScore
                            )}`}
                        >
                            {statistics.averageScore.toFixed(1)}

                            <small>/10</small>
                        </strong>

                        <span>
                            {statistics.completedReviews}{" "}
                            completed reviews
                        </span>

                    </div>

                </div>

            </section>


            {/* FINDINGS OVERVIEW */}


            <section className="dashboard-section">
                <div className="section-header">
                    <div>
                        <h2>Security Overview</h2>
                        <p>
                            Severity of findings detected across completed AI reviews.
                        </p>
                    </div>

                    <Link to="/reviews">
                        View all reviews →
                    </Link>
                </div>

                <div className="security-overview">
                    <div className="security-total">
                        <span>Total Findings</span>
                        <strong>{statistics.totalFindings}</strong>
                        <small>
                            Detected across completed reviews
                        </small>
                    </div>

                    <div className="security-card">
                        <span>Critical</span>
                        <strong>
                            {statistics.severityCounts.critical}
                        </strong>
                        <small>
                            Requires immediate attention
                        </small>
                    </div>

                    <div className="security-card">
                        <span>High</span>
                        <strong>
                            {statistics.severityCounts.high}
                        </strong>
                        <small>
                            High-priority findings
                        </small>
                    </div>

                    <div className="security-card">
                        <span>Medium</span>
                        <strong>
                            {statistics.severityCounts.medium}
                        </strong>
                        <small>
                            Moderate-priority findings
                        </small>
                    </div>

                    <div className="security-card">
                        <span>Low</span>
                        <strong>
                            {statistics.severityCounts.low}
                        </strong>
                        <small>
                            Lower-priority findings
                        </small>
                    </div>
                </div>
            </section>


            {/* QUICK ACTIONS */}

            <section className="dashboard-section">

                <div className="section-header">

                    <div>
                        <h2>Quick Actions</h2>

                        <p>
                            Start managing your code review
                            workflow.
                        </p>
                    </div>

                </div>


                <div className="quick-actions">

                    <Link
                        to="/repositories"
                        className="action-card"
                    >

                        <span className="action-icon">
                            ▣
                        </span>

                        <div>

                            <h3>Repositories</h3>

                            <p>
                                Manage connected GitHub
                                repositories.
                            </p>

                            <span className="action-link">
                                Open repositories →
                            </span>

                        </div>

                    </Link>


                    <Link
                        to="/pull-requests"
                        className="action-card"
                    >

                        <span className="action-icon">
                            ⑂
                        </span>

                        <div>

                            <h3>Pull Requests</h3>

                            <p>
                                Select a pull request and run
                                an AI code review.
                            </p>

                            <span className="action-link">
                                Review pull requests →
                            </span>

                        </div>

                    </Link>


                    <Link
                        to="/reviews"
                        className="action-card"
                    >

                        <span className="action-icon">
                            ✦
                        </span>

                        <div>

                            <h3>AI Reviews</h3>

                            <p>
                                Inspect previous AI analysis,
                                findings and scores.
                            </p>

                            <span className="action-link">
                                View review history →
                            </span>

                        </div>

                    </Link>

                </div>

            </section>


            {/* LATEST REVIEWS */}

            <section className="dashboard-section">

                <div className="section-header">

                    <div>

                        <h2>Latest Reviews</h2>

                        <p>
                            Most recently generated AI reviews.
                        </p>

                    </div>

                    <Link to="/reviews">
                        View all →
                    </Link>

                </div>


                {latestReviews.length === 0 ? (

                    <div className="empty-state">

                        <h3>No reviews yet</h3>

                        <p>
                            Start an AI review from the Pull
                            Requests page.
                        </p>

                        <Link to="/pull-requests">
                            Review a Pull Request
                        </Link>

                    </div>

                ) : (

                    <div className="dashboard-reviews">

                        {latestReviews.map((review) => (

                            <div
                                className="dashboard-review"
                                key={review.id}
                            >

                                <div>

                                    <span className="review-id">
                                        REVIEW #{review.id}
                                    </span>

                                    <h3>
                                        PR #
                                        {review.pull_request}
                                    </h3>

                                    <p>
                                        {review.pull_request_title ||
                                            "Pull request review"}
                                    </p>

                                </div>


                                <span
                                    className={`status-badge ${getStatusClass(
                                        review.status
                                    )}`}
                                >
                                    {getStatusLabel(
                                        review.status
                                    )}
                                </span>


                                <strong
                                    className={`review-score ${getScoreClass(
                                        review.score
                                    )}`}
                                >
                                    {getDisplayScore(
                                        review.score
                                    )}

                                    {review.score !== null &&
                                    review.score !== undefined
                                        ? "/10"
                                        : ""}
                                </strong>


                                <span className="review-finding-count">
                                    {Number(
                                        review.finding_count || 0
                                    )}{" "}
                                    findings
                                </span>


                                <Link
                                    to={`/reviews/${review.id}`}
                                >
                                    View →
                                </Link>

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </div>
    );
}

export default Dashboard;