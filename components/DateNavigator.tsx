"use client";

import { useRouter } from "next/navigation";

interface DateNavigatorProps {
    selectedDate: string;
    availableDates: string[];
}

function formatDate(date: string) {
    return new Date(date + "T00:00:00Z").toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    });
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
            className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-center"
            style={{
                gap: "12px",
            }}
        >
            <button
                type="button"
                disabled={!previousDate}
                onClick={() => navigateToDate(previousDate)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
                Previous
            </button>

            <select
                value={effectiveSelectedDate}
                onChange={(e) => navigateToDate(e.target.value)}
                aria-label="Select date"
                className="min-w-[260px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-950"
            >
                {availableDates.map((date) => (
                    <option key={date} value={date}>
                        {formatDate(date)}
                    </option>
                ))}
            </select>

            <button
                type="button"
                disabled={!nextDate}
                onClick={() => navigateToDate(nextDate)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
                Next
            </button>
        </div>
    );
}

