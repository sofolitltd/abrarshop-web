"use client";

import { useState, useTransition } from "react";
import { loginAdmin } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error("Please enter both ID and password");
      return;
    }

    startTransition(async () => {
      const result = await loginAdmin({ identifier, password });
      if (result.success) {
        toast.success("Welcome, Reyad!");
        router.push("/admin/dashboard");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#fafafa] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-50 rounded-full blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-100 rounded-full blur-[120px] opacity-60 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center p-3 bg-black rounded-none mb-4 shadow-xl shadow-zinc-200">
              <ShieldCheck className="h-8 w-8 text-white" />
           </div>
           <h1 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 mb-1">Command Center</h1>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Restricted Administration Access</p>
        </div>

        <Card className="rounded-none border-zinc-200 border-t-4 border-t-black shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-2 pt-8">
            <CardTitle className="text-xl font-black uppercase tracking-tight">Identity Verification</CardTitle>
            <CardDescription className="text-xs font-medium text-zinc-500">Enter your credentials to access the shop controls</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Username / Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                  <Input 
                    placeholder="Enter identifier" 
                    className="pl-10 h-12 rounded-none border-zinc-200 focus-visible:ring-black font-medium"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Secret Key</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    className="pl-10 h-12 rounded-none border-zinc-200 focus-visible:ring-black font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full h-14 bg-black text-white rounded-none font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-100 group"
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      Initialize Session
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-[10px] font-bold uppercase text-zinc-300 tracking-[0.1em]">
          Powered by AbrarShop.net &bull; Automated Security Protocol 4.0
        </p>
      </div>
    </div>
  );
}
