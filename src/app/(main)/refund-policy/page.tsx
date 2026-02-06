import { Breadcrumb } from "@/components/layout/breadcrumb";
import type { Metadata } from "next";
import { RotateCcw, ShieldCheck, Clock, Truck, FileCheck, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "Refund & Return Policy - Abrar Shop",
    description: "Read our transparent refund and return policy at Abrar Shop.",
};

export default function RefundPolicyPage() {
    return (
        <div className="container py-12 max-w-4xl">
            <div className="mb-12">
                <Breadcrumb
                    items={[
                        { name: 'Home', href: '/' },
                        { name: 'Refund Policy', href: '/refund-policy' }
                    ]}
                />
                <h1 className="text-4xl font-bold tracking-tight font-headline mt-4">
                    Refund & <span className="text-orange-500">Return Policy</span>
                </h1>
                <p className="text-muted-foreground mt-2 text-sm italic">Last Updated: February 06, 2026</p>
            </div>

            <div className="space-y-12">
                <section className="bg-orange-50 p-8 rounded-sm border-l-4 border-orange-500">
                    <div className="flex gap-4 items-start">
                        <RotateCcw className="h-8 w-8 text-orange-600 shrink-0" />
                        <div>
                            <h2 className="text-xl font-bold text-black mb-2">Our 7-Day Satisfaction Guarantee</h2>
                            <p className="text-zinc-600 leading-relaxed text-sm">
                                We want you to be completely satisfied with your purchase. If a product is defective or doesn't match the description, you can return it within <strong>7 days</strong> of delivery for an exchange or a full refund.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 border border-zinc-100 rounded-lg hover:shadow-md transition-shadow">
                        <Clock className="h-6 w-6 text-orange-600 mb-4" />
                        <h3 className="font-bold text-lg mb-2">Return Window</h3>
                        <p className="text-sm text-zinc-500">Items must be returned within 7 days of receiving the order.</p>
                    </div>
                    <div className="p-6 border border-zinc-100 rounded-lg hover:shadow-md transition-shadow">
                        <ShieldCheck className="h-6 w-6 text-orange-600 mb-4" />
                        <h3 className="font-bold text-lg mb-2">Product Condition</h3>
                        <p className="text-sm text-zinc-500">Items must be unused, in original packaging, with all tags attached.</p>
                    </div>
                </div>

                <div className="space-y-8 text-zinc-700 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-6 flex items-center gap-2 underline underline-offset-8 decoration-orange-500/30">
                            1. Conditions for Return
                        </h2>
                        <p className="mb-4 font-medium italic">You may request a return if:</p>
                        <ul className="list-disc pl-5 space-y-4">
                            <li><strong>Damaged/Defective:</strong> The product was damaged during shipping or is defective upon arrival.</li>
                            <li><strong>Incorrect Item:</strong> You received a different product than what you ordered (wrong size, color, or model).</li>
                            <li><strong>Missing Parts:</strong> Parts or accessories mentioned in the description are missing.</li>
                            <li><strong>Website Error:</strong> The product significantly differs from the website description or images.</li>
                        </ul>
                    </section>

                    <section className="bg-zinc-50 p-8 border border-zinc-200">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-6 flex items-center gap-2">
                            2. Non-Returnable Items
                        </h2>
                        <p className="mb-4">For health and safety reasons, certain items cannot be returned:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ul className="list-disc pl-5 space-y-2 text-sm italic">
                                <li>Innerwear and Lingerie</li>
                                <li>Cosmetics and Personal Care</li>
                                <li>Perishable Goods (Food Items)</li>
                            </ul>
                            <ul className="list-disc pl-5 space-y-2 text-sm italic">
                                <li>Customized/Personalized Items</li>
                                <li>Items on Clearance/Final Sale</li>
                                <li>Software or Digital Downloads</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-6 flex items-center gap-2 underline underline-offset-8 decoration-orange-500/30">
                            3. The Return Process
                        </h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <span className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold shrink-0">1</span>
                                <div>
                                    <h4 className="font-bold text-black uppercase text-sm tracking-widest">Contact Support</h4>
                                    <p className="text-sm text-zinc-500">Email us at support@abrarshop.online or call 01725-877772 with your order ID and photos of the product.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <span className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold shrink-0">2</span>
                                <div>
                                    <h4 className="font-bold text-black uppercase text-sm tracking-widest">Inspection</h4>
                                    <p className="text-sm text-zinc-500">Our team will review your request within 24-48 hours. If approved, we will arrange for a pickup.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <span className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold shrink-0">3</span>
                                <div>
                                    <h4 className="font-bold text-black uppercase text-sm tracking-widest">Refund Selection</h4>
                                    <p className="text-sm text-zinc-500">Choose between an exchange, store credit, or a refund to your original payment method.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="border-t border-dashed pt-8">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-6 flex items-center gap-2">
                            4. Refund Timeline
                        </h2>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3">
                                <Truck className="h-5 w-5 text-zinc-400 shrink-0" />
                                <span className="text-sm"><strong>Original Method:</strong> 5-10 business days after inspection approval.</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FileCheck className="h-5 w-5 text-zinc-400 shrink-0" />
                                <span className="text-sm"><strong>Store Credit:</strong> Instant after inspection approval.</span>
                            </li>
                        </ul>
                    </section>

                    <section className="bg-black text-white p-8 rounded-sm">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                                    <HelpCircle className="h-5 w-5 text-orange-500" />
                                    Still Have Questions?
                                </h3>
                                <p className="text-xs text-zinc-400 uppercase tracking-widest">Our support team is here to help you 24/7</p>
                            </div>
                            <div className="flex gap-4">
                                <a href="tel:01725877772" className="bg-orange-600 hover:bg-orange-700 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Call Now</a>
                                <a href="mailto:support@abrarshop.online" className="bg-white text-black hover:bg-zinc-200 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Email Us</a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
