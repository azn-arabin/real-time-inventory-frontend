// shared types for the frontend

export interface Drop {
  id: string;
  name: string;
  price: number;
  totalStock: number;
  availableStock: number;
  imageUrl?: string;
  dropStartsAt: string;
  topPurchasers?: { username: string }[];
}

export interface Reservation {
  id: string;
  userId: string;
  dropId: string;
  status: "active" | "completed" | "expired";
  expiresAt: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  dropId: string;
  reservationId: string;
}
