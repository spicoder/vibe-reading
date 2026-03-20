"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  onSnapshot,
  collection,
  updateDoc,
  arrayUnion,
  increment,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

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

// NEW: Notification Type
export type AppNotification = {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: any;
};

const MultiplayerContext = createContext<any>(null);

export const MultiplayerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentUser, setCurrentUser] = useState<PlayerProfile | null>(null);
  const [allPlayers, setAllPlayers] = useState<PlayerProfile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [activeListings, setActiveListings] = useState<MarketListing[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);

  // NEW: Notification State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const cachedUser = localStorage.getItem("viber_reader");
    if (cachedUser) {
      setCurrentUser({
        id: cachedUser,
        name: "Loading...",
        avatar: "⏳",
        completedChapters: [],
        favorites: [],
        gems: {},
        stars: 0,
        rewardedChapters: [],
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const players = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as PlayerProfile,
      );
      setAllPlayers(players);
      setCurrentUser((prev) => {
        if (!prev) return null;
        const updatedMe = players.find((p) => p.id === prev.id);
        if (updatedMe && prev.avatar === "⏳") return updatedMe;
        return updatedMe || prev;
      });
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, []);

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
          (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0),
      );
      setActiveListings(listings);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser || currentUser.avatar === "⏳") return;
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const orders = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as Order)
        .filter(
          (order) =>
            order.buyerId === currentUser.id ||
            order.sellerId === currentUser.id,
        );
      orders.sort(
        (a, b) =>
          (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0),
      );
      setMyOrders(orders);
    });
    return () => unsubscribe();
  }, [currentUser?.id]);

  // NEW: Listen to Notifications
  useEffect(() => {
    if (!currentUser || currentUser.avatar === "⏳") return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.id),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as AppNotification,
      );
      // Sort in memory to avoid needing a Firestore composite index
      notifs.sort(
        (a, b) =>
          (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0),
      );
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, [currentUser?.id]);

  const registerUser = async (
    username: string,
    name: string,
    avatar: string,
  ) => {
    const normalizedId = username.trim().toLowerCase().replace(/\s+/g, "-");
    if (normalizedId.length < 3)
      throw new Error("Username must be at least 3 characters.");
    const userRef = doc(db, "users", normalizedId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists())
      throw new Error("This username is already taken. Try another!");
    const newUser: PlayerProfile = {
      id: normalizedId,
      name,
      avatar,
      completedChapters: [],
      favorites: [],
      gems: {},
      stars: 0,
      rewardedChapters: [],
    };
    await setDoc(userRef, newUser);
    localStorage.setItem("viber_reader", normalizedId);
    setCurrentUser(newUser);
  };

  const loginUser = async (username: string) => {
    const normalizedId = username.trim().toLowerCase().replace(/\s+/g, "-");
    const userRef = doc(db, "users", normalizedId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      localStorage.removeItem("viber_reader");
      throw new Error(
        "Account not found. Check the spelling or create a new one.",
      );
    }
    localStorage.setItem("viber_reader", normalizedId);
    setCurrentUser({ id: userSnap.id, ...userSnap.data() } as PlayerProfile);
  };

  const logoutUser = () => {
    localStorage.removeItem("viber_reader");
    setCurrentUser(null);
  };

  const markAsCompleted = async (chapterId: string) => {
    if (!currentUser || currentUser.completedChapters.includes(chapterId))
      return;
    setCurrentUser((prev) =>
      prev
        ? { ...prev, completedChapters: [...prev.completedChapters, chapterId] }
        : null,
    );
    await updateDoc(doc(db, "users", currentUser.id), {
      completedChapters: arrayUnion(chapterId),
    });
  };

  const awardChapterStars = async (
    uniqueChapterId: string,
    starsEarned: number,
  ) => {
    if (!currentUser) return;
    const rewarded = currentUser.rewardedChapters || [];
    if (rewarded.includes(uniqueChapterId)) return;
    setCurrentUser((prev) =>
      prev
        ? {
            ...prev,
            stars: (prev.stars || 0) + starsEarned,
            rewardedChapters: [...rewarded, uniqueChapterId],
          }
        : null,
    );
    await updateDoc(doc(db, "users", currentUser.id), {
      stars: increment(starsEarned),
      rewardedChapters: arrayUnion(uniqueChapterId),
    });
  };

  const toggleFavorite = async (slideId: string) => {
    if (!currentUser) return;
    const currentFavs = currentUser.favorites || [];
    const isFav = currentFavs.includes(slideId);
    const newFavs = isFav
      ? currentFavs.filter((id) => id !== slideId)
      : [...currentFavs, slideId];
    setCurrentUser((prev) => (prev ? { ...prev, favorites: newFavs } : null));
    await updateDoc(doc(db, "users", currentUser.id), { favorites: newFavs });
  };
  const isFavorite = (slideId: string) =>
    currentUser?.favorites?.includes(slideId) || false;

  const saveGem = async (reference: string, content: string) => {
    if (!currentUser) return;
    const newGems = { ...(currentUser.gems || {}), [reference]: content };
    setCurrentUser((prev) => (prev ? { ...prev, gems: newGems } : null));
    await updateDoc(doc(db, "users", currentUser.id), { gems: newGems });
  };
  const deleteGem = async (reference: string) => {
    if (!currentUser) return;
    const newGems = { ...(currentUser.gems || {}) };
    delete newGems[reference];
    setCurrentUser((prev) => (prev ? { ...prev, gems: newGems } : null));
    await updateDoc(doc(db, "users", currentUser.id), { gems: newGems });
  };
  const getGem = (reference: string) => currentUser?.gems?.[reference] || "";

  // === STORE LOGIC WITH NOTIFICATIONS ===

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

    // NEW: Notify Seller
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

    // NEW: Notify Buyer
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

    // NEW: Notify Buyer
    await addDoc(collection(db, "notifications"), {
      userId: order.buyerId,
      message: `${currentUser.name} cancelled the order for ${order.itemName}. Your ${order.price} stars were refunded.`,
      read: false,
      createdAt: serverTimestamp(),
    });
  };

  // NEW: Mark Notification Read
  const markNotificationRead = async (id: string) => {
    await updateDoc(doc(db, "notifications", id), { read: true });
  };

  return (
    <MultiplayerContext.Provider
      value={{
        currentUser,
        allPlayers,
        isLoaded,
        activeListings,
        myOrders,
        notifications,
        unreadCount,
        markNotificationRead, // <-- Exported
        registerUser,
        loginUser,
        logoutUser,
        markAsCompleted,
        awardChapterStars,
        toggleFavorite,
        isFavorite,
        saveGem,
        deleteGem,
        getGem,
        createListing,
        buyItem,
        completeHandover,
        cancelAndRefundOrder,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
};
export const useMultiplayer = () => useContext(MultiplayerContext);
