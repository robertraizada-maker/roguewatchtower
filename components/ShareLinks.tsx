"use client";

import { useMemo, useState } from "react";

interface ShareLinksProps {
    url: string;
    title: string;
    description: string;
    linkText: string;
}

function buildShareUrl(baseUrl: string, params: Record<string, string>) {
    const url = new URL(baseUrl);

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }

    return url.toString();
}

export default function ShareLinks({
    url,
    title,
    description,
    linkText,
}: ShareLinksProps) {
    const [copied, setCopied] = useState<"url" | "html" | "markdown" | null>(null);

    const htmlLink = useMemo(
        () => `<a href="${url}">${linkText}</a>`,
        [linkText, url]
    );

    const markdownLink = useMemo(
        () => `[${linkText}](${url})`,
        [linkText, url]
    );

    async function copy(value: string, type: "url" | "html" | "markdown") {
        await navigator.clipboard.writeText(value);
        setCopied(type);

        setTimeout(() => {
            setCopied(null);
        }, 2000);
    }

    const shareText = `${title} - ${description}`;
    const shareLinks = [
        {
            label: "X",
            href: buildShareUrl("https://twitter.com/intent/tweet", {
                text: title,
                url,
            }),
        },
        {
            label: "Facebook",
            href: buildShareUrl("https://www.facebook.com/sharer/sharer.php", {
                u: url,
            }),
        },
        {
            label: "Reddit",
            href: buildShareUrl("https://www.reddit.com/submit", {
                url,
                title,
            }),
        },
        {
            label: "WhatsApp",
            href: buildShareUrl("https://wa.me/", {
                text: `${shareText} ${url}`,
            }),
        },
    ];

    return (
        <section className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Share Rogue Watchtower
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Help other Pokemon TCG players discover rogue decks from real tournament results.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {shareLinks.map((shareLink) => (
                        <a
                            key={shareLink.label}
                            href={shareLink.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-10 items-center rounded-md border border-emerald-700 px-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 hover:underline"
                        >
                            {shareLink.label}
                        </a>
                    ))}

                    <button
                        type="button"
                        onClick={() => copy(url, "url")}
                        className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        {copied === "url" ? "Copied" : "Copy Link"}
                    </button>
                </div>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm font-medium text-slate-700">
                        Link to this page from your website
                    </p>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => copy(htmlLink, "html")}
                            className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            {copied === "html" ? "Copied HTML" : "Copy HTML"}
                        </button>

                        <button
                            type="button"
                            onClick={() => copy(markdownLink, "markdown")}
                            className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            {copied === "markdown" ? "Copied Markdown" : "Copy Markdown"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
