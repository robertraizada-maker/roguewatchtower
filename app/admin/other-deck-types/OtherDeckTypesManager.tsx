"use client";

import { useMemo, useState } from "react";
import {
    defaultOtherDeckTypes,
    formatOtherDeckTypeCriteria,
    parseOtherDeckTypeCriteria,
} from "@/lib/other-deck-types";

interface EditableOtherDeckType {
    id: string;
    archetype: string;
    criteriaText: string;
}

const initialDeckTypes: EditableOtherDeckType[] = defaultOtherDeckTypes.map(
    (deckType, index) => ({
        id: `${index}-${deckType.archetype}`,
        archetype: deckType.archetype,
        criteriaText: formatOtherDeckTypeCriteria(deckType.criteria),
    })
);

export default function OtherDeckTypesManager() {
    const [deckTypes, setDeckTypes] = useState(initialDeckTypes);

    const parsedDeckTypes = useMemo(
        () =>
            deckTypes.map((deckType) => ({
                ...deckType,
                criteria: parseOtherDeckTypeCriteria(deckType.criteriaText),
            })),
        [deckTypes]
    );

    function updateDeckType(
        id: string,
        field: "archetype" | "criteriaText",
        value: string
    ) {
        setDeckTypes((currentDeckTypes) =>
            currentDeckTypes.map((deckType) =>
                deckType.id === id ? { ...deckType, [field]: value } : deckType
            )
        );
    }

    function addDeckType() {
        setDeckTypes((currentDeckTypes) => [
            ...currentDeckTypes,
            {
                id: `new-${Date.now()}`,
                archetype: "",
                criteriaText: "",
            },
        ]);
    }

    function removeDeckType(id: string) {
        setDeckTypes((currentDeckTypes) =>
            currentDeckTypes.filter((deckType) => deckType.id !== id)
        );
    }

    return (
        <div className="mt-8 space-y-6">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                Rules are checked from top to bottom. Only decks named Other are renamed,
                and the first rule where every line meets the minimum Pokemon count wins.
            </div>

            <div className="space-y-4">
                {parsedDeckTypes.map((deckType, index) => (
                    <section
                        key={deckType.id}
                        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Rule {index + 1}
                            </h2>

                            <button
                                type="button"
                                onClick={() => removeDeckType(deckType.id)}
                                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                            >
                                Remove
                            </button>
                        </div>

                        <label className="mt-4 block text-sm font-semibold text-slate-700">
                            Archetype
                            <input
                                value={deckType.archetype}
                                onChange={(event) =>
                                    updateDeckType(
                                        deckType.id,
                                        "archetype",
                                        event.target.value
                                    )
                                }
                                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-700"
                                placeholder="Drakloak Control"
                            />
                        </label>

                        <label className="mt-4 block text-sm font-semibold text-slate-700">
                            Criteria
                            <textarea
                                value={deckType.criteriaText}
                                onChange={(event) =>
                                    updateDeckType(
                                        deckType.id,
                                        "criteriaText",
                                        event.target.value
                                    )
                                }
                                className="mt-2 min-h-32 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-emerald-700"
                                placeholder={"3 Dreepy\n3 Drakloak\n1 Elgyem"}
                            />
                        </label>

                        <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                            Parsed criteria:{" "}
                            {deckType.criteria.length > 0
                                ? deckType.criteria
                                      .map(
                                          (criterion) =>
                                              `${criterion.minQuantity} ${criterion.pokemonName}`
                                      )
                                      .join(", ")
                                : "No valid criteria yet"}
                        </div>
                    </section>
                ))}
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={addDeckType}
                    className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
                >
                    Add Rule
                </button>

                <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700"
                    disabled
                >
                    Save to Database
                </button>
            </div>

            <p className="text-sm text-slate-500">
                Database save is disabled until the backend exposes an Other deck
                types table endpoint.
            </p>
        </div>
    );
}
