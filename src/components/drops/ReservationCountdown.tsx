import { useCountdown } from "@/hooks/useCountdown";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface Props {
  expiresAt: string;
  className?: string;
}

// shows a live countdown for an active reservation
export function ReservationCountdown({ expiresAt, className }: Props) {
  const secs = useCountdown(expiresAt);

  const isUrgent = secs <= 15;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium",
        isUrgent ? "text-red-500" : "text-amber-500",
        className
      )}
    >
      <Clock className="h-4 w-4" />
      <span>
        {secs > 0
          ? `Expires in ${secs}s`
          : "Reservation expired"}
      </span>
    </div>
  );
}
