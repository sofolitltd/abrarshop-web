import { Breadcrumb } from "@/components/layout/breadcrumb";
import type { Metadata } from "next";
import { ShoppingBag, Users, Target, Rocket, Award, ShieldCheck } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
    title: "About Us - Abrar Shop",
    description: "Learn more about Abrar Shop, your trusted online destination for premium products in Bangladesh.",
};

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* --- HERO SECTION --- */}
            <div className="bg-black text-white pt-12 pb-24 relative overflow-hidden">
                <div className="container relative z-10">
                    <Breadcrumb
                        items={[
                            { name: 'Home', href: '/' },
                            { name: 'About Us', href: '/about' }
                        ]}
                        className="text-zinc-400 hover:text-white"
                    />
                    <div className="mt-12 max-w-3xl">
                        <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter uppercase leading-none mb-6">
                            Redefining <br />
                            <span className="text-orange-500 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Shopping</span> Experience
                        </h1>
                        <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed">
                            Abrar Shop is more than just an e-commerce platform. We are a community-driven marketplace dedicated to bringing premium quality products and unparalleled service to every corner of Bangladesh.
                        </p>
                    </div>
                </div>
                {/* Abstract background elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-zinc-900 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            </div>

            <div className="container -mt-16 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 shadow-2xl border border-zinc-100 flex flex-col gap-4">
                        <div className="h-12 w-12 bg-orange-500 flex items-center justify-center text-white">
                            <Users className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Our Identity</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            Founded on the principles of trust and transparency, Abrar Shop has grown from a small vision into a leading destination for authentic global and local brands.
                        </p>
                    </div>
                    <div className="bg-white p-8 shadow-2xl border border-zinc-100 flex flex-col gap-4">
                        <div className="h-12 w-12 bg-black flex items-center justify-center text-white">
                            <Target className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Our Mission</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            To empower consumers in Bangladesh by providing easy access to high-quality products while ensuring a seamless and secure digital shopping journey.
                        </p>
                    </div>
                    <div className="bg-white p-8 shadow-2xl border border-zinc-100 flex flex-col gap-4">
                        <div className="h-12 w-12 bg-orange-600 flex items-center justify-center text-white">
                            <Rocket className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Our Vision</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            To become the most customer-centric online shopping destination in the region, recognized for innovation, reliability, and social responsibility.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- STORY SECTION --- */}
            <section className="py-24 overflow-hidden">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="relative overflow-hidden">
                                <Image
                                    src="https://placehold.co/600x400/000000/FFFFFF?text=Our+Warehouse"
                                    alt="Our Warehouse"
                                    height={600}
                                    width={400}
                                    className="object-contain grayscale hover:grayscale-0 transition-all duration-1000"
                                />
                            </div>
                            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-orange-500 p-8 hidden md:flex flex-col justify-end text-white">
                                <span className="text-5xl font-black leading-none">05+</span>
                                <span className="text-xs uppercase font-bold tracking-widest mt-2">Years of Excellence</span>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2">
                                <div className="h-px w-8 bg-orange-600"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Our Journey</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter uppercase leading-none">
                                Crafting the <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-800 to-zinc-500">Future of Retail</span>
                            </h2>
                            <div className="space-y-4 text-zinc-600 leading-relaxed">
                                <p>
                                    Abrar Shop started with a simple observation: the digital divide in Bangladesh was preventing talented creators and premium brands from reaching their true audience. We decided to bridge that gap.
                                </p>
                                <p>
                                    Today, we handle thousands of orders weekly, ensuring that every package delivered carries more than just a product—it carries our promise of quality and care.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-8 pt-4">
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-black text-black">100%</h4>
                                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Authentic Products</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-black text-black">24/7</h4>
                                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Customer Support</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CORE VALUES --- */}
            <section className="py-24 bg-zinc-50 border-y border-zinc-100">
                <div className="container text-center max-w-4xl mx-auto">
                    <div className="space-y-4 mb-16">
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-px w-8 bg-orange-600"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Why Us</span>
                            <div className="h-px w-8 bg-orange-600"></div>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter uppercase leading-none">
                            Values That <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-800 to-zinc-500">Define Us</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="space-y-4">
                            <div className="h-16 w-16 mx-auto bg-white shadow-xl flex items-center justify-center text-orange-500 rounded-2xl transform hover:rotate-6 transition-transform">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <h4 className="font-bold uppercase tracking-tight">Trust & Security</h4>
                            <p className="text-sm text-zinc-500 leading-relaxed italic">"Your data and payments are always protected with industry-leading security."</p>
                        </div>
                        <div className="space-y-4">
                            <div className="h-16 w-16 mx-auto bg-white shadow-xl flex items-center justify-center text-black rounded-2xl transform hover:-rotate-6 transition-transform text-zinc-800">
                                <Award className="h-8 w-8" />
                            </div>
                            <h4 className="font-bold uppercase tracking-tight">Quality First</h4>
                            <p className="text-sm text-zinc-500 leading-relaxed italic">"We curate only the best products, ensuring every item exceeds expectations."</p>
                        </div>
                        <div className="space-y-4">
                            <div className="h-16 w-16 mx-auto bg-white shadow-xl flex items-center justify-center text-orange-600 rounded-2xl transform hover:rotate-6 transition-transform">
                                <ShoppingBag className="h-8 w-8" />
                            </div>
                            <h4 className="font-bold uppercase tracking-tight">Customer Obsession</h4>
                            <p className="text-sm text-zinc-500 leading-relaxed italic">"Our success is measured by your satisfaction and shopping experience."</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
