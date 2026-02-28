import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { DropCard } from "@/components/drops/DropCard";
import { dropsApi } from "@/services/api";
import { useSocket } from "@/lib/hooks/useSocket";
import type { Drop, Reservation } from "@/lib/types";
import { useAuth } from "@/lib/context/AuthContext";
import { CreateDropModal } from "@/components/drops/CreateDropModal";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reservationsApi } from "@/services/api";
import { PageContainer } from "@/components/common/PageComponents";

export function DashboardPage() {
  const { user, isAdmin, isAuthenticated } = useAuth();
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
      const data = res.data.data;
      // if the reservation came back but its already expired, just ignore it
      if (
        data &&
        data.status === "active" &&
        new Date(data.expiresAt) > new Date()
      ) {
        setReservation(data);
      } else {
        setReservation(null);
      }
    } catch {
      // 404 means no active reservation, thats fine
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
        prev.map((d) => (d.id === dropId ? { ...d, availableStock } : d)),
      );
    },
    onPurchaseMade: ({ username, dropId }) => {
      toast.info(`${username} just copped a pair!`, { duration: 3000 });
      // also update the top purchasers by re-fetching that drop
      dropsApi.getDrop(dropId).then((res) => {
        const updated = res.data.data;
        setDrops((prev) =>
          prev.map((d) => (d.id === dropId ? { ...d, ...updated } : d)),
        );
      });
    },
    onReservationExpired: ({ dropId, userId, availableStock }) => {
      // update stock count on the card
      setDrops((prev) =>
        prev.map((d) => (d.id === dropId ? { ...d, availableStock } : d)),
      );
      // only clear reservaton if its the current user's one that expired
      if (user && userId === user.id && reservation?.dropId === dropId) {
        setReservation(null);
        toast.warning("Your reservation expired!");
      }
    },
    onNewDrop: (newDrop) => {
      // add the new drop to the top of the list in realtime
      setDrops((prev) => {
        // dont add duplicate if somehow it already exists
        if (prev.some((d) => d.id === newDrop.id)) return prev;
        return [{ ...newDrop, topPurchasers: [] }, ...prev];
      });
      toast.info(`New drop just landed: ${newDrop.name}!`, { duration: 4000 });
    },
  });

  const handleReserved = (res: Reservation) => {
    setReservation(res);
  };

  const handlePurchased = () => {
    setReservation(null);
    fetchDrops();
  };

  // called when the client side timer hits 0
  const handleLocalExpiry = () => {
    setReservation(null);
    toast.warning("Your reservation expired!");
    fetchDrops(); // refetch so stock shows updated
  };

  const handleDropCreated = () => {
    fetchDrops();
    toast.success("Drop created!");
  };

  return (
    <PageContainer>
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
            onClick={() => {
              setLoading(true);
              fetchDrops();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>

          {isAdmin && <CreateDropModal onCreated={handleDropCreated} />}
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
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {drops.map((drop) => (
            <DropCard
              key={drop.id}
              drop={drop}
              reservation={reservation}
              onReserved={handleReserved}
              onPurchased={handlePurchased}
              onReservationExpired={handleLocalExpiry}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
