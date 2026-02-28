import { useEffect, useState } from "react";
import { toast } from "sonner";
import { purchasesApi } from "@/services/api";
import type { Purchase } from "@/lib/types";
import { useAuth } from "@/lib/context/AuthContext";
import { PageContainer } from "@/components/common/PageComponents";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function MyPurchasesPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const loadPurchases = async () => {
      try {
        const res = await purchasesApi.getMyPurchases();
        setPurchases(res.data.data || []);
      } catch {
        toast.error("Couldnt load your purchases");
      } finally {
        setLoading(false);
      }
    };

    loadPurchases();
  }, [isAuthenticated, navigate]);

  // format date to something readable
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" />
          My Purchases
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          All the sneakers you have copped
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>You haven't purchased anything yet.</p>
          <p className="text-sm mt-1">
            Go grab some sneakers from the{" "}
            <a href="/" className="underline text-primary">
              live drops
            </a>
            !
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardContent className="flex items-center gap-4 py-4">
                {/* image thumbnail or placholder */}
                <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center shrink-0 overflow-hidden">
                  {purchase.Drop?.imageUrl ? (
                    <img
                      src={purchase.Drop.imageUrl}
                      alt={purchase.Drop.name}
                      className="object-cover h-full w-full"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground opacity-40" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {purchase.Drop?.name || "Unknown Drop"}
                  </h3>
                  <p className="text-lg font-bold">
                    ${Number(purchase.Drop?.price || 0).toFixed(2)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <Badge variant="default" className="mb-1">
                    Purchased
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(purchase.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
