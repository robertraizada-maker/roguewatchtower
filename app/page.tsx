import Image from "next/image";

export default function Home() {
    return (
        <main className="min-h-screen bg-white text-slate-900">
            <section className="mx-auto max-w-6xl px-6 py-16">

                <div className="mb-10">
                    <Image
                        src="/images/logo.png"
                        alt="Rogue Watchtower"
                        width={600}
                        height={300}
                        priority
                    />
                </div>

                <h1 className="max-w-3xl text-5xl font-bold tracking-tight">
                    Discover rogue decks before they hit the meta.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                    Tracking recent Limitless tournament results to surface off-meta,
                    underplayed and emerging Pokémon TCG decks.
                </p>

                <div className="mt-12 grid gap-6 md:grid-cols-3">

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Emerging Decks
                        </h2>
                        <p className="mt-3 text-slate-600">
                            Find strong lists outside the Top 50 before they become mainstream.
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Weekly Results
                        </h2>
                        <p className="mt-3 text-slate-600">
                            Review rogue deck performance from tournaments over the last week.
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Deck Signals
                        </h2>
                        <p className="mt-3 text-slate-600">
                            Identify emerging archetypes before they appear in the established meta.
                        </p>
                    </div>

                </div>

            </section>
        </main>
    );
}