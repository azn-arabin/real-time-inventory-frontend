import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { DropCard } from "@/components/drops/DropCard";
import { dropsApi } from "@/services/api";
import { useSocket } from "@/lib/hooks/useSocket";
import type { Drop, Reservation } from "@/lib/types";
import { useAuth } from "@/lib/context/AuthContext";
import { CreateDropModal } from "@/components/drops/CreateDropModal";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { DropsLoadingSkeleton } from "@/components/drops/DropCardSkeleton";
import { Button } from "@/components/ui/button";
import { reservationsApi } from "@/services/api";
import { PageContainer } from "@/components/common/PageComponents";

const DROPS_PER_PAGE = 9;

export function DashboardPage() {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reservations, setReservations] = useState<Record<string, Reservation>>(
    {},
  );

  const fetchDrops = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await dropsApi.getDrops(pageNum, DROPS_PER_PAGE);
      const data = res.data.data;
      // backend returns array directly (with meta in seperate field)
      setDrops(Array.isArray(data) ? data : data?.drops || []);
      const meta = res.data.meta;
      if (meta) {
        setTotalPages(meta.totalPages || 1);
        setPage(meta.currentPage || 1);
      }
    } catch {
      toast.error("Failed to load drops");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyReservations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await reservationsApi.getMyReservations();
      const data: Reservation[] = res.data.data || [];
      // build a map keyed by dropId so each card can look up its own
      const map: Record<string, Reservation> = {};
      for (const r of data) {
        if (r.status === "active" && new Date(r.expiresAt) > new Date()) {
          map[r.dropId] = r;
        }
      }
      setReservations(map);
    } catch {
      setReservations({});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchDrops(page);
    fetchMyReservations();
  }, [fetchDrops]); // eslint-disable-line

  // listen to realtime socket
  useSocket({
    onStockUpdate: ({ dropId, availableStock }) => {
      console.log(
        "Stock update for drop",
        dropId,
        "new stock:",
        availableStock,
      );
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
      console.log(
        "Reservation expired for drop",
        dropId,
        "new stock:",
        availableStock,
      );
      // update stock
      setDrops((prev) =>
        prev.map((d) => (d.id === dropId ? { ...d, availableStock } : d)),
      );

      // clear the user reservation
      if (user && userId === user.id) {
        setReservations((prev) => {
          const copy = { ...prev };
          delete copy[dropId];
          return copy;
        });
      }
    },
    onNewDrop: (newDrop) => {
      // only prepend on page 1
      if (page === 1) {
        setDrops((prev) => {
          if (prev.some((d) => d.id === newDrop.id)) return prev;
          const updated = [{ ...newDrop, topPurchasers: [] }, ...prev];
          return updated.slice(0, DROPS_PER_PAGE);
        });
      }
      toast.info(`New drop just landed: ${newDrop.name}!`, { duration: 4000 });
    },
  });

  const handleReserved = (dropId: string, res: Reservation) => {
    setReservations((prev) => ({ ...prev, [dropId]: res }));
  };

  const handlePurchased = (dropId: string) => {
    // remove that reservation from the map
    setReservations((prev) => {
      const copy = { ...prev };
      delete copy[dropId];
      return copy;
    });
  };

  // timer ends
  const handleLocalExpiry = (dropId: string) => {
    setReservations((prev) => {
      const copy = { ...prev };
      delete copy[dropId];
      return copy;
    });
    toast.warning("Your reservation expired!");
  };

  const handleDropCreated = () => {
    fetchDrops(1); // first page
    toast.success("Drop created!");
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    fetchDrops(p);
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
          <Button variant="outline" size="sm" onClick={() => fetchDrops(page)}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>

          {isAdmin && <CreateDropModal onCreated={handleDropCreated} />}
        </div>
      </div>

      {loading ? (
        <DropsLoadingSkeleton count={DROPS_PER_PAGE} />
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
              reservation={reservations[drop.id] || null}
              onReserved={(res) => handleReserved(drop.id, res)}
              onPurchased={() => handlePurchased(drop.id)}
              onReservationExpired={() => handleLocalExpiry(drop.id)}
            />
          ))}
        </div>
      )}

      {/* pagination controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              className="min-w-9"
              onClick={() => goToPage(p)}
            >
              {p}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </PageContainer>
  );
}
