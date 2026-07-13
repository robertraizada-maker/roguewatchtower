import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Rogue Watchtower privacy policy.",
};

export default function PrivacyPolicyPage() {
    return (
        <section className="mx-auto max-w-3xl space-y-5">
            <h1 className="text-3xl font-bold sm:text-4xl">Privacy Policy</h1>

            <p className="text-slate-700">
                Rogue Watchtower respects your privacy.
            </p>

            <p className="text-slate-700">
                We use Cloudflare Web Analytics to collect anonymous, aggregated
                statistics about website usage. This service does not use cookies.
            </p>

            <p className="text-slate-700">
                If you contact us, we will only use the information you provide
                to respond to your enquiry.
            </p>
        </section>
    );
}
