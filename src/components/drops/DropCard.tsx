import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/common/Buttons";
import { Separator } from "@/components/ui/separator";
import { ReservationCountdown } from "./ReservationCountdown";
import type { Drop, Reservation } from "@/lib/types";
import { useAuth } from "@/lib/context/AuthContext";
import { reservationsApi, purchasesApi } from "@/services/api";
import { ShoppingCart, Trophy, Package } from "lucide-react";

interface Props {
  drop: Drop;
  reservation: Reservation | null; // user's current reservation for this drop
  onReserved: (res: Reservation) => void;
  onPurchased: () => void;
  onReservationExpired?: () => void;
}

export function DropCard({
  drop,
  reservation,
  onReserved,
  onPurchased,
  onReservationExpired,
}: Props) {
  const { isAuthenticated } = useAuth();
  const [reserving, setReserving] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const isOutOfStock = drop.availableStock <= 0;
  // if user has an active reservation for this drop
  const hasActiveReservation =
    reservation?.dropId === drop.id && reservation?.status === "active";

  const handleReserve = async () => {
    if (!isAuthenticated) {
      toast.error("You need to login first");
      return;
    }
    setReserving(true);
    try {
      const res = await reservationsApi.reserve(drop.id);
      // backend wraps like { reservation: {...}, availableStock }
      const resData = res.data.data;
      onReserved(resData.reservation || resData);
      toast.success("Item reserved! You have 60 seconds to complete purchase.");
    } catch (err: any) {
      const errData = err?.response?.data;
      const msg =
        errData?.message ||
        errData?.errors?.common?.msg ||
        "Could not reserve item";
      toast.error(msg);
    } finally {
      setReserving(false);
    }
  };

  const handlePurchase = async () => {
    if (!reservation) return;
    setPurchasing(true);
    try {
      await purchasesApi.completePurchase(reservation.id);
      onPurchased();
      toast.success("Purchase complete! Enjoy your sneakers 🎉");
    } catch (err: any) {
      const errData = err?.response?.data;
      const msg =
        errData?.message || errData?.errors?.common?.msg || "Purchase failed";
      toast.error(msg);
    } finally {
      setPurchasing(false);
    }
  };

  const stockColor =
    drop.availableStock <= 5
      ? "destructive"
      : drop.availableStock <= 20
        ? "secondary"
        : "default";

  return (
    <Card className="flex flex-col overflow-hidden">
      {/* product image or placeholder */}
      <div className="relative bg-muted aspect-video flex items-center justify-center">
        {drop.imageUrl ? (
          <img
            src={drop.imageUrl}
            alt={drop.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <Package className="h-16 w-16 text-muted-foreground opacity-40" />
        )}
        <Badge variant={stockColor} className="absolute top-2 right-2">
          {isOutOfStock ? "Sold Out" : `${drop.availableStock} left`}
        </Badge>
      </div>

      <CardContent className="flex-1 pt-4 space-y-2">
        <h3 className="font-semibold text-base leading-tight">{drop.name}</h3>
        <p className="text-xl font-bold">${Number(drop.price).toFixed(2)}</p>

        {/* top 3 buyers */}
        {drop.topPurchasers && drop.topPurchasers.length > 0 && (
          <div className="pt-1">
            <Separator className="mb-2" />
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              <Trophy className="h-3 w-3" /> Top buyers
            </p>
            <ul className="space-y-0.5">
              {drop.topPurchasers.map((p, i) => (
                <li key={i} className="text-xs text-muted-foreground">
                  {i + 1}. {p.username}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2 pt-0">
        {hasActiveReservation && reservation && (
          <>
            <ReservationCountdown
              expiresAt={reservation.expiresAt}
              className="w-full justify-center"
              onExpired={onReservationExpired}
            />
            <Button
              className="w-full"
              onClick={handlePurchase}
              loading={purchasing}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Complete Purchase
            </Button>
          </>
        )}

        {!hasActiveReservation && (
          <Button
            className="w-full"
            onClick={handleReserve}
            loading={reserving}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Sold Out" : "Reserve"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
