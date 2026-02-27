import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { DropCard } from "@/components/drops/DropCard";
import { dropsApi } from "@/services/api";
import { useSocket } from "@/hooks/useSocket";
import type { Drop, Reservation } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { CreateDropModal } from "@/components/drops/CreateDropModal";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reservationsApi } from "@/services/api";

export function DashboardPage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  // user's current active reservation (one per user at a time)
  const [reservation, setReservation] = useState<Reservation | null>(null);

  const fetchDrops = useCallback(async () => {
    try {
      const res = await dropsApi.getDrops();
      setDrops(res.data.data?.drops || res.data.data || []);
    } catch {
      toast.error("Failed to load drops");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyReservation = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await reservationsApi.getMyReservation();
      setReservation(res.data.data || null);
    } catch {
      // no active reservation is fine, just ignore 404
      setReservation(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchDrops();
    fetchMyReservation();
  }, [fetchDrops, fetchMyReservation]);

  // listen to realtime stock + purchase events
  useSocket({
    onStockUpdate: ({ dropId, availableStock }) => {
      setDrops((prev) =>
        prev.map((d) =>
          d.id === dropId ? { ...d, availableStock } : d
        )
      );
    },
    onPurchaseMade: ({ username, dropId }) => {
      toast.info(`${username} just copped a pair!`, { duration: 3000 });
      // also update the top purchasers by re-fetching that drop
      dropsApi.getDrop(dropId).then((res) => {
        const updated = res.data.data;
        setDrops((prev) =>
          prev.map((d) => (d.id === dropId ? { ...d, ...updated } : d))
        );
      });
    },
    onReservationExpired: ({ dropId, availableStock }) => {
      setDrops((prev) =>
        prev.map((d) =>
          d.id === dropId ? { ...d, availableStock } : d
        )
      );
      // if the current user's reservation expired, clear it
      if (reservation?.dropId === dropId) {
        setReservation(null);
        toast.warning("Your reservation expired!");
      }
    },
  });

  const handleReserved = (res: Reservation) => {
    setReservation(res);
  };

  const handlePurchased = () => {
    setReservation(null);
    fetchDrops();
  };

  const handleDropCreated = () => {
    fetchDrops();
    toast.success("Drop created!");
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Live Drops</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Reserve your pair before stock runs out
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setLoading(true); fetchDrops(); }}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>

          {isAdmin && (
            <CreateDropModal onCreated={handleDropCreated} />
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : drops.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No drops available right now. Check back soon!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {drops.map((drop) => (
            <DropCard
              key={drop.id}
              drop={drop}
              reservation={reservation}
              onReserved={handleReserved}
              onPurchased={handlePurchased}
            />
          ))}
        </div>
      )}
    </main>
  );
}
