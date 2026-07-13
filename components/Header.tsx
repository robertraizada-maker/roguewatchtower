"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
    { href: "/", label: "Decks of the Day" },
    { href: "/rogue-pokemon-tcg-decks", label: "All Decks" },
    { href: "/rogue-ranking", label: "Rogue Ranking" },
];

function SearchIcon() {
    return (
        <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
        >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </svg>
    );
}

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="border-b border-gray-200 bg-white text-gray-950">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 md:py-4">
                <Link
                    href="/"
                    className="shrink-0"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <Image
                        src="/images/pokemon-tcg-rogue-decks-rogue-watchtower.png"
                        alt="Pokémon TCG Rogue Decks - Rogue Watchtower"
                        title="Pokémon TCG Rogue Decks - Rogue Watchtower"
                        width={250}
                        height={125}
                        className="h-auto w-32 sm:w-52 md:w-56"
                        priority
                        unoptimized
                    />
                </Link>

                <div className="flex items-center gap-2 md:hidden">
                    <Link
                        href="/search"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-emerald-900 shadow-sm"
                        aria-label="Search"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <SearchIcon />
                    </Link>

                    <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-emerald-900 shadow-sm"
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMenuOpen}
                        aria-controls="site-menu"
                        onClick={() => setIsMenuOpen((open) => !open)}
                    >
                        <span className="sr-only">
                            {isMenuOpen ? "Close menu" : "Open menu"}
                        </span>
                        <span className="flex h-5 w-5 flex-col justify-center gap-1.5">
                            <span className={`block h-0.5 w-5 rounded bg-current transition ${isMenuOpen ? "translate-y-2 rotate-45" : ""}`} />
                            <span className={`block h-0.5 w-5 rounded bg-current transition ${isMenuOpen ? "opacity-0" : ""}`} />
                            <span className={`block h-0.5 w-5 rounded bg-current transition ${isMenuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
                        </span>
                    </button>
                </div>

                <nav className="hidden items-center gap-4 text-base font-medium md:flex lg:gap-8 lg:text-lg">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            className="text-emerald-800 hover:underline"
                            href={link.href}
                        >
                            {link.label}
                        </Link>
                    ))}

                    <Link
                        href="/search"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-emerald-900 shadow-sm transition hover:border-emerald-700 hover:bg-emerald-50"
                        aria-label="Search"
                    >
                        <SearchIcon />
                    </Link>
                </nav>
            </div>

            <nav
                id="site-menu"
                className={`${isMenuOpen ? "block" : "hidden"} border-t border-gray-200 bg-white px-4 py-2 shadow-sm md:hidden`}
            >
                <div className="mx-auto flex max-w-7xl flex-col">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            className="rounded-md px-3 py-2 text-base font-semibold text-emerald-900 hover:bg-emerald-50"
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </nav>
        </header>
    );
}
