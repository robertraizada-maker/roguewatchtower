import type { Metadata } from "next";
import Link from "next/link";
import { getPlayers } from "@/lib/players";
import { formatPlayerDate, getPlayerMedal } from "@/lib/player-standings";

export const metadata: Metadata = {
    title: "Players",
    description: "The players behind the daily top five rogue decks, ranked by points over the last 28 days.",
    alternates: { canonical: "/players" },
};

export default async function PlayersPage() {
    const { players, window } = await getPlayers();
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold sm:text-4xl">Players</h1>
                <p className="mt-3 text-slate-600">The players behind the top five Decks of the Day, ranked by their total points over the last 28 days.</p>
                {window && <p className="mt-2 text-sm text-slate-500">{formatPlayerDate(window.startDate)} – {formatPlayerDate(window.endDate)}</p>}
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                <h2 className="font-semibold">Points per daily appearance</h2>
                <p className="mt-2 text-slate-600">🥇 1st: 8 · 🥈 2nd: 5 · 🥉 3rd: 3 · 4th: 2 · 5th: 1</p>
                <p className="mt-2 text-sm text-slate-500">Points and best finish reflect the Decks of the Day position, not tournament placing. Equal points are decided by best finish, then most recent appearance. Every player has a unique rank.</p>
            </div>
            {players.length === 0 ? <p className="rounded-xl border border-gray-200 bg-white p-6 text-slate-600">No featured players in this period yet.</p> : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full text-left text-sm sm:text-base">
                        <caption className="sr-only">Players ranked by points over the last 28 days, highest first</caption>
                        <thead className="border-b border-gray-200 bg-slate-50 text-slate-600">
                            <tr>
                                <th scope="col" className="px-3 py-4 sm:px-5">Rank</th>
                                <th scope="col" className="px-3 py-4 sm:px-5">Player</th>
                                <th scope="col" className="px-3 py-4 text-right sm:px-5">Points</th>
                                <th scope="col" className="px-3 py-4 text-right sm:px-5">Best finish</th>
                                <th scope="col" className="px-3 py-4 text-right sm:px-5">Appearances</th>
                                <th scope="col" className="px-3 py-4 text-right sm:px-5">1st places</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {players.map((player) => (
                                <tr key={player.id} className="hover:bg-emerald-50">
                                    <td className="whitespace-nowrap px-3 py-4 font-semibold sm:px-5"><span aria-hidden="true">{getPlayerMedal(player.rank)} </span>{player.rank}</td>
                                    <th scope="row" className="min-w-40 px-3 py-4 font-semibold sm:px-5"><Link className="text-emerald-800 hover:underline" href={`/player/${player.slug}`}>{player.name}</Link></th>
                                    <td className="px-3 py-4 text-right font-bold tabular-nums sm:px-5">{player.points}</td>
                                    <td className="px-3 py-4 text-right tabular-nums sm:px-5">#{player.bestFinish}</td>
                                    <td className="px-3 py-4 text-right tabular-nums sm:px-5">{player.decks.length}</td>
                                    <td className="px-3 py-4 text-right tabular-nums sm:px-5">{player.wins}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
