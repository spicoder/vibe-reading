export type PlayerProfile = {
  id: string;
  name: string;
  avatar: string;
  completedChapters: string[];
  favorites: string[];
  gems: Record<string, string>;
  stars: number;
  rewardedChapters: string[];
};

export type MarketListing = {
  id: string;
  sellerId: string;
  sellerName: string;
  itemName: string;
  description: string;
  redemptionInstructions: string;
  price: number;
  status: "active" | "pending_handover" | "redeemed" | "cancelled";
  createdAt: any;
};

export type Order = {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  itemName: string;
  price: number;
  status: "pending_handover" | "completed" | "cancelled_refunded";
  createdAt: any;
};

export type AppNotification = {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: any;
};
