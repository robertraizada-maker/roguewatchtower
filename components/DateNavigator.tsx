"use client";

import { useRouter } from "next/navigation";

interface DateNavigatorProps {
    selectedDate: string;
    availableDates: string[];
}

function formatDate(date: string) {
    const parts = new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "UTC",
    }).formatToParts(new Date(date + "T00:00:00Z"));

    const weekday = parts.find((part) => part.type === "weekday")?.value;
    const day = parts.find((part) => part.type === "day")?.value;
    const month = parts.find((part) => part.type === "month")?.value;

    return [weekday, [day, month].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", ");
}

export default function DateNavigator({
    selectedDate,
    availableDates,
}: DateNavigatorProps) {
    const router = useRouter();
    const effectiveSelectedDate = selectedDate || availableDates[0] || "";
    const currentIndex = availableDates.indexOf(effectiveSelectedDate);

    const newestDate = availableDates[0];
    const previousDate = availableDates[currentIndex + 1];
    const nextDate = availableDates[currentIndex - 1];

    function navigateToDate(date: string) {
        if (date === newestDate) {
            router.push("/");
        } else {
            router.push(`/decks-of-the-day/${date}`);
        }
    }

    return (
        <div
            className="grid grid-cols-[1fr_2fr_1fr] rounded-xl border border-slate-200 bg-white p-3 sm:mx-auto sm:max-w-xl"
            style={{
                gap: "8px",
            }}
        >
            <button
                type="button"
                aria-label="Previous date"
                disabled={!previousDate}
                onClick={() => navigateToDate(previousDate)}
                className="flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-xl font-semibold leading-none text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <span aria-hidden="true">‹</span>
            </button>

            <select
                value={effectiveSelectedDate}
                onChange={(e) => navigateToDate(e.target.value)}
                aria-label="Select date"
                className="h-10 min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-950"
            >
                {availableDates.map((date) => (
                    <option key={date} value={date}>
                        {formatDate(date)}
                    </option>
                ))}
            </select>

            <button
                type="button"
                aria-label="Next date"
                disabled={!nextDate}
                onClick={() => navigateToDate(nextDate)}
                className="flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-xl font-semibold leading-none text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <span aria-hidden="true">›</span>
            </button>
        </div>
    );
}
