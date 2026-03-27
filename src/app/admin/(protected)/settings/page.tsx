"use client";

import { useState, useEffect, useTransition } from "react";
import { getSettings, updateSettings } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Store, Phone, Mail, MapPin, Globe, Share2, Search, Image as ImageIcon, Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const data = await getSettings();
      setSettings(data);
      const values: Record<string, string> = {};
      data.forEach(s => values[s.key] = s.value);
      setLocalValues(values);
    }
    load();
  }, []);

  const handleChange = (key: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const updateData = Object.entries(localValues).map(([key, value]) => ({ key, value }));
    startTransition(async () => {
      const result = await updateSettings(updateData);
      if (result.success) {
        toast.success("Settings synchronized successfully");
      } else {
        toast.error(result.message);
      }
    });
  };

  const renderField = (key: string, label: string, icon: any, placeholder: string, type: "input" | "textarea" = "input") => {
    const Icon = icon;
    return (
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{label}</label>
        <div className="relative">
          {Icon && <Icon className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />}
          {type === "input" ? (
            <Input
              value={localValues[key] || ""}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              className={`rounded-none ${Icon ? 'pl-10' : ''} h-12 border-zinc-200 focus-visible:ring-black font-medium`}
            />
          ) : (
            <Textarea
              value={localValues[key] || ""}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              className="rounded-none h-32 border-zinc-200 focus-visible:ring-black font-medium"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline uppercase tracking-tight">Shop Configuration</h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-tight">Central Control for Global Branding & Operations.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isPending}
          className="w-full sm:w-auto rounded-none bg-black text-white hover:bg-zinc-900 h-12 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-zinc-200"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Commit Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-transparent border-b border-zinc-200 rounded-none w-full justify-start h-auto p-0 mb-8 overflow-x-auto overflow-hidden hide-scrollbar">
          <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-6 py-4 font-black uppercase tracking-widest text-[10px]">General</TabsTrigger>
          <TabsTrigger value="contact" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-6 py-4 font-black uppercase tracking-widest text-[10px]">Contact & SEO</TabsTrigger>
          <TabsTrigger value="social" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-6 py-4 font-black uppercase tracking-widest text-[10px]">Social Media</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-0 space-y-6">
          <Card className="rounded-none border-zinc-200 shadow-none">
            <CardHeader className="border-b border-zinc-100 pb-4">
              <CardTitle className="text-lg font-black uppercase tracking-tight">Site Identity</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Primary branding settings visible to all users.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField("site_name", "Shop Name", Store, "e.g. Abrar Shop")}
              {renderField("site_tagline", "Shop Tagline", Globe, "e.g. Best price in Bangladesh")}
              {renderField("site_logo", "Logo URL", ImageIcon, "https://...")}
              {renderField("favicon", "Favicon URL", Search, "https://...")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-none border-zinc-200 shadow-none">
              <CardHeader className="border-b border-zinc-100">
                <CardTitle className="text-lg font-black uppercase tracking-tight">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {renderField("contact_phone", "Phone Number", Phone, "+880 1XXX-XXXXXX")}
                {renderField("contact_whatsapp", "WhatsApp Number", Share2, "+880 1XXX-XXXXXX")}
                {renderField("contact_email", "Support Email", Mail, "support@abrarshop.com")}
                {renderField("contact_address", "Physical Address", MapPin, "Dhaka, Bangladesh", "textarea")}
              </CardContent>
            </Card>

            <Card className="rounded-none border-zinc-200 shadow-none">
              <CardHeader className="border-b border-zinc-100">
                <CardTitle className="text-lg font-black uppercase tracking-tight">Global SEO</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {renderField("seo_meta_title", "Home Meta Title", Search, "Abrar Shop | Premium E-commerce")}
                {renderField("seo_meta_description", "Home Meta Description", null, "Abrar shop description...", "textarea")}
                {renderField("seo_keywords", "Global Keywords", null, "ecommerce, gadgets, dhaka", "textarea")}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="mt-0 space-y-6">
          <Card className="rounded-none border-zinc-200 shadow-none">
            <CardHeader className="border-b border-zinc-100">
              <CardTitle className="text-lg font-black uppercase tracking-tight">Social Connectivity</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField("social_facebook", "Facebook Page", Share2, "https://facebook.com/...")}
              {renderField("social_instagram", "Instagram Profile", Share2, "https://instagram.com/...")}
              {renderField("social_youtube", "YouTube Channel", Share2, "https://youtube.com/...")}
              {renderField("social_tiktok", "TikTok Profile", Share2, "https://tiktok.com/@...")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
