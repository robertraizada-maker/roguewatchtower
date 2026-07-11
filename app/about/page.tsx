export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900">
            <section className="mx-auto max-w-4xl px-6 py-16">
                <div
                    style={{
                        marginBottom: "24px",
                    }}
                >
                    <h1 className="text-4xl font-bold tracking-tight">
                        About Rogue Watchtower
                    </h1>

                    <p className="mt-4 leading-7 text-slate-700">
                        Rogue Watchtower is a place where creative deck building
                        is recognised and rewarded.
                    </p>

                    <p className="mt-4 leading-7 text-slate-700">
                        While most competitive Pokémon TCG tournaments are
                        dominated by established meta decks, remarkable players
                        continue to find success with innovative strategies.
                        Rogue Watchtower exists to celebrate those achievements
                        and shine a spotlight on the game's most creative deck
                        builders.
                    </p>
                </div>

                <div
                    style={{
                        marginBottom: "24px",
                    }}
                >
                    <h2 className="text-2xl font-bold">
                        How Rogue Deck of the Day is chosen
                    </h2>

                    <p className="mt-4 leading-7 text-slate-700">
                        Every day, tournament results published on{" "}
                        <a
                            href="https://play.limitlesstcg.com"
                            className="font-semibold text-blue-700 hover:underline"
                        >
                            Limitless
                        </a>{" "}
                        are analysed. The fifty most-played archetypes from the
                        previous 28 days are treated as the current metagame and
                        are excluded from consideration.
                    </p>

                    <p className="mt-4 leading-7 text-slate-700">
                        The remaining archetypes are ranked by their best
                        finishing percentage, calculated from their final
                        standing and the number of players in the tournament.
                        This allows performances from events of different sizes
                        to be compared fairly.
                    </p>

                    <p className="mt-4 leading-7 text-slate-700">
                        Only tournaments with at least 32 players are included,
                        and where multiple players achieve strong finishes with
                        the same rogue archetype, only the best-performing
                        result is used.
                    </p>
                </div>

                <div
                    style={{
                        marginBottom: "24px",
                    }}
                >
                    <h2 className="text-2xl font-bold">
                        The Outlaw Award
                    </h2>

                    <p className="mt-4 leading-7 text-slate-700">
                        The Outlaw Award is presented when the Rogue Deck of the
                        Day wins its tournament outright - a rogue deck defeating
                        the established metagame to claim first place.
                    </p>
                </div>

                <div
                    style={{
                        marginBottom: "24px",
                    }}
                >
                    <h2 className="text-2xl font-bold">
                        Contact
                    </h2>

                    <p className="mt-4 leading-7 text-slate-700">
                        Have a question, spotted an issue, or have an idea for
                        Rogue Watchtower? Feel free to get in touch on X at{" "}
                        <a
                            href="https://x.com/pysak1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-700 hover:underline"
                        >
                            @pysak1
                        </a>.
                    </p>
                </div>
            </section>
        </main>
    );
}