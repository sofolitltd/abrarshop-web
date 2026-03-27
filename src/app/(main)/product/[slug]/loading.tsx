import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function ProductLoading() {
  return (
    <div className="container py-6 animate-in fade-in duration-500">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6 md:mb-8 flex items-center gap-2">
        <Skeleton className="h-4 w-12 rounded-none" />
        <span className="text-zinc-300">/</span>
        <Skeleton className="h-4 w-24 rounded-none" />
        <span className="text-zinc-300">/</span>
        <Skeleton className="h-4 w-32 rounded-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Gallery Skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="aspect-square w-full rounded-none" />
            <Skeleton className="aspect-square w-full rounded-none" />
            <Skeleton className="aspect-square w-full rounded-none" />
            <Skeleton className="aspect-square w-full rounded-none" />
          </div>
        </div>

        {/* Info Skeleton */}
        <div className="space-y-6 md:-mt-1.5">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4 rounded-none" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-32 rounded-none" />
              <Skeleton className="h-6 w-24 rounded-none" />
            </div>
            
            <div className="mt-8">
              <Skeleton className="h-16 w-48 rounded-none" />
            </div>

            <div className="space-y-3 mt-6">
              <div className="flex justify-between max-w-sm">
                <Skeleton className="h-4 w-24 rounded-none" />
                <Skeleton className="h-4 w-32 rounded-none" />
              </div>
              <div className="flex justify-between max-w-sm">
                <Skeleton className="h-4 w-24 rounded-none" />
                <Skeleton className="h-4 w-32 rounded-none" />
              </div>
              <div className="flex justify-between max-w-sm">
                <Skeleton className="h-4 w-24 rounded-none" />
                <Skeleton className="h-4 w-32 rounded-none" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Skeleton */}
          <div className="space-y-4 pt-4">
            <div className="flex gap-4">
               <Skeleton className="h-14 flex-1 rounded-none border-2 border-zinc-100" />
               <Skeleton className="h-14 flex-1 rounded-none" />
            </div>
            <Skeleton className="h-14 w-full rounded-none bg-zinc-900" />
          </div>
          
          <div className="pt-8 border-t border-dashed space-y-3">
             <Skeleton className="h-4 w-full rounded-none" />
             <Skeleton className="h-4 w-4/5 rounded-none" />
             <Skeleton className="h-4 w-2/3 rounded-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
