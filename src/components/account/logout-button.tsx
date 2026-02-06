"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
    className?: string;
    showLabelOnMd?: boolean;
}

export function LogoutButton({ className, showLabelOnMd = true }: LogoutButtonProps) {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut(auth);
        router.push("/");
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 border border-zinc-100 hover:bg-red-50 hover:text-red-600 font-bold uppercase text-xs tracking-widest transition-colors text-left group",
                        className
                    )}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span className={cn(
                        !showLabelOnMd && "md:hidden lg:inline"
                    )}>
                        Logout
                    </span>
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-none border-2 border-black">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-headline uppercase font-bold text-xl">Confirm Logout</AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-600">
                        Are you sure you want to log out of your account? You will need to sign in again to access your orders and profile.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-none border-black font-bold uppercase tracking-widest text-xs h-12">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSignOut}
                        className="rounded-none bg-red-600 hover:bg-red-700 font-bold uppercase tracking-widest text-xs text-white h-12"
                    >
                        Logout
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
