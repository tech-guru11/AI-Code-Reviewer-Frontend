import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const from = location.state?.from?.pathname || "/dashboard";

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSubmitting(true);

        try {
            await login(username, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.error ||
                    "Unable to log in. Please check your credentials."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="brand-icon">
                        AI
                    </div>

                    <div>
                        <h1>AI Code Reviewer</h1>
                        <p>Code Intelligence</p>
                    </div>
                </div>

                <div className="auth-heading">
                    <h2>Welcome back</h2>
                    <p>
                        Sign in to continue reviewing your code.
                    </p>
                </div>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(event) =>
                                setUsername(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your username"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Signing in..."
                            : "Sign in"}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>
                        Don't have an account?
                    </span>

                    <Link to="/register">
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
