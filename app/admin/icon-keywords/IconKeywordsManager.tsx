"use client";

import { useMemo, useState } from "react";

import {
    defaultIgnoredIconKeywords,
    ICON_KEYWORDS_STORAGE_KEY,
    parseIgnoredIconKeywords,
} from "@/lib/icon-keywords";

function loadKeywordText() {
    if (typeof window === "undefined") {
        return defaultIgnoredIconKeywords.join("\n");
    }

    return parseIgnoredIconKeywords(
        window.localStorage.getItem(ICON_KEYWORDS_STORAGE_KEY)
    ).join("\n");
}

export default function IconKeywordsManager() {
    const [keywordText, setKeywordText] = useState(loadKeywordText);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const keywords = useMemo(
        () => keywordText
            .split(/\r?\n/)
            .map((keyword) => keyword.trim())
            .filter(Boolean),
        [keywordText]
    );

    function saveKeywords() {
        const keywordsToSave = keywords.length > 0
            ? keywords
            : defaultIgnoredIconKeywords;

        window.localStorage.setItem(
            ICON_KEYWORDS_STORAGE_KEY,
            JSON.stringify(keywordsToSave)
        );
        setKeywordText(keywordsToSave.join("\n"));
        setSaveStatus("Saved.");
    }

    function resetKeywords() {
        window.localStorage.removeItem(ICON_KEYWORDS_STORAGE_KEY);
        setKeywordText(defaultIgnoredIconKeywords.join("\n"));
        setSaveStatus("Reset to defaults.");
    }

    return (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">
                    Ignored Icon Keywords
                </h2>

                {saveStatus && (
                    <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
                        {saveStatus}
                    </div>
                )}

                <label className="mt-4 block text-sm font-semibold text-slate-700">
                    Keywords
                    <textarea
                        value={keywordText}
                        onChange={(event) => setKeywordText(event.target.value)}
                        className="mt-2 min-h-56 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-emerald-700"
                    />
                </label>

                <div className="mt-4 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={saveKeywords}
                        className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
                    >
                        Save Keywords
                    </button>

                    <button
                        type="button"
                        onClick={resetKeywords}
                        className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-900 hover:bg-slate-50"
                    >
                        Reset Defaults
                    </button>
                </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                    <h2 className="text-xl font-bold text-slate-900">
                        Ignored Keywords Table
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600">
                            <tr>
                                <th className="px-4 py-3">Keyword</th>
                                <th className="px-4 py-3">Match</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {keywords.length > 0 ? (
                                keywords.map((keyword) => (
                                    <tr key={keyword}>
                                        <td className="px-4 py-4 font-mono font-semibold text-slate-900">
                                            {keyword}
                                        </td>
                                        <td className="px-4 py-4 text-slate-700">
                                            Ignored as a whole word in deck names
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="px-4 py-4 text-slate-500" colSpan={2}>
                                        No keywords entered.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}