import { useCountdown } from "@/lib/hooks/useCountdown";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { useEffect, useRef } from "react";

interface Props {
  expiresAt: string;
  className?: string;
  onExpired?: () => void;
}

// shows a live countdown for an active reservation
export function ReservationCountdown({
  expiresAt,
  className,
  onExpired,
}: Props) {
  const secs = useCountdown(expiresAt);
  const firedRef = useRef(false);

  // fire onExpired callback once when timmer reaches 0
  useEffect(() => {
    if (secs <= 0 && !firedRef.current && onExpired) {
      firedRef.current = true;
      onExpired();
    }
  }, [secs, onExpired]);

  const isUrgent = secs <= 15;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium",
        isUrgent ? "text-red-500" : "text-amber-500",
        className,
      )}
    >
      <Clock className="h-4 w-4" />
      <span>{secs > 0 ? `Expires in ${secs}s` : "Reservation expired"}</span>
    </div>
  );
}
