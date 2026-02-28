import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DropCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <Skeleton className="h-52 w-full rounded-none" />

      <CardContent className="flex-1 pt-4 space-y-3">
        {/* title */}
        <Skeleton className="h-4 w-3/4" />
        {/* price */}
        <Skeleton className="h-6 w-1/3" />
        {/* top buyers section */}
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-2/5" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        {/* reserve button placeholder */}
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

export function DropsLoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <DropCardSkeleton key={i} />
      ))}
    </div>
  );
}
