"use client";

import { useMemo, useState } from "react";

type ActionStatus = "idle" | "pending" | "success" | "error";
type ActionKind = "import" | "delete";

function getYesterdayDate() {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().slice(0, 10);
}

export default function YesterdayImportCard() {
    const yesterday = useMemo(() => getYesterdayDate(), []);
    const [status, setStatus] = useState<ActionStatus>("idle");
    const [activeAction, setActiveAction] = useState<ActionKind | null>(null);
    const [message, setMessage] = useState("Ready to import or clear yesterday's data.");

    async function runAction(action: ActionKind) {
        const isDelete = action === "delete";

        setStatus("pending");
        setActiveAction(action);
        setMessage(isDelete ? "Deleting yesterday's data..." : "Importing yesterday's data...");

        try {
            const response = await fetch("/admin/import/yesterday", {
                method: isDelete ? "DELETE" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ date: yesterday }),
            });
            const data = (await response.json()) as {
                success?: boolean;
                message?: string;
                error?: string;
            };

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error ||
                        (isDelete
                            ? "Failed to delete yesterday's data."
                            : "Failed to import yesterday's data.")
                );
            }

            setStatus("success");
            setMessage(data.message || (isDelete ? "Deleted." : "Import started."));
        } catch (error) {
            setStatus("error");
            setMessage(
                error instanceof Error
                    ? error.message
                    : isDelete
                      ? "Failed to delete yesterday's data."
                      : "Failed to import yesterday's data."
            );
        } finally {
            setActiveAction(null);
        }
    }

    const isPending = status === "pending";

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Daily Import</h2>

            <p className="mt-3 text-slate-600">
                Import yesterday&apos;s Standard tournaments or delete yesterday&apos;s
                generated data before running a fresh import.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                    type="button"
                    onClick={() => runAction("import")}
                    disabled={isPending}
                    className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    {activeAction === "import" ? "Importing..." : "Import Yesterday"}
                </button>

                <button
                    type="button"
                    onClick={() => runAction("delete")}
                    disabled={isPending}
                    className="rounded-lg bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    {activeAction === "delete" ? "Deleting..." : "Delete Yesterday"}
                </button>
            </div>

            <div
                className={`mt-6 rounded-lg p-4 text-sm font-semibold ${
                    status === "error"
                        ? "bg-red-50 text-red-800"
                        : status === "success"
                          ? "bg-emerald-50 text-emerald-900"
                          : "bg-slate-50 text-slate-600"
                }`}
            >
                <span className="block text-xs uppercase text-slate-500">
                    {yesterday}
                </span>
                {message}
            </div>
        </div>
    );
}
