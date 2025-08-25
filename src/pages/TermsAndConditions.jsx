import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const url =
    window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "https://ananya.honor-itsolutions.com/node";

const TERMS_VERSION = "2025-08-25";
const PDF_URL = "public/Terms and Conditions for a Medical Coding App v.2 08.22.2025.docx";

const TermsAndConditions = () => {
    const navigate = useNavigate();
    const [agree, setAgree] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleAccept = async () => {
        setSubmitting(true);
        setError("");
        try {
            await fetch(`${url}/consent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    document: "terms-and-conditions",
                    version: TERMS_VERSION,
                    accepted: true,
                    acceptedAt: new Date().toISOString(),
                }),
            }).catch(() => { });

            localStorage.setItem(`termsAccepted:${TERMS_VERSION}`, "true");

            const next = localStorage.getItem("postTOSRedirect");
            localStorage.removeItem("postTOSRedirect");
            if (next) {
                navigate(next, { replace: true });
            } else {
                try {
                    const u = await (await fetch(`${url}/session`, { credentials: "include" })).json();
                    navigate(u?.groupLeader ? "/group/dashboard" : "/user/dashboard", { replace: true });
                } catch {
                    navigate("/user/dashboard", { replace: true });
                }
            }
        } catch (e) {
            setError("Could not record acceptance. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        await fetch(`${url}/consent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                document: "terms-and-conditions",
                version: TERMS_VERSION,
                accepted: false,
                respondedAt: new Date().toISOString(),
            }),
        }).catch(() => { });

        navigate("/individualSignUp");
    };

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h1 className="text-center my-2 font-bold">
                TERMS AND CONDITIONS FOR CODOC ACADEMY’S MEDICAL CODING APPLICATION
                <br />
                <span className="text-sm font-normal">EFFECTIVE DATE: August 25, 2025</span>
            </h1>

            <h3 className="text-center my-2">PLEASE READ CAREFULLY—THIS IS A BINDING CONTRACT</h3>

            <div className="text-center my-2">
                <p>
                    These Terms and Conditions ("Agreement") constitute a legally binding contract between
                    CoDoc Academy ("Company") and you ("User"). This Agreement governs your access to and
                    use of the Company’s medical coding application and related Services.
                </p>
            </div>

            <div className="text-center my-4">
                <a
                    href={PDF_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block underline text-blue-600 hover:opacity-80"
                >
                    Open PDF version of the full Terms (new tab)
                </a>
            </div>

            <div className="text-center my-2 text-sm opacity-80">
                Last updated: August 25, 2025 &nbsp;•&nbsp; Version: {TERMS_VERSION}
            </div>

            <div className="flex items-center justify-center gap-3 my-6">
                <input
                    id="agree"
                    type="checkbox"
                    className="w-5 h-5"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                />
                <label htmlFor="agree" className="select-none">
                    I have read and agree to the Terms and Conditions.
                </label>
            </div>

            {error && (
                <div className="my-4 text-red-600 text-center">
                    {error}
                </div>
            )}

            <div className="flex items-center justify-center gap-4 my-6">
                <button
                    type="button"
                    onClick={handleReject}
                    className="btn btn-danger fs-4 px-4 m-3"
                >
                    Reject
                </button>

                <button
                    type="button"
                    onClick={handleAccept}
                    disabled={!agree || submitting}
                    className={`btn btn-success fs-4 px-4 m-3 ${!agree || submitting ? "bg-grey-600 cursor-not-allowed" : "bg-grey-600 hover:bg-grey-700"
                        }`}
                >
                    {submitting ? "Saving..." : "Accept"}
                </button>
            </div>
        </div>
    );
};

export default TermsAndConditions;
