"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitContactForm } from "@/lib/actions";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  subject: z.string().min(3, "Subject must be at least 3 characters."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactForm() {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactFormValues) {
    setIsPending(true);
    try {
      const result = await submitContactForm(data);
      if (result.success) {
        toast.success(result.message);
        form.reset();
      } else {
        toast.error(result.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="lg:col-span-2 bg-white border border-zinc-200 p-8 md:p-10 shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-widest text-zinc-500">Full Name</label>
            <Input 
              {...form.register("name")}
              placeholder="John Doe" 
              className="rounded-none border-zinc-200 focus-visible:ring-orange-500" 
              disabled={isPending}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500 font-medium">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
            <Input 
              {...form.register("email")}
              type="email" 
              placeholder="john@example.com" 
              className="rounded-none border-zinc-200 focus-visible:ring-orange-500" 
              disabled={isPending}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500 font-medium">{form.formState.errors.email.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-widest text-zinc-500">Subject</label>
          <Input 
            {...form.register("subject")}
            placeholder="How can we help you?" 
            className="rounded-none border-zinc-200 focus-visible:ring-orange-500" 
            disabled={isPending}
          />
          {form.formState.errors.subject && (
            <p className="text-xs text-red-500 font-medium">{form.formState.errors.subject.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-widest text-zinc-500">Message</label>
          <Textarea 
            {...form.register("message")}
            placeholder="Type your message here..." 
            className="rounded-none border-zinc-200 focus-visible:ring-orange-500 min-h-[150px]" 
            disabled={isPending}
          />
          {form.formState.errors.message && (
            <p className="text-xs text-red-500 font-medium">{form.formState.errors.message.message}</p>
          )}
        </div>
        <Button 
          type="submit"
          disabled={isPending}
          className="w-full md:w-auto px-12 py-6 bg-black hover:bg-zinc-900 text-white rounded-none font-bold uppercase tracking-widest group"
        >
          {isPending ? (
            <>
              Sending...
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              Send Message
              <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
