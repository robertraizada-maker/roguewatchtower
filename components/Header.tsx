import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <header className="border-b bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                <Link href="/">
                    <Image
                        src="/images/logo.png"
                        alt="RogueWatchtower"
                        width={250}
                        height={125}
                        priority
                        unoptimized
                    />
                </Link>

                <nav className="flex gap-8 text-lg font-medium">
                    <Link className="text-emerald-800 hover:underline" href="/">Decks of the Day</Link>
                    <Link className="text-emerald-800 hover:underline" href="/about">About</Link>
                </nav>

            </div>
        </header>
    );
}