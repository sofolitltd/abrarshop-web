import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us - Abrar Shop",
    description: "Get in touch with Abrar Shop for any queries, support, or feedback.",
};

export default function ContactPage() {
    return (
        <div className="container pt-6 pb-6">
            <div className="mb-12">
                <Breadcrumb
                    items={[
                        { name: 'Home', href: '/' },
                        { name: 'Contact Us', href: '/contact' }
                    ]}
                />
                <h1 className="text-4xl font-bold tracking-tight font-headline mt-4">
                    Get in <span className="text-orange-500">Touch</span>
                </h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                    Have a question or need assistance? Our team is here to help you. Reach out to us via the form below or through our direct contact channels.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Contact info cards */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 bg-[#f5f6f7] border border-zinc-100 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-orange-500 flex items-center justify-center text-white">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Call Us</h3>
                                <p className="text-sm text-zinc-600">Available 10 AM - 10 PM</p>
                            </div>
                        </div>
                        <a href="tel:01725877772" className="block text-xl font-bold hover:text-orange-500 transition-colors">
                            01725-877772
                        </a>
                    </div>

                    <div className="p-6 bg-[#f5f6f7] border border-zinc-100 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-blue-600 flex items-center justify-center text-white">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Email Us</h3>
                                <p className="text-sm text-zinc-600">We reply within 24 hours</p>
                            </div>
                        </div>
                        <a href="mailto:support@abrarshop.com.bd" className="block text-lg font-semibold hover:text-blue-600 transition-colors break-words">
                            support@abrarshop.com.bd
                        </a>
                    </div>

                    <div className="p-6 bg-[#f5f6f7] border border-zinc-100 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-green-600 flex items-center justify-center text-white">
                                <MessageCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">WhatsApp</h3>
                                <p className="text-sm text-zinc-600">Instant messaging support</p>
                            </div>
                        </div>
                        <a href="https://wa.me/8801725877772" target="_blank" className="block text-lg font-semibold hover:text-green-600 transition-colors">
                            Message on WhatsApp
                        </a>
                    </div>

                    <div className="p-6 border border-zinc-200">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-orange-500" />
                            Our Location
                        </h3>
                        <p className="text-zinc-600 text-sm leading-relaxed">
                            Gaibandha, Bangladesh<br />
                            (Online storefront operating nationwide)
                        </p>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2 bg-white border border-zinc-200 p-8 md:p-10 shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-zinc-500">Full Name</label>
                                <Input placeholder="John Doe" className="rounded-none border-zinc-200 focus-visible:ring-orange-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
                                <Input type="email" placeholder="john@example.com" className="rounded-none border-zinc-200 focus-visible:ring-orange-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-zinc-500">Subject</label>
                            <Input placeholder="How can we help you?" className="rounded-none border-zinc-200 focus-visible:ring-orange-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-zinc-500">Message</label>
                            <Textarea placeholder="Type your message here..." className="rounded-none border-zinc-200 focus-visible:ring-orange-500 min-h-[150px]" />
                        </div>
                        <Button className="w-full md:w-auto px-12 py-6 bg-black hover:bg-zinc-900 text-white rounded-none font-bold uppercase tracking-widest group">
                            Send Message
                            <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </form>
                </div>
            </div>

            {/* Business Hours */}
            <div className="mt-16 py-12 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div className="space-y-2">
                    <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                        <Clock className="h-5 w-5 text-orange-500" />
                        Business Hours
                    </h3>
                    <p className="text-zinc-500">Our customer support team is available during these hours:</p>
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm font-medium">
                    <div className="text-zinc-400">Saturday - Thursday:</div>
                    <div>10:00 AM - 10:00 PM</div>
                    <div className="text-zinc-400">Friday:</div>
                    <div>03:00 PM - 09:00 PM</div>
                </div>
            </div>
        </div>
    );
}
