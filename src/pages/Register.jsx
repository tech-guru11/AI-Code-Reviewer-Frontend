import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] =
        useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (password !== passwordConfirm) {
            setError("Passwords do not match.");
            return;
        }

        setSubmitting(true);

        try {
            await register(
                username,
                email,
                password,
                passwordConfirm
            );

            navigate("/", { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.error ||
                    "Unable to create your account."
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
                    <h2>Create your account</h2>
                    <p>
                        Start reviewing your code with AI.
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
                            placeholder="Choose a username"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your email"
                            autoComplete="email"
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
                            placeholder="Create a password"
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password-confirm">
                            Confirm password
                        </label>

                        <input
                            id="password-confirm"
                            type="password"
                            value={passwordConfirm}
                            onChange={(event) =>
                                setPasswordConfirm(
                                    event.target.value
                                )
                            }
                            placeholder="Repeat your password"
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Creating account..."
                            : "Create account"}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>
                        Already have an account?
                    </span>

                    <Link to="/login">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;
