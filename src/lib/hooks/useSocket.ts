import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// single shared socket instace for the whole app
let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    // some basic loging so we can debug connection issues easier
    socketInstance.on("connect", () => {
      console.log("socket connected:", socketInstance?.id);
    });
    socketInstance.on("connect_error", (err) => {
      console.warn("socket connection error:", err.message);
    });
    socketInstance.on("disconnect", (reason) => {
      console.log("socket disconnected:", reason);
    });
  }
  return socketInstance;
}

export type StockUpdatePayload = {
  dropId: string;
  availableStock: number;
};

export type PurchaseMadePayload = {
  dropId: string;
  username: string;
};

export type ReservationExpiredPayload = {
  reservationId: string;
  dropId: string;
  userId: string;
  availableStock: number;
};

interface SocketEvents {
  onStockUpdate?: (data: StockUpdatePayload) => void;
  onPurchaseMade?: (data: PurchaseMadePayload) => void;
  onReservationExpired?: (data: ReservationExpiredPayload) => void;
}

// hook to listen on socket events, cleans up on unmount
export function useSocket(events: SocketEvents) {
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    const socket = getSocket();

    const handleStockUpdate = (data: StockUpdatePayload) => {
      eventsRef.current.onStockUpdate?.(data);
    };
    const handlePurchaseMade = (data: PurchaseMadePayload) => {
      eventsRef.current.onPurchaseMade?.(data);
    };
    const handleReservationExpired = (data: ReservationExpiredPayload) => {
      eventsRef.current.onReservationExpired?.(data);
    };

    socket.on("stock-update", handleStockUpdate);
    socket.on("purchase-made", handlePurchaseMade);
    socket.on("reservation-expired", handleReservationExpired);

    return () => {
      socket.off("stock-update", handleStockUpdate);
      socket.off("purchase-made", handlePurchaseMade);
      socket.off("reservation-expired", handleReservationExpired);
    };
  }, []);
}
