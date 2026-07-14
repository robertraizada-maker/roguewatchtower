import AdminRedeployButton from "./AdminRedeployButton";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight">
          Admin
        </h1>

        <p className="mt-4 text-slate-600">
          Import and analyse tournament data for Rogue Watchtower.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">
              Daily Import
            </h2>

            <p className="mt-3 text-slate-600">
              The first version will fetch yesterday&apos;s Standard tournaments,
              filter to events with 50 or more players, and display the results.
            </p>

            <button className="mt-6 rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800">
              Import Yesterday
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">
              Other Deck Types
            </h2>

            <p className="mt-3 text-slate-600">
              Define criteria for renaming decks that arrive as Other.
            </p>

            <a
              href="/admin/other-deck-types"
              className="mt-6 inline-block rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
            >
              Manage Other Deck Types
            </a>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="text-2xl font-semibold">
              Publish Changes
            </h2>

            <p className="mt-3 text-slate-600">
              Start a Cloudflare Pages redeploy so new archetype names appear on the static site.
            </p>

            <AdminRedeployButton />
          </div>
        </div>
      </section>
    </main>
  );
}