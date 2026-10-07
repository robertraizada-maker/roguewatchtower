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
                <h2 className="mt-8 text-2xl font-semibold">Advertising and cookies</h2>
                <p className="mt-4 leading-7 text-slate-700">
                    We use Google AdSense to support this site through advertising.
                    Google and other advertising partners may collect information
                    such as your IP address, browser and device details, and ad
                    interactions. They may use cookies, local storage and similar
                    technologies to deliver and measure ads, prevent fraud and,
                    where you consent, personalise advertising based on visits to
                    this and other websites.
                </p>
                <p className="mt-4 leading-7 text-slate-700">
                    For visitors in the UK, European Economic Area and Switzerland,
                    Google&apos;s consent message provides information about the
                    purposes and advertising partners involved and lets you accept,
                    decline or manage consent. You can revisit your choice using
                    the privacy and cookie settings link provided by Google on
                    this site. Declining consent does not prevent you from using
                    the site. Your choice is remembered in your browser, but you
                    may be asked again if it expires, you clear browser storage,
                    or the consent information changes.
                </p>
                <p className="mt-4 leading-7 text-slate-700">
                    Learn more about{' '}
                    <a className="text-emerald-800 underline" href="https://business.safety.google/privacy/">
                        how Google uses information from sites that use its services
                    </a>
                    , including its privacy controls. You can also manage
                    personalised advertising in{' '}
                    <a className="text-emerald-800 underline" href="https://myadcenter.google.com/">
                        Google My Ad Center
                    </a>
                    {' '}or review participating third-party advertising choices at{' '}
                    <a className="text-emerald-800 underline" href="https://www.aboutads.info/choices/">
                        YourAdChoices
                    </a>
                    . These controls are separate from this site&apos;s consent settings.
                </p>
            </section>
        </main>
    );
}
