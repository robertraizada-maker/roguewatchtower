import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Footer() {
    return (
        <footer className="border-t mt-12">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                <span>Copyright {new Date().getFullYear()} Rogue Watchtower</span>
                <div className="flex flex-wrap items-center gap-4">
                    <ThemeToggle />
                    <nav className="flex gap-4">
                        <Link className="text-emerald-800 hover:underline" href="/about">
                            About
                        </Link>
                        <Link className="text-emerald-800 hover:underline" href="/privacy-policy">
                            Privacy Policy
                        </Link>
                        <Link className="text-emerald-800 hover:underline" href="/sitemap">
                            Sitemap
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
}