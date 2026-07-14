"use client";

import { useState } from "react";

type DeployStatus = "idle" | "pending" | "success" | "error";

export default function AdminRedeployButton() {
    const [status, setStatus] = useState<DeployStatus>("idle");
    const [message, setMessage] = useState<string | null>(null);

    async function redeploy() {
        setStatus("pending");
        setMessage(null);

        try {
            const response = await fetch("/admin/redeploy", {
                method: "POST",
            });
            const data = (await response.json()) as {
                success?: boolean;
                message?: string;
                error?: string;
            };

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Redeploy failed.");
            }

            setStatus("success");
            setMessage(data.message || "Redeploy started.");
        } catch (error) {
            setStatus("error");
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Redeploy failed."
            );
        }
    }

    return (
        <div className="mt-6">
            <button
                type="button"
                onClick={redeploy}
                disabled={status === "pending"}
                className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
                {status === "pending" ? "Starting redeploy..." : "Redeploy App"}
            </button>

            {message && (
                <p
                    className={`mt-3 text-sm font-semibold ${
                        status === "error" ? "text-red-700" : "text-emerald-800"
                    }`}
                >
                    {message}
                </p>
            )}
        </div>
    );
}