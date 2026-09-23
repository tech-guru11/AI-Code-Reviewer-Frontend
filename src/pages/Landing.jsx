import { Navigate, Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

function Landing() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="landing-auth-check">
                Loading...
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="landing-page">
            {/* NAV BAR */}

            <header className="landing-nav">
                <div className="landing-nav-inner">
                    <Link
                        to="/"
                        className="landing-brand"
                    >
                        <div className="brand-icon">
                            AI
                        </div>

                        <div>
                            <h2>AI Code Reviewer</h2>
                            <span>Code Intelligence</span>
                        </div>
                    </Link>

                    <nav className="landing-nav-links">
                        <a href="#features">Features</a>
                        <a href="#how-it-works">How it works</a>
                        <a href="#privacy">Security</a>
                    </nav>

                    <div className="landing-nav-actions">
                        <ThemeToggle />

                        <Link
                            to="/login"
                            className="landing-link-button"
                        >
                            Sign in
                        </Link>

                        <Link
                            to="/register"
                            className="landing-primary-button"
                        >
                            Get started
                        </Link>
                    </div>
                </div>
            </header>

            {/* HERO */}

            <section className="landing-hero">
                <div className="landing-hero-inner">
                    <p className="landing-eyebrow">
                        AI-POWERED CODE REVIEW
                    </p>

                    <h1>
                        Ship better code with{" "}
                        <span>AI code reviews</span> in
                        seconds
                    </h1>

                    <p className="landing-hero-subtitle">
                        Automatically analyze your pull
                        requests for bugs, security
                        vulnerabilities and code quality —
                        before your reviewers even take a
                        look.
                    </p>

                    <div className="landing-hero-actions">
                        <Link
                            to="/register"
                            className="landing-primary-button landing-hero-cta"
                        >
                            Start reviewing free
                        </Link>

                        <Link
                            to="/login"
                            className="landing-secondary-button"
                        >
                            Sign in →
                        </Link>
                    </div>

                    <div className="landing-hero-note">
                        <span className="system-status-dot"></span>
                        No credit card required · GitHub
                        integration included
                    </div>
                </div>

                {/* HERO MOCK CARD */}

                <div className="landing-hero-mock">
                    <div className="mock-card-head">
                        <div className="mock-card-brand">
                            <div className="brand-icon">AI</div>
                            <div>
                                <strong>Review #42</strong>
                                <span>PR #187 · feat/auth-flow</span>
                            </div>
                        </div>

                        <span className="status-badge status-completed">
                            Completed
                        </span>
                    </div>

                    <div className="mock-score">
                        <span>Code Quality Score</span>
                        <strong>8.4<span>/10</span></strong>
                    </div>

                    <div className="mock-findings">
                        <div className="finding-count critical">
                            ✕ 0 Critical
                        </div>
                        <div className="finding-count high">
                            ⚠ 2 High
                        </div>
                        <div className="finding-count medium">
                            4 Medium
                        </div>
                        <div className="finding-count low">
                            7 Low
                        </div>
                    </div>

                    <div className="mock-comments">
                        <div className="mock-comment">
                            <span className="mock-comment-tag high-tag">
                                HIGH
                            </span>
                            <p>
                                Hardcoded credentials detected
                                in <code>config.py:14</code>.
                            </p>
                        </div>

                        <div className="mock-comment">
                            <span className="mock-comment-tag medium-tag">
                                MEDIUM
                            </span>
                            <p>
                                N+1 query on user list — consider{" "}
                                <code>select_related</code>.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* LOGOS / TRUST STRIP */}

            <section className="landing-strip">
                <div className="landing-strip-inner">
                    <span>Trusted by teams that ship</span>
                    <div className="landing-strip-logos">
                        <span>Northwind</span>
                        <span>Acme Corp</span>
                        <span>Globex</span>
                        <span>Initech</span>
                        <span>Umbrella</span>
                    </div>
                </div>
            </section>

            {/* FEATURES */}

            <section
                id="features"
                className="landing-section"
            >
                <div className="landing-section-inner">
                    <p className="landing-eyebrow">
                        FEATURES
                    </p>

                    <h2>
                        Everything you need for confident
                        merges
                    </h2>

                    <p className="landing-section-subtitle">
                        Deep analysis across your full stack,
                        focused on the issues that actually
                        matter.
                    </p>

                    <div className="landing-features">
                        <div className="landing-feature-card">
                            <span className="landing-feature-icon">
                                ✦
                            </span>
                            <h3>AI deep review</h3>
                            <p>
                                Context-aware analysis of your
                                changes surfaces bugs, edge cases
                                and best-practice violations.
                            </p>
                        </div>

                        <div className="landing-feature-card">
                            <span className="landing-feature-icon">
                                ⛨
                            </span>
                            <h3>Security first</h3>
                            <p>
                                Findings are triaged by severity —
                                critical, high, medium and low —
                                so you fix what matters first.
                            </p>
                        </div>

                        <div className="landing-feature-card">
                            <span className="landing-feature-icon">
                                ◉
                            </span>
                            <h3>GitHub integration</h3>
                            <p>
                                Connect your repositories and
                                review pull requests right from
                                your existing workflow.
                            </p>
                        </div>

                        <div className="landing-feature-card">
                            <span className="landing-feature-icon">
                                ★
                            </span>
                            <h3>Quality score</h3>
                            <p>
                                A single 0–10 score tracks code
                                quality over time so every PR
                                gets measurably better.
                            </p>
                        </div>

                        <div className="landing-feature-card">
                            <span className="landing-feature-icon">
                                ⌁
                            </span>
                            <h3>Blazing fast</h3>
                            <p>
                                Reviews run in seconds with a
                                clear pass/fail summary — no
                                waiting for round-trips.
                            </p>
                        </div>

                        <div className="landing-feature-card">
                            <span className="landing-feature-icon">
                                ▤
                            </span>
                            <h3>Review history</h3>
                            <p>
                                Every analysis is stored. Track
                                findings and scores across all
                                repositories in one dashboard.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}

            <section
                id="how-it-works"
                className="landing-section landing-section-alt"
            >
                <div className="landing-section-inner">
                    <p className="landing-eyebrow">
                        HOW IT WORKS
                    </p>

                    <h2>From pull request to insight in three steps</h2>

                    <div className="landing-steps">
                        <div className="landing-step">
                            <span className="landing-step-number">
                                01
                            </span>
                            <h3>Connect GitHub</h3>
                            <p>
                                Link your GitHub account and
                                import the repositories you want
                                reviewed.
                            </p>
                        </div>

                        <div className="landing-step">
                            <span className="landing-step-number">
                                02
                            </span>
                            <h3>Pick a pull request</h3>
                            <p>
                                Choose any open pull request and
                                let the AI analyze the diff
                                across the whole codebase.
                            </p>
                        </div>

                        <div className="landing-step">
                            <span className="landing-step-number">
                                03
                            </span>
                            <h3>Review & merge</h3>
                            <p>
                                Get a score, prioritized findings
                                and actionable comments — then
                                merge with confidence.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}

            <section
                id="privacy"
                className="landing-section landing-cta-section"
            >
                <div className="landing-section-inner landing-cta">
                    <h2>Ready to elevate your code reviews?</h2>
                    <p>
                        Join thousands of developers shipping
                        better code with AI Code Reviewer.
                    </p>

                    <div className="landing-cta-actions">
                        <Link
                            to="/register"
                            className="landing-primary-button landing-hero-cta"
                        >
                            Get started free
                        </Link>

                        <Link
                            to="/login"
                            className="landing-link-button landing-cta-signin"
                        >
                            Sign in
                        </Link>
                    </div>

                    <p className="landing-cta-note">
                        Your code stays yours. Analysis is
                        processed securely and never used to
                        train public models.
                    </p>
                </div>
            </section>

            {/* FOOTER */}

            <footer className="landing-footer">
                <div className="landing-footer-inner">
                    <div className="landing-brand">
                        <div className="brand-icon">AI</div>
                        <div>
                            <strong>AI Code Reviewer</strong>
                            <span>Code Intelligence</span>
                        </div>
                    </div>

                    <span className="landing-footer-copy">
                        © {new Date().getFullYear()} AI Code
                        Reviewer
                    </span>

                    <Link
                        to="/login"
                        className="landing-footer-login"
                    >
                        Sign in →
                    </Link>
                </div>
            </footer>
        </div>
    );
}

export default Landing;