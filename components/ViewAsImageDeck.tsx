"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface StoredDeckImage {
    archetype?: string;
    player?: string;
    tournament?: string;
    decklist: string;
}

interface ParsedCard {
    key: string;
    quantity: number;
    name: string;
    set: string;
    number: string;
    section: string;
}

const STORAGE_KEY = "roguewatchtower:view-as-image";
const IMAGE_BASE_URL = "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/tpci";

const RARITY_CANDIDATES: Record<string, string[]> = {
    Pokemon: ["R", "RR", "RRR", "C", "U", "AR", "SR", "SAR", "UR", "ACE"],
    Trainer: ["U", "C", "R", "ACE", "SR", "SAR", "UR"],
    Energy: ["R", "U", "C", "SR", "UR"],
};

function parseDecklist(decklist: string): ParsedCard[] {
    let section = "Pokemon";

    return decklist
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .flatMap((line) => {
            const sectionMatch = line.match(/^([^:]+):/);

            if (sectionMatch) {
                const sectionName = sectionMatch[1].toLowerCase();

                if (sectionName.startsWith("pok")) {
                    section = "Pokemon";
                } else if (sectionName.startsWith("trainer")) {
                    section = "Trainer";
                } else if (sectionName.startsWith("energy")) {
                    section = "Energy";
                }

                return [];
            }

            const cardMatch = line.match(/^(\d+)\s+(.+)\s+([A-Z0-9]{2,5})\s+([A-Z]*\d+[a-z]?)$/);

            if (!cardMatch) {
                return [];
            }

            const [, quantity, name, set, number] = cardMatch;

            return [{
                key: `${set}-${number}-${name}`,
                quantity: Number(quantity),
                name,
                set,
                number,
                section,
            }];
        });
}

function formatCardNumber(number: string) {
    const match = number.match(/^(\D*)(\d+)(.*)$/);

    if (!match) {
        return number;
    }

    const [, prefix, digits, suffix] = match;
    return `${prefix}${digits.padStart(3, "0")}${suffix}`;
}

function getImageCandidates(card: ParsedCard) {
    const rarities = RARITY_CANDIDATES[card.section] ?? RARITY_CANDIDATES.Pokemon;
    const number = formatCardNumber(card.number);

    return rarities.map(
        (rarity) => `${IMAGE_BASE_URL}/${card.set}/${card.set}_${number}_${rarity}_EN_XS.png`
    );
}

function getLimitlessCardUrl(card: ParsedCard) {
    return `https://limitlesstcg.com/cards/${card.set}/${card.number}`;
}

function CardTile({ card }: { card: ParsedCard }) {
    const candidates = useMemo(() => getImageCandidates(card), [card]);
    const [candidateIndex, setCandidateIndex] = useState(0);
    const imageUrl = candidates[candidateIndex];
    const hasImage = Boolean(imageUrl);

    return (
        <a
            href={getLimitlessCardUrl(card)}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block overflow-hidden rounded-md bg-slate-900 shadow-md transition hover:brightness-110"
            aria-label={`Open ${card.name} on Limitless`}
        >
            {hasImage ? (
                <Image
                    src={imageUrl}
                    alt={`${card.quantity} ${card.name}`}
                    width={245}
                    height={342}
                    className="block w-full"
                    unoptimized
                    onError={() => setCandidateIndex((index) => index + 1)}
                />
            ) : (
                <div className="flex aspect-[5/7] items-center justify-center border border-slate-700 bg-slate-800 p-3 text-center text-xs font-semibold text-white">
                    {card.name}
                </div>
            )}

            <div className="absolute bottom-2 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-emerald-900 text-xl font-black text-white shadow-lg ring-2 ring-white/80">
                {card.quantity}
            </div>
        </a>
    );
}

export default function ViewAsImageDeck() {
    const [deck, setDeck] = useState<StoredDeckImage | null>(null);
    const [manualDecklist, setManualDecklist] = useState("");

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            const storedDeck = window.localStorage.getItem(STORAGE_KEY);

            if (!storedDeck) {
                return;
            }

            try {
                const parsedDeck = JSON.parse(storedDeck) as StoredDeckImage;
                setDeck(parsedDeck);
                setManualDecklist(parsedDeck.decklist);
            } catch {
                window.localStorage.removeItem(STORAGE_KEY);
            }
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, []);

    const cards = useMemo(() => parseDecklist(manualDecklist), [manualDecklist]);

    return (
        <main className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">
                        {deck?.archetype ? `${deck.archetype} Deck Image` : "View Deck as Image"}
                    </h1>

                    {deck && (
                        <p className="mt-3 text-slate-600">
                            {deck.player} · {deck.tournament}
                        </p>
                    )}
                </div>

            </div>

            {!deck && (
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <label className="block text-sm font-bold text-slate-700" htmlFor="decklist-input">
                        Paste decklist
                    </label>
                    <textarea
                        id="decklist-input"
                        value={manualDecklist}
                        onChange={(event) => setManualDecklist(event.target.value)}
                        className="mt-2 min-h-64 w-full rounded-md border border-slate-300 p-3 font-mono text-sm text-slate-900"
                        placeholder="Pokemon: 20\n4 Dreepy TWM 128"
                    />
                </div>
            )}

            {cards.length > 0 ? (
                <section className="rounded-lg bg-zinc-900 p-4 shadow-sm print:p-0" aria-label="Deck image">
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
                        {cards.map((card) => (
                            <CardTile key={card.key} card={card} />
                        ))}
                    </div>
                </section>
            ) : (
                <p className="rounded-lg border border-slate-200 bg-white p-4 text-slate-600 shadow-sm">
                    Open this page from a decklist, or paste a Limitless-style decklist above.
                </p>
            )}
        </main>
    );
}