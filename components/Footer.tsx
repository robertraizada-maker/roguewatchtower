import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t mt-12">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                <span>Copyright {new Date().getFullYear()} Rogue Watchtower</span>
                <nav>
                    <Link className="text-emerald-800 hover:underline" href="/sitemap">
                        Sitemap
                    </Link>
                </nav>
            </div>
        </footer>
    );
}