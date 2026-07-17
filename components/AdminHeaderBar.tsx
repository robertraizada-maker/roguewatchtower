"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const adminLinks = [
    { href: "/admin", label: "Admin" },
    { href: "/admin/imports", label: "Manage Imports" },
    { href: "/admin/meta-deck-criteria", label: "Meta Criteria" },
    { href: "/admin/other-deck-types", label: "Other Deck Types" },
    { href: "/admin/icon-keywords", label: "Icon Keywords" },
];

export default function AdminHeaderBar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        let isCancelled = false;

        async function checkSession() {
            try {
                const response = await fetch("/admin/session", {
                    cache: "no-store",
                });
                const data = (await response.json()) as {
                    authenticated?: boolean;
                };

                if (!isCancelled) {
                    setIsAuthenticated(Boolean(response.ok && data.authenticated));
                }
            } catch {
                if (!isCancelled) {
                    setIsAuthenticated(false);
                }
            }
        }

        checkSession();

        return () => {
            isCancelled = true;
        };
    }, []);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="border-b border-emerald-900 bg-emerald-950 text-white">
            <nav className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-2 text-sm font-semibold sm:px-6">
                {adminLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="shrink-0 rounded px-2 py-1 text-emerald-50 hover:bg-emerald-800 hover:text-white"
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}