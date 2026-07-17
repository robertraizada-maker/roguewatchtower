"use client";

import { useEffect, useState } from "react";

interface ImportRunSummary {
    id: number;
    reportDate: string;
    startedAt: string;
    completedAt: string | null;
    status: string;
    success: number;
    errorMessage: string | null;
    elapsedMs: number | null;
    totalFetched: number;
    tournamentsAfterFilter: number;
    tournamentsInserted: number;
    tournamentsUpdated: number;
}

type LoadStatus = "loading" | "success" | "error" | "deleting";

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(value));
}

function formatDateTime(value: string | null) {
    if (!value) {
        return "-";
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
    }).format(new Date(value));
}

function formatDuration(milliseconds: number | null) {
    if (milliseconds === null) {
        return "-";
    }

    const seconds = Math.round(milliseconds / 1000);

    if (seconds < 60) {
        return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

function getStatusClasses(importRun: ImportRunSummary) {
    if (importRun.status === "Completed" || importRun.success === 1) {
        return "bg-emerald-50 text-emerald-800";
    }

    if (importRun.status === "Failed" || importRun.errorMessage) {
        return "bg-red-50 text-red-800";
    }

    return "bg-amber-50 text-amber-900";
}

export default function ImportHistoryManager() {
    const [imports, setImports] = useState<ImportRunSummary[]>([]);
    const [status, setStatus] = useState<LoadStatus>("loading");
    const [message, setMessage] = useState<string | null>(null);
    const [deletingDate, setDeletingDate] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;

        async function loadImports() {
            try {
                setStatus("loading");
                const response = await fetch("/admin/imports/data");
                const data = (await response.json()) as {
                    success?: boolean;
                    imports?: ImportRunSummary[];
                    error?: string;
                };

                if (!response.ok || !data.success) {
                    throw new Error(data.error || "Failed to load imports.");
                }

                if (!isCancelled) {
                    setImports(data.imports ?? []);
                    setStatus("success");
                    setMessage(null);
                }
            } catch (error) {
                if (!isCancelled) {
                    setStatus("error");
                    setMessage(
                        error instanceof Error ? error.message : "Failed to load imports."
                    );
                }
            }
        }

        loadImports();

        return () => {
            isCancelled = true;
        };
    }, []);

    async function deleteImport(reportDate: string) {
        setStatus("deleting");
        setDeletingDate(reportDate);
        setMessage(null);

        try {
            const response = await fetch(
                `/admin/imports/data?date=${encodeURIComponent(reportDate)}`,
                { method: "DELETE" }
            );
            const data = (await response.json()) as {
                success?: boolean;
                imports?: ImportRunSummary[];
                message?: string;
                error?: string;
            };

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to delete import.");
            }

            setImports(data.imports ?? imports.filter((item) => item.reportDate !== reportDate));
            setStatus("success");
            setMessage(data.message || `Deleted import data for ${reportDate}.`);
        } catch (error) {
            setStatus("error");
            setMessage(
                error instanceof Error ? error.message : "Failed to delete import."
            );
        } finally {
            setDeletingDate(null);
        }
    }

    return (
        <section className="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
                <h2 className="text-xl font-bold text-slate-900">Import History</h2>
            </div>

            {message && (
                <div
                    className={`m-5 rounded-md border px-3 py-2 text-sm font-semibold ${
                        status === "error"
                            ? "border-red-200 bg-red-50 text-red-800"
                            : "border-emerald-200 bg-emerald-50 text-emerald-900"
                    }`}
                >
                    {message}
                </div>
            )}

            {status === "loading" ? (
                <p className="p-5 text-sm text-slate-600">Loading imports...</p>
            ) : imports.length === 0 ? (
                <p className="p-5 text-sm text-slate-600">No imports found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600">
                            <tr>
                                <th className="px-4 py-3">Report Date</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Started</th>
                                <th className="px-4 py-3">Duration</th>
                                <th className="px-4 py-3">Tournaments</th>
                                <th className="px-4 py-3">Updated</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {imports.map((importRun) => (
                                <tr key={importRun.reportDate}>
                                    <td className="px-4 py-4 font-bold text-slate-900">
                                        {formatDate(importRun.reportDate)}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClasses(importRun)}`}>
                                            {importRun.status}
                                        </span>
                                        {importRun.errorMessage && (
                                            <p className="mt-2 max-w-xs text-xs text-red-700">
                                                {importRun.errorMessage}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-slate-700">
                                        {formatDateTime(importRun.startedAt)}
                                    </td>
                                    <td className="px-4 py-4 text-slate-700">
                                        {formatDuration(importRun.elapsedMs)}
                                    </td>
                                    <td className="px-4 py-4 text-slate-700">
                                        {importRun.tournamentsAfterFilter} of {importRun.totalFetched}
                                    </td>
                                    <td className="px-4 py-4 text-slate-700">
                                        {importRun.tournamentsInserted} new, {importRun.tournamentsUpdated} updated
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => deleteImport(importRun.reportDate)}
                                            disabled={status === "deleting"}
                                            className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                                        >
                                            {deletingDate === importRun.reportDate ? "Deleting..." : "Delete"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}