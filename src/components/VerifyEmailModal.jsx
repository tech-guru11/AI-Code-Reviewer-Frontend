import { useCallback, useEffect, useState } from "react";

import api from "../services/api";

function readError(error, fallback) {
    const data = error?.response?.data;

    if (!data) {
        return fallback;
    }

    if (Array.isArray(data.error)) {
        return data.error.join(" ");
    }

    return data.error || data.detail || fallback;
}

function VerifyEmailModal({ email, onClose, onVerified }) {
    const [code, setCode] = useState("");
    const [stage, setStage] = useState("sending");
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);
    const [devCode, setDevCode] = useState(null);

    const requestCode = useCallback(async () => {
        setStage("sending");
        setError(null);
        setNotice(null);
        setCode("");
        setDevCode(null);

        try {
            const response = await api.post(
                "auth/email/verify/request/"
            );

            setStage("enter");
            setNotice(response.data.message);

            // Only present when the backend runs the console email
            // backend, i.e. local development with no real delivery.
            if (response.data.dev_code) {
                setDevCode(response.data.dev_code);
            }
        } catch (requestError) {
            setStage("error");
            setError(
                readError(
                    requestError,
                    "Could not send a verification code."
                )
            );
        }
    }, []);

    useEffect(() => {
        requestCode();
    }, [requestCode]);

    const confirmCode = async (event) => {
        event.preventDefault();

        const trimmed = code.trim();

        if (!trimmed) {
            setError("Enter the code from your email.");

            return;
        }

        setStage("confirming");
        setError(null);

        try {
            await api.post("auth/email/verify/confirm/", {
                code: trimmed,
            });

            await onVerified();
        } catch (confirmError) {
            setStage("enter");
            setError(
                readError(
                    confirmError,
                    "Could not verify that code."
                )
            );
        }
    };

    return (
        <div
            className="verify-overlay"
            role="presentation"
            onClick={onClose}
        >
            <div
                className="verify-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="verify-email-title"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <h2 id="verify-email-title">
                    Verify your email
                </h2>

                <p className="verify-intro">
                    Connecting a GitHub account requires a
                    verified email address. We sent a
                    6-digit code to <strong>{email}</strong>.
                </p>

                {devCode && (
                    <div className="verify-dev">
                        <span className="verify-dev-label">
                            Local dev &mdash; no mail is sent, use
                            this code:
                        </span>

                        <span className="verify-dev-code">
                            {devCode}
                        </span>
                    </div>
                )}

                {stage === "sending" && (
                    <p className="verify-status">
                        Sending code...
                    </p>
                )}

                {stage === "error" && (
                    <p className="verify-error">
                        {error}
                    </p>
                )}

                {(stage === "enter" ||
                    stage === "confirming") && (
                    <form onSubmit={confirmCode}>
                        {notice && (
                            <p className="verify-notice">
                                {notice}
                            </p>
                        )}

                        {error && (
                            <p className="verify-error">
                                {error}
                            </p>
                        )}

                        <label
                            className="verify-label"
                            htmlFor="verify-code"
                        >
                            Verification code
                        </label>

                        <input
                            id="verify-code"
                            className="verify-input"
                            value={code}
                            autoFocus
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            placeholder="123456"
                            disabled={
                                stage === "confirming"
                            }
                            onChange={(event) =>
                                setCode(
                                    event.target.value.replace(
                                        /\D/g,
                                        ""
                                    )
                                )
                            }
                            onFocus={() => {
                                if (!code && devCode) {
                                    setCode(devCode);
                                }
                            }}
                        />

                        <div className="verify-actions">
                            <button
                                type="button"
                                className="verify-secondary"
                                onClick={requestCode}
                                disabled={
                                    stage === "sending" ||
                                    stage === "confirming"
                                }
                            >
                                Resend code
                            </button>

                            <button
                                type="submit"
                                className="verify-primary"
                                disabled={
                                    stage === "confirming"
                                }
                            >
                                {stage === "confirming"
                                    ? "Verifying..."
                                    : "Verify and connect"}
                            </button>
                        </div>
                    </form>
                )}

                {stage === "error" && (
                    <div className="verify-actions">
                        <button
                            type="button"
                            className="verify-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="verify-primary"
                            onClick={requestCode}
                        >
                            Try again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerifyEmailModal;
