import type { Metadata } from "next";
import AdminBreadcrumbs from "../AdminBreadcrumbs";
import YesterdayImportCard from "./YesterdayImportCard";

export const metadata: Metadata = {
    title: "Import Data",
};
export default function AdminImportPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900">
            <section className="mx-auto max-w-5xl px-6 py-12">
                <AdminBreadcrumbs currentPage="Import Data" />

                <h1 className="text-4xl font-bold tracking-tight">Import Data</h1>

                <p className="mt-4 text-slate-600">
                    Use this page to test importing tournament data from Limitless.
                </p>

                <div className="mt-8">
                    <YesterdayImportCard />
                </div>
            </section>
        </main>
    );
}
