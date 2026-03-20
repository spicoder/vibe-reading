import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  or,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";
import { MarketListing, Order, PlayerProfile } from "../multiplayerTypes";

export function useMarketLogic(currentUser: PlayerProfile | null) {
  const [activeListings, setActiveListings] = useState<MarketListing[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "market_listings"),
      where("status", "in", ["active", "pending_handover"]),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listings = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as MarketListing,
      );
      listings.sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0),
      );
      setActiveListings(listings);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser || currentUser.avatar === "⏳") return;
    const q = query(
      collection(db, "orders"),
      or(
        where("buyerId", "==", currentUser.id),
        where("sellerId", "==", currentUser.id),
      ),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Order,
      );
      orders.sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0),
      );
      setMyOrders(orders);
    });
    return () => unsubscribe();
  }, [currentUser?.id, currentUser?.avatar]);

  const createListing = async (
    itemName: string,
    description: string,
    redemptionInstructions: string,
    price: number,
  ) => {
    if (!currentUser) return;
    await addDoc(collection(db, "market_listings"), {
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      itemName,
      description,
      redemptionInstructions,
      price,
      status: "active",
      createdAt: serverTimestamp(),
    });
  };

  const buyItem = async (listing: MarketListing) => {
    if (!currentUser || currentUser.stars < listing.price)
      throw new Error("Not enough stars!");
    if (listing.sellerId === currentUser.id)
      throw new Error("You cannot buy your own item.");

    await updateDoc(doc(db, "users", currentUser.id), {
      stars: increment(-listing.price),
    });
    await updateDoc(doc(db, "market_listings", listing.id), {
      status: "pending_handover",
    });
    await addDoc(collection(db, "orders"), {
      listingId: listing.id,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      sellerId: listing.sellerId,
      itemName: listing.itemName,
      price: listing.price,
      status: "pending_handover",
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "notifications"), {
      userId: listing.sellerId,
      message: `${currentUser.name} bought your ${listing.itemName}! Check your Market Handovers.`,
      read: false,
      createdAt: serverTimestamp(),
    });
  };

  const completeHandover = async (order: Order) => {
    if (!currentUser) return;
    await updateDoc(doc(db, "orders", order.id), { status: "completed" });
    await updateDoc(doc(db, "market_listings", order.listingId), {
      status: "redeemed",
    });
    await addDoc(collection(db, "notifications"), {
      userId: order.buyerId,
      message: `${currentUser.name} confirmed handover of ${order.itemName}. Enjoy!`,
      read: false,
      createdAt: serverTimestamp(),
    });
  };

  const cancelAndRefundOrder = async (order: Order) => {
    if (!currentUser) return;
    await updateDoc(doc(db, "users", order.buyerId), {
      stars: increment(order.price),
    });
    await updateDoc(doc(db, "orders", order.id), {
      status: "cancelled_refunded",
    });
    await updateDoc(doc(db, "market_listings", order.listingId), {
      status: "active",
    });
    await addDoc(collection(db, "notifications"), {
      userId: order.buyerId,
      message: `${currentUser.name} cancelled the order for ${order.itemName}. Your ${order.price} stars were refunded.`,
      read: false,
      createdAt: serverTimestamp(),
    });
  };

  return {
    activeListings,
    myOrders,
    createListing,
    buyItem,
    completeHandover,
    cancelAndRefundOrder,
  };
}
