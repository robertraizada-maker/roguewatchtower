"use client";

import { useEffect, useMemo, useState } from "react";
import {
    defaultOtherDeckTypes,
    findMatchingOtherDeckType,
    formatOtherDeckTypeCriteria,
    normalisePokemonName,
    OTHER_DECK_TYPES_STORAGE_KEY,
    parseOtherDeckTypeCriteria,
    type OtherDeckType,
} from "@/lib/other-deck-types";
import type { AvailableDatesResponse, RogueDeckResponse } from "@/types/rogue";

interface EditableOtherDeckType {
    id: string;
    archetype: string;
    criteriaText: string;
}

interface OtherDeckCandidate {
    id: string;
    reportDate: string;
    dailyRank: number;
    playerName: string;
    tournamentName: string;
    standing: number;
    players: number;
    decklistExport: string | null;
}

interface PokemonCardLine {
    quantity: number;
    name: string;
}

const MAX_DATES_TO_SCAN = 28;

const initialDeckTypes: EditableOtherDeckType[] = defaultOtherDeckTypes.map(
    (deckType, index) => ({
        id: `seed-${index}-${deckType.archetype}`,
        archetype: deckType.archetype,
        criteriaText: formatOtherDeckTypeCriteria(deckType.criteria),
    })
);

function parsePokemonCardLine(line: string): PokemonCardLine | null {
    const match = /^(\d+)\s+(.+)$/.exec(line.trim());

    if (!match) {
        return null;
    }

    const cardText = match[2].trim();
    const cardParts = cardText.split(/\s+/);
    const maybeSetCode = cardParts.at(-2) ?? "";
    const maybeCardNumber = cardParts.at(-1) ?? "";
    const hasSetAndNumber =
        cardParts.length >= 3 &&
        /^[A-Z0-9]{2,8}$/i.test(maybeSetCode) &&
        /^[A-Z]*\d+[a-z]?(?:\/\d+)?$/i.test(maybeCardNumber);

    return {
        quantity: Number(match[1]),
        name: hasSetAndNumber ? cardParts.slice(0, -2).join(" ") : cardText,
    };
}

function getPokemonLines(decklistExport: string | null) {
    if (!decklistExport) {
        return [];
    }

    const lines = decklistExport.split(/\r?\n/);
    const pokemonHeaderIndex = lines.findIndex((line) =>
        /^pok.mon:/i.test(line.trim())
    );

    if (pokemonHeaderIndex === -1) {
        return [];
    }

    const pokemonLines: string[] = [];

    for (const line of lines.slice(pokemonHeaderIndex + 1)) {
        const trimmed = line.trim();

        if (!trimmed) {
            continue;
        }

        if (/^(trainer|energy):/i.test(trimmed)) {
            break;
        }

        pokemonLines.push(trimmed);
    }

    return pokemonLines;
}

function getPokemonCounts(decklistExport: string | null) {
    const counts = new Map<string, number>();

    getPokemonLines(decklistExport)
        .map(parsePokemonCardLine)
        .filter((card): card is PokemonCardLine => card !== null)
        .forEach((card) => {
            const name = normalisePokemonName(card.name);
            counts.set(name, (counts.get(name) ?? 0) + card.quantity);
        });

    return counts;
}

function toDeckType(deckType: EditableOtherDeckType): OtherDeckType | null {
    const archetype = deckType.archetype.trim();
    const criteria = parseOtherDeckTypeCriteria(deckType.criteriaText);

    if (!archetype || criteria.length === 0) {
        return null;
    }

    return {
        archetype,
        criteria,
    };
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00Z`));
}

function getCandidateId(candidate: Omit<OtherDeckCandidate, "id">) {
    return [
        candidate.reportDate,
        candidate.dailyRank,
        candidate.playerName,
        candidate.tournamentName,
    ].join("|");
}

function loadStoredDeckTypes() {
    if (typeof window === "undefined") {
        return initialDeckTypes;
    }

    const storedValue = window.localStorage.getItem(OTHER_DECK_TYPES_STORAGE_KEY);

    if (!storedValue) {
        return initialDeckTypes;
    }

    try {
        const parsedValue = JSON.parse(storedValue) as EditableOtherDeckType[];

        if (!Array.isArray(parsedValue)) {
            return initialDeckTypes;
        }

        return parsedValue;
    } catch {
        return initialDeckTypes;
    }
}

export default function OtherDeckTypesManager() {
    const [deckTypes, setDeckTypes] = useState<EditableOtherDeckType[]>(loadStoredDeckTypes);
    const [archetype, setArchetype] = useState("");
    const [criteriaText, setCriteriaText] = useState("");
    const [candidates, setCandidates] = useState<OtherDeckCandidate[]>([]);
    const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);


    useEffect(() => {
        window.localStorage.setItem(OTHER_DECK_TYPES_STORAGE_KEY, JSON.stringify(deckTypes));
    }, [deckTypes]);

    useEffect(() => {
        let isCancelled = false;

        async function loadCandidates() {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

            if (!baseUrl) {
                setLoadError("NEXT_PUBLIC_API_BASE_URL is not configured.");
                setIsLoadingCandidates(false);
                return;
            }

            try {
                setIsLoadingCandidates(true);
                setLoadError(null);

                const datesResponse = await fetch(`${baseUrl}/meta/available-dates`);

                if (!datesResponse.ok) {
                    throw new Error("Failed to load available dates.");
                }

                const datesData = (await datesResponse.json()) as AvailableDatesResponse;
                const dates = (datesData.dates ?? []).slice(0, MAX_DATES_TO_SCAN);
                const dailyResults = await Promise.all(
                    dates.map(async (date) => {
                        const response = await fetch(`${baseUrl}/meta/rogue?date=${date}`);

                        if (!response.ok) {
                            throw new Error(`Failed to load rogue decks for ${date}.`);
                        }

                        const data = (await response.json()) as RogueDeckResponse;
                        return { date, decks: data.rogueDecks ?? [] };
                    })
                );

                if (isCancelled) {
                    return;
                }

                setCandidates(
                    dailyResults.flatMap(({ date, decks }) =>
                        decks
                            .map((deck, index) => ({ deck, index }))
                            .filter(({ deck }) => deck.deck_name === "Other")
                            .map(({ deck, index }) => {
                                const candidate = {
                                    reportDate: date,
                                    dailyRank: index + 1,
                                    playerName: deck.player_name,
                                    tournamentName: deck.tournament_name,
                                    standing: deck.standing,
                                    players: deck.tournament_players,
                                    decklistExport: deck.decklist_export,
                                };

                                return {
                                    ...candidate,
                                    id: getCandidateId(candidate),
                                };
                            })
                    )
                );
            } catch (error) {
                if (!isCancelled) {
                    setLoadError(
                        error instanceof Error
                            ? error.message
                            : "Failed to load Other decks."
                    );
                }
            } finally {
                if (!isCancelled) {
                    setIsLoadingCandidates(false);
                }
            }
        }

        loadCandidates();

        return () => {
            isCancelled = true;
        };
    }, []);

    const validDeckTypes = useMemo(
        () => deckTypes.map(toDeckType).filter((deckType): deckType is OtherDeckType => deckType !== null),
        [deckTypes]
    );

    const unclassifiedCandidates = useMemo(
        () =>
            candidates.filter(
                (candidate) =>
                    !findMatchingOtherDeckType(
                        getPokemonCounts(candidate.decklistExport),
                        validDeckTypes
                    )
            ),
        [candidates, validDeckTypes]
    );

    const nextCandidate = unclassifiedCandidates[0] ?? null;

    const parsedCriteria = useMemo(
        () => parseOtherDeckTypeCriteria(criteriaText),
        [criteriaText]
    );

    const pokemonLines = useMemo(
        () =>
            getPokemonLines(nextCandidate?.decklistExport ?? null)
                .map(parsePokemonCardLine)
                .filter((card): card is PokemonCardLine => card !== null)
                .map((card) => `${card.quantity} ${card.name}`),
        [nextCandidate]
    );

    function saveDeckType() {
        const trimmedArchetype = archetype.trim();

        if (!trimmedArchetype || parsedCriteria.length === 0) {
            setSaveStatus("Add an archetype name and at least one valid criteria line.");
            return;
        }

        setDeckTypes((currentDeckTypes) => [
            ...currentDeckTypes,
            {
                id: `saved-${Date.now()}`,
                archetype: trimmedArchetype,
                criteriaText: formatOtherDeckTypeCriteria(parsedCriteria),
            },
        ]);
        setArchetype("");
        setCriteriaText("");
        setSaveStatus("Saved. Matching decks have been removed from the queue.");
    }

    function deleteDeckType(id: string) {
        setDeckTypes((currentDeckTypes) =>
            currentDeckTypes.filter((deckType) => deckType.id !== id)
        );
        setSaveStatus("Deleted");
    }

    return (
        <div className="mt-8 space-y-8">
            <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">Next Other Deck</h2>

                    {saveStatus && (
                        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
                            {saveStatus}
                        </div>
                    )}

                    {!isLoadingCandidates && (
                        <p className="mt-4 text-sm text-slate-600">
                            {unclassifiedCandidates.length} Other decks left to review.
                        </p>
                    )}

                    <label className="mt-4 block text-sm font-semibold text-slate-700">
                        Archetype
                        <input
                            value={archetype}
                            onChange={(event) => setArchetype(event.target.value)}
                            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-700"
                        />
                    </label>

                    <label className="mt-4 block text-sm font-semibold text-slate-700">
                        Criteria
                        <textarea
                            value={criteriaText}
                            onChange={(event) => setCriteriaText(event.target.value)}
                            className="mt-2 min-h-44 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-emerald-700"
                        />
                    </label>

                    <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                        Parsed: {parsedCriteria.length > 0
                            ? parsedCriteria
                                  .map(
                                      (criterion) =>
                                          `${criterion.minQuantity} ${criterion.pokemonName}`
                                  )
                                  .join(", ")
                            : "No valid criteria yet"}
                    </div>

                    <button
                        type="button"
                        onClick={saveDeckType}
                        disabled={!nextCandidate}
                        className="mt-4 rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        Save
                    </button>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    {isLoadingCandidates ? (
                        <p className="text-sm text-slate-600">Loading Other decks...</p>
                    ) : loadError ? (
                        <p className="text-sm font-semibold text-red-700">{loadError}</p>
                    ) : nextCandidate ? (
                        <>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Other deck to classify
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {formatDate(nextCandidate.reportDate)} - Daily rank #{nextCandidate.dailyRank}
                                    </p>
                                </div>

                                <div className="rounded-md bg-slate-50 px-3 py-2 text-right text-sm text-slate-700">
                                    <div>{nextCandidate.standing} of {nextCandidate.players}</div>
                                    <div>{nextCandidate.playerName}</div>
                                </div>
                            </div>

                            <p className="mt-4 text-sm font-semibold text-emerald-900">
                                {nextCandidate.tournamentName}
                            </p>

                            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700">Pokemon</h3>
                                    <div className="mt-2 rounded-md bg-slate-50 p-3 font-mono text-sm text-slate-800">
                                        {pokemonLines.length > 0 ? (
                                            pokemonLines.map((line) => <div key={line}>{line}</div>)
                                        ) : (
                                            <span className="text-slate-500">No Pokemon section found.</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-slate-700">Full deck list</h3>
                                    <pre className="mt-2 max-h-[32rem] overflow-auto rounded-md bg-slate-950 p-4 text-sm leading-6 text-slate-100">
                                        {nextCandidate.decklistExport ?? "Decklist unavailable."}
                                    </pre>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm font-semibold text-emerald-900">
                            No unclassified Other decks found in the latest {MAX_DATES_TO_SCAN} competition dates.
                        </p>
                    )}
                </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                    <h2 className="text-xl font-bold text-slate-900">Saved Other Archetypes</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Criteria</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {deckTypes.map((deckType) => (
                                <tr key={deckType.id}>
                                    <td className="px-4 py-4 font-bold text-slate-900">
                                        {deckType.archetype}
                                    </td>
                                    <td className="whitespace-pre-wrap px-4 py-4 font-mono text-slate-700">
                                        {deckType.criteriaText}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => deleteDeckType(deckType.id)}
                                            className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
