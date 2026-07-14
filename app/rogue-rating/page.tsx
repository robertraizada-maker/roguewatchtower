import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Rogue Rating",
    description:
        "Learn how Rogue Watchtower assigns Rogue Rating stars to Pokemon TCG rogue decks.",
};

const ratingRows = [
    {
        stars: "1 star",
        popularity: "51st to 60th most-played archetype",
        meaning: "A fringe deck that is still close to the edge of the metagame.",
    },
    {
        stars: "2 stars",
        popularity: "61st to 70th most-played archetype",
        meaning: "A less common choice, but one that still appears regularly.",
    },
    {
        stars: "3 stars",
        popularity: "71st to 80th most-played archetype",
        meaning: "A clearly rogue pick with some recent tournament presence.",
    },
    {
        stars: "4 stars",
        popularity: "81st to 90th most-played archetype",
        meaning: "A rare deck that has been barely represented lately.",
    },
    {
        stars: "5 stars",
        popularity: "91st or lower",
        meaning: "A deep rogue find with very little recent play.",
    },
];

export default function RogueRatingPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900">
            <section className="mx-auto max-w-4xl px-6 py-16">
                <h1 className="text-4xl font-bold tracking-tight">
                    Rogue Rating
                </h1>

                <p className="mt-4 leading-7 text-slate-700">
                    Rogue Rating is Rogue Watchtower&apos;s star score for how
                    unusual a successful deck is. It helps separate decks that
                    are just outside the main metagame from the strange,
                    creative, low-play picks that make rogue results exciting.
                </p>

                <p className="mt-4 leading-7 text-slate-700">
                    The rating is based on the preceding 28 days of tournament
                    data. Because of that, decks with the same name can change
                    Rogue Rating over time as they become more or less popular.
                    If a deck starts seeing more play, its rating may go down.
                    If it fades from the metagame but still earns a strong
                    finish, its rating may go up.
                </p>

                <section className="mt-10">
                    <h2 className="text-2xl font-bold">
                        How the stars are assigned
                    </h2>

                    <p className="mt-4 leading-7 text-slate-700">
                        The top 50 most-played archetypes from the previous 28
                        days are treated as the current metagame. Rogue Rating
                        starts after that cutoff.
                    </p>

                    <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
                        <table className="min-w-full border-collapse text-left text-sm">
                            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600">
                                <tr>
                                    <th className="px-4 py-3">Rating</th>
                                    <th className="px-4 py-3">
                                        Recent popularity rank
                                    </th>
                                    <th className="px-4 py-3">What it means</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {ratingRows.map((row) => (
                                    <tr key={row.stars}>
                                        <td className="whitespace-nowrap px-4 py-4 font-bold text-slate-950">
                                            {row.stars}
                                        </td>
                                        <td className="px-4 py-4 text-slate-700">
                                            {row.popularity}
                                        </td>
                                        <td className="px-4 py-4 text-slate-700">
                                            {row.meaning}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </section>
        </main>
    );
}