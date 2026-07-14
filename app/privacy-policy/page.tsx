import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Rogue Watchtower privacy policy.",
};

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900">
            <section className="mx-auto max-w-4xl px-6 py-16">
                <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>

                <p className="mt-4 leading-7 text-slate-700">
                    Rogue Watchtower respects your privacy.
                </p>

                <p className="mt-4 leading-7 text-slate-700">
                    We use Cloudflare Web Analytics to collect anonymous, aggregated
                    statistics about website usage. This service does not use cookies.
                </p>

                <p className="mt-4 leading-7 text-slate-700">
                    If you choose Dark mode, that preference is saved in your own
                    browser so the site can remember it next time. We do not use
                    cookies for this, and the setting does not tell us who you are.
                </p>

                <p className="mt-4 leading-7 text-slate-700">
                    If you contact us, we will only use the information you provide
                    to respond to your enquiry.
                </p>
            </section>
        </main>
    );
}
