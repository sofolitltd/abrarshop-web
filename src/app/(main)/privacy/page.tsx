import { Breadcrumb } from "@/components/layout/breadcrumb";
import type { Metadata } from "next";
import { Shield, Eye, Lock, FileText } from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy - Abrar Shop",
    description: "Learn how Abrar Shop handles and protects your personal data.",
};

export default function PrivacyPage() {
    return (
        <div className="container py-12 max-w-4xl">
            <div className="mb-12">
                <Breadcrumb
                    items={[
                        { name: 'Home', href: '/' },
                        { name: 'Privacy Policy', href: '/privacy' }
                    ]}
                />
                <h1 className="text-4xl font-bold tracking-tight font-headline mt-4">
                    Privacy <span className="text-orange-500">Policy</span>
                </h1>
                <p className="text-muted-foreground mt-2 text-sm italic">Effective Date: February 04, 2026</p>
            </div>

            <div className="space-y-12">
                <section className="bg-[#f5f6f7] p-8 rounded-sm ">
                    <Shield className="absolute top-4 right-4 h-24 w-24 text-zinc-200 -z-0 opacity-20" />
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
                            <span className="h-2 w-2 bg-orange-500 rounded-full" />
                            Our Commitment
                        </h2>
                        <p className="text-zinc-600 leading-relaxed">
                            At <strong>Abrar Shop</strong>, we are committed to protecting your privacy and ensuring your personal information is handled in a safe and responsible manner. This policy outlines how we collect, use, and protect your data when you visit our website.
                        </p>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="space-y-3">
                        <div className="h-10 w-10 bg-orange-100 flex items-center justify-center rounded-lg text-orange-600">
                            <Eye className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-lg">Transparency</h3>
                        <p className="text-sm text-zinc-500">We are clear about what data we collect and why we need it.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="h-10 w-10 bg-blue-100 flex items-center justify-center rounded-lg text-blue-600">
                            <Lock className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-lg">Security</h3>
                        <p className="text-sm text-zinc-500">We use industry-standard encryption to protect your information.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="h-10 w-10 bg-green-100 flex items-center justify-center rounded-lg text-green-600">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-lg">Control</h3>
                        <p className="text-sm text-zinc-500">You have full control over your data and how it is used.</p>
                    </div>
                </div>

                <div className="space-y-8 text-zinc-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-black mb-4">1. Information We Collect</h2>
                        <p className="mb-4">We collect information that you provide directly to us, including: </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Identity Data:</strong> Name, username, or similar identifier.</li>
                            <li><strong>Contact Data:</strong> Billing address, delivery address, email address, and telephone numbers.</li>
                            <li><strong>Financial Data:</strong> Bank account and payment card details (processed securely via third-party providers).</li>
                            <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products you have purchased from us.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-black mb-4">2. How We Use Your Data</h2>
                        <p className="mb-3">We use your information for various purposes, such as to:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Process and deliver your orders.</li>
                            <li>Manage payments, fees, and charges.</li>
                            <li>Send you notifications about your order status.</li>
                            <li>Improve our website, products/services, and customer experiences.</li>
                            <li>Provide you with marketing information (if you have opted-in).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-black mb-4">3. Data Security</h2>
                        <p>
                            We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way.
                            In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-black mb-4">4. Your Rights</h2>
                        <p>
                            Depending on your location, you may have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, or restriction of your personal data.
                            If you wish to exercise any of these rights, please contact our support team.
                        </p>
                    </section>

                    <section className="border-t pt-8">
                        <h2 className="text-xl font-bold text-black mb-2">Policy Updates</h2>
                        <p className="text-zinc-500 text-sm">
                            We may update this privacy policy from time to time in response to changing legal, technical, or business developments.
                            We will notify you of any significant changes by posting the new policy on this page.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
