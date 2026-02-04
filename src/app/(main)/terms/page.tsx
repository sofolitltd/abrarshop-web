import { Breadcrumb } from "@/components/layout/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms & Conditions - Abrar Shop",
    description: "Please read our terms and conditions carefully before using Abrar Shop services.",
};

export default function TermsPage() {
    return (
        <div className="container py-12 max-w-4xl">
            <div className="mb-8">
                <Breadcrumb
                    items={[
                        { name: 'Home', href: '/' },
                        { name: 'Terms & Conditions', href: '/terms' }
                    ]}
                />
                <h1 className="text-4xl font-bold tracking-tight font-headline mt-4">
                    Terms & <span className="text-orange-500">Conditions</span>
                </h1>
                <p className="text-muted-foreground mt-2 text-sm italic">Last Updated: February 04, 2026</p>
            </div>

            <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-zinc-700 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-bold text-black mb-4 border-l-4 border-orange-500 pl-4 uppercase tracking-tight">1. Introduction</h2>
                    <p>
                        Welcome to <strong>Abrar Shop</strong>. These Terms and Conditions govern your use of our website located at <code>abrarshop.online</code> and our services.
                        By accessing our website, you agree to be bound by these terms. If you disagree with any part of these terms, you may not use our services.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black mb-4 border-l-4 border-orange-500 pl-4 uppercase tracking-tight">2. Use of Website</h2>
                    <p>
                        By using this website, you warrant that you are at least 18 years of age or are accessing the site under the supervision of a parent or legal guardian.
                        You are granted a non-transferable and revocable license to use the site for the purpose of shopping for personal items sold on the site. Commercial use or use on behalf of any third party is prohibited, except as explicitly permitted by us in advance.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black mb-4 border-l-4 border-orange-500 pl-4 uppercase tracking-tight">3. Order Acceptance and Pricing</h2>
                    <p>
                        Please note that there are cases when an order cannot be processed for various reasons. The Site reserves the right to refuse or cancel any order for any reason at any given time.
                        We are determined to provide the most accurate pricing information on the Site to our users; however, errors may still occur, such as cases when the price of an item is not displayed correctly on the website.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black mb-4 border-l-4 border-orange-500 pl-4 uppercase tracking-tight">4. Trademarks and Copyrights</h2>
                    <p>
                        All intellectual property rights, whether registered or unregistered, in the Site, information content on the Site and all the website design, including, but not limited to, text, graphics, software, photos, video, music, sound, and their selection and arrangement, and all software compilations, underlying source code and software shall remain our property.
                        The entire contents of the Site also are protected by copyright as a collective work under Bangladesh copyright laws and international conventions. All rights are reserved.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black mb-4 border-l-4 border-orange-500 pl-4 uppercase tracking-tight">5. Return & Refund Policy</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Products must be returned within 7 days of delivery.</li>
                        <li>Items must be unused, in the same condition that you received it, and in original packaging.</li>
                        <li>Custom or personalized products are not eligible for returns.</li>
                        <li>Refunds will be processed to the original payment method within 10 business days.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black mb-4 border-l-4 border-orange-500 pl-4 uppercase tracking-tight">6. Governing Law</h2>
                    <p>
                        These Terms and Conditions shall be interpreted and governed by the laws in force in Bangladesh.
                        Subject to the Arbitration section below, each party hereby agrees to submit to the jurisdiction of the courts of Bangladesh.
                    </p>
                </section>

                <section className="bg-zinc-50 p-6 border border-zinc-200">
                    <h2 className="text-xl font-bold text-black mb-2">Contact Us</h2>
                    <p className="text-sm">For any questions regarding these Terms & Conditions, please reach out to us:</p>
                    <p className="text-sm font-semibold mt-2">Email: info@abrarshop.online</p>
                    <p className="text-sm font-semibold">Phone: 01725-877772</p>
                </section>
            </div>
        </div>
    );
}
