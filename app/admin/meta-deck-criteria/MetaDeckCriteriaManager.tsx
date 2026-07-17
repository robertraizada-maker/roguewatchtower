"use client";

import { useEffect, useMemo, useState } from "react";
import {
    formatOtherDeckTypeCriteria,
    parseOtherDeckTypeCriteria,
    type OtherDeckTypeCriterion,
} from "@/lib/other-deck-types";

interface MetaDeckCriterionRecord {
    id: string;
    archetype: string;
    criteria: OtherDeckTypeCriterion[];
    criteriaText?: string;
    createdAt?: string;
    expiresAt?: string;
}

type SaveStatus = "idle" | "loading" | "success" | "error";

function toDateInputValue(date: Date) {
    return date.toISOString().slice(0, 10);
}

function getUtcDateAfterDays(days: number) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() + days);
    return date;
}

function formatDate(value?: string) {
    if (!value) {
        return "Unknown";
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(value));
}

function getCriteriaText(record: MetaDeckCriterionRecord) {
    return record.criteriaText ?? formatOtherDeckTypeCriteria(record.criteria);
}

export default function MetaDeckCriteriaManager() {
    const [archetype, setArchetype] = useState("");
    const [criteriaText, setCriteriaText] = useState("");
    const [criteria, setCriteria] = useState<MetaDeckCriterionRecord[]>([]);
    const [status, setStatus] = useState<SaveStatus>("idle");
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const parsedCriteria = useMemo(
        () => parseOtherDeckTypeCriteria(criteriaText),
        [criteriaText]
    );
    const expiresAt = useMemo(() => getUtcDateAfterDays(28), []);
    const refreshDate = useMemo(() => getUtcDateAfterDays(-1), []);

    useEffect(() => {
        let isCancelled = false;

        async function loadCriteria() {
            try {
                setIsLoading(true);
                const response = await fetch("/admin/meta-deck-criteria/data");
                const data = (await response.json()) as {
                    success?: boolean;
                    criteria?: MetaDeckCriterionRecord[];
                    error?: string;
                };

                if (!response.ok || !data.success) {
                    throw new Error(data.error || "Failed to load criteria.");
                }

                if (!isCancelled) {
                    setCriteria(data.criteria ?? []);
                }
            } catch (error) {
                if (!isCancelled) {
                    setMessage(
                        error instanceof Error
                            ? error.message
                            : "Failed to load criteria."
                    );
                    setStatus("error");
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadCriteria();

        return () => {
            isCancelled = true;
        };
    }, []);

    async function saveCriteria() {
        const trimmedArchetype = archetype.trim();

        if (!trimmedArchetype || parsedCriteria.length === 0) {
            setStatus("error");
            setMessage("Add an archetype name and at least one valid criteria line.");
            return;
        }

        setStatus("loading");
        setMessage(null);

        try {
            const response = await fetch("/admin/meta-deck-criteria/data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    archetype: trimmedArchetype,
                    criteria: parsedCriteria,
                    criteriaText: formatOtherDeckTypeCriteria(parsedCriteria),
                    expiresAt: expiresAt.toISOString(),
                    refreshDate: toDateInputValue(refreshDate),
                }),
            });
            const data = (await response.json()) as {
                success?: boolean;
                criteria?: MetaDeckCriterionRecord[];
                message?: string;
                error?: string;
            };

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to save criteria.");
            }

            setCriteria(data.criteria ?? criteria);
            setArchetype("");
            setCriteriaText("");
            setStatus("success");
            setMessage(
                data.message ||
                    `Saved until ${formatDate(expiresAt.toISOString())}; yesterday has been queued for repopulation.`
            );
        } catch (error) {
            setStatus("error");
            setMessage(
                error instanceof Error ? error.message : "Failed to save criteria."
            );
        }
    }

    async function deleteCriteria(id: string) {
        setStatus("loading");
        setMessage(null);

        try {
            const response = await fetch(
                `/admin/meta-deck-criteria/data?id=${encodeURIComponent(id)}`,
                {
                    method: "DELETE",
                }
            );
            const data = (await response.json()) as {
                success?: boolean;
                criteria?: MetaDeckCriterionRecord[];
                error?: string;
            };

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to delete criteria.");
            }

            setCriteria(data.criteria ?? criteria.filter((item) => item.id !== id));
            setStatus("success");
            setMessage("Deleted.");
        } catch (error) {
            setStatus("error");
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to delete criteria."
            );
        }
    }

    return (
        <div className="mt-8 space-y-8">
            <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">
                        Add Meta Criteria
                    </h2>

                    {message && (
                        <div
                            className={`mt-4 rounded-md border px-3 py-2 text-sm font-semibold ${
                                status === "error"
                                    ? "border-red-200 bg-red-50 text-red-800"
                                    : "border-emerald-200 bg-emerald-50 text-emerald-900"
                            }`}
                        >
                            {message}
                        </div>
                    )}

                    <label className="mt-4 block text-sm font-semibold text-slate-700">
                        Archetype
                        <input
                            value={archetype}
                            onChange={(event) => setArchetype(event.target.value)}
                            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-700"
                        />
                    </label>

                    <label className="mt-4 block text-sm font-semibold text-slate-700">
                        Criteria
                        <textarea
                            value={criteriaText}
                            onChange={(event) => setCriteriaText(event.target.value)}
                            className="mt-2 min-h-44 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-emerald-700"
                        />
                    </label>

                    <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                        Parsed:{" "}
                        {parsedCriteria.length > 0
                            ? parsedCriteria
                                  .map(
                                      (criterion) =>
                                          `${criterion.minQuantity} ${criterion.pokemonName}`
                                  )
                                  .join(", ")
                            : "No valid criteria yet"}
                    </div>

                    <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                        Expires: {formatDate(expiresAt.toISOString())}
                        <br />
                        Refreshes: {toDateInputValue(refreshDate)}
                    </div>

                    <button
                        type="button"
                        onClick={saveCriteria}
                        disabled={status === "loading"}
                        className="mt-4 rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        {status === "loading" ? "Saving..." : "Save"}
                    </button>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">
                        Format
                    </h2>

                    <p className="mt-3 text-sm text-slate-600">
                        Use one Pokemon per line, with the minimum quantity first.
                    </p>

                    <pre className="mt-4 rounded-md bg-slate-950 p-4 text-sm leading-6 text-slate-100">
{`3 Ralts
2 Mega Gardevoir ex`}
                    </pre>

                    <p className="mt-4 text-sm text-slate-600">
                        The saved criteria will remain active for 28 days. When
                        saved, the API is asked to repopulate yesterday&apos;s deck
                        of the day so the public page reflects the new meta rule.
                    </p>
                </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                    <h2 className="text-xl font-bold text-slate-900">
                        Active Meta Criteria
                    </h2>
                </div>

                {isLoading ? (
                    <p className="p-5 text-sm text-slate-600">Loading criteria...</p>
                ) : criteria.length === 0 ? (
                    <p className="p-5 text-sm text-slate-600">
                        No active meta criteria found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse text-left text-sm">
                            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Criteria</th>
                                    <th className="px-4 py-3">Expires</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {criteria.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-4 font-bold text-slate-900">
                                            {item.archetype}
                                        </td>
                                        <td className="whitespace-pre-wrap px-4 py-4 font-mono text-slate-700">
                                            {getCriteriaText(item)}
                                        </td>
                                        <td className="px-4 py-4 text-slate-700">
                                            {formatDate(item.expiresAt)}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => deleteCriteria(item.id)}
                                                disabled={status === "loading"}
                                                className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

