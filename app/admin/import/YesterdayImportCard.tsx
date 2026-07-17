"use client";

import Link from "next/link";
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

type LoadStatus = "loading" | "success" | "error";

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(value));
}

function formatDateTime(value: string) {
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

function getStatusTone(importRun: ImportRunSummary | null, status: LoadStatus) {
    if (status === "error") {
        return "bg-red-50 text-red-800";
    }

    if (!importRun) {
        return "bg-slate-50 text-slate-600";
    }

    if (importRun.status === "Completed" || importRun.success === 1) {
        return "bg-emerald-50 text-emerald-900";
    }

    if (importRun.status === "Failed" || importRun.errorMessage) {
        return "bg-red-50 text-red-800";
    }

    return "bg-amber-50 text-amber-900";
}

export default function YesterdayImportCard() {
    const [latestImport, setLatestImport] = useState<ImportRunSummary | null>(null);
    const [status, setStatus] = useState<LoadStatus>("loading");
    const [message, setMessage] = useState("Loading latest import status...");

    useEffect(() => {
        let isCancelled = false;

        async function loadLatestImport() {
            try {
                setStatus("loading");
                const response = await fetch("/admin/imports/data?limit=1");
                const data = (await response.json()) as {
                    success?: boolean;
                    latestImport?: ImportRunSummary | null;
                    error?: string;
                };

                if (!response.ok || !data.success) {
                    throw new Error(data.error || "Failed to load import status.");
                }

                if (!isCancelled) {
                    setLatestImport(data.latestImport ?? null);
                    setStatus("success");
                    setMessage(
                        data.latestImport
                            ? data.latestImport.errorMessage || data.latestImport.status
                            : "No imports found."
                    );
                }
            } catch (error) {
                if (!isCancelled) {
                    setStatus("error");
                    setMessage(
                        error instanceof Error
                            ? error.message
                            : "Failed to load import status."
                    );
                }
            }
        }

        loadLatestImport();

        return () => {
            isCancelled = true;
        };
    }, []);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Daily Import</h2>

            <p className="mt-3 text-slate-600">
                Review the most recent import status and open the import history to
                manage individual report dates.
            </p>

            <div className={`mt-6 rounded-lg p-4 text-sm font-semibold ${getStatusTone(latestImport, status)}`}>
                {latestImport ? (
                    <>
                        <span className="block text-xs uppercase text-slate-500">
                            {formatDate(latestImport.reportDate)}
                        </span>
                        <span className="block text-base text-slate-950">
                            {latestImport.status}
                        </span>
                        <span className="mt-1 block font-normal text-slate-700">
                            Started {formatDateTime(latestImport.startedAt)}
                            {latestImport.completedAt
                                ? `; completed ${formatDateTime(latestImport.completedAt)}`
                                : ""}
                        </span>
                        <span className="mt-2 block font-normal text-slate-700">
                            {latestImport.tournamentsAfterFilter} tournaments imported from {latestImport.totalFetched} fetched.
                        </span>
                        {latestImport.errorMessage && (
                            <span className="mt-2 block text-red-800">
                                {latestImport.errorMessage}
                            </span>
                        )}
                    </>
                ) : (
                    message
                )}
            </div>

            <Link
                href="/admin/imports"
                className="mt-6 inline-block rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
            >
                Manage Imports
            </Link>
        </div>
    );
}