"use client";

import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "roguewatchtower:theme";
type Theme = "light" | "dark";

function getStoredTheme(): Theme {
    if (typeof window === "undefined") {
        return "light";
    }

    return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark"
        ? "dark"
        : "light";
}

function applyTheme(theme: Theme) {
    document.documentElement.dataset.theme = theme;
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(getStoredTheme);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    function chooseTheme(nextTheme: Theme) {
        setTheme(nextTheme);
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    }

    return (
        <div className="flex items-center gap-2">
            <span>Theme</span>
            <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5">
                {(["light", "dark"] as const).map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => chooseTheme(option)}
                        aria-pressed={theme === option}
                        className={`rounded px-2 py-1 text-xs font-bold capitalize transition ${
                            theme === option
                                ? "bg-emerald-800 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}