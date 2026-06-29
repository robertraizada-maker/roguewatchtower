import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Import Data",
};
export default function AdminImportPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900">
            <section className="mx-auto max-w-5xl px-6 py-12">
                <h1 className="text-4xl font-bold tracking-tight">Import Data</h1>

                <p className="mt-4 text-slate-600">
                    Use this page to test importing tournament data from Limitless.
                </p>

                <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold">Import Yesterday</h2>

                    <p className="mt-3 text-slate-600">
                        This will eventually collect yesterday&apos;s Standard tournaments,
                        keep events with 50 or more players, and calculate rogue decks.
                    </p>

                    <button className="mt-6 rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800">
                        Import Yesterday
                    </button>

                    <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                        Status: Not started
                    </div>
                </div>
            </section>
        </main>
    );
}