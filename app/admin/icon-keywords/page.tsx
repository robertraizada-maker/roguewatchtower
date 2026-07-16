import IconKeywordsManager from "./IconKeywordsManager";

export default function IconKeywordsPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900">
            <section className="mx-auto max-w-5xl px-6 py-12">
                <h1 className="text-4xl font-bold tracking-tight">
                    Icon Keywords
                </h1>

                <p className="mt-4 text-slate-600">
                    Manage words that should be ignored when deck names are converted into Pokemon icons.
                </p>

                <IconKeywordsManager />
            </section>
        </main>
    );
}