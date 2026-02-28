import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "@/lib/constants/utils.constants";

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

export type NewDropPayload = {
  id: string;
  name: string;
  price: number;
  totalStock: number;
  availableStock: number;
  imageUrl?: string;
  dropStartsAt: string;
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
  onNewDrop?: (data: NewDropPayload) => void;
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
    const handleNewDrop = (data: NewDropPayload) => {
      eventsRef.current.onNewDrop?.(data);
    };

    socket.on(SOCKET_EVENTS.INVENTORY_UPDATE, handleStockUpdate);
    socket.on(SOCKET_EVENTS.PURCHASE_UPDATE, handlePurchaseMade);
    socket.on(SOCKET_EVENTS.RESERVATION_UPDATE, handleReservationExpired);
    socket.on(SOCKET_EVENTS.NEW_DROP, handleNewDrop);

    return () => {
      socket.off(SOCKET_EVENTS.INVENTORY_UPDATE, handleStockUpdate);
      socket.off(SOCKET_EVENTS.PURCHASE_UPDATE, handlePurchaseMade);
      socket.off(SOCKET_EVENTS.RESERVATION_UPDATE, handleReservationExpired);
      socket.off(SOCKET_EVENTS.NEW_DROP, handleNewDrop);
    };
  }, []);
}
