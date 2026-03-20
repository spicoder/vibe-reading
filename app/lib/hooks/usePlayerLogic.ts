import { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  increment,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { PlayerProfile, AppNotification } from "../multiplayerTypes";

export function usePlayerLogic() {
  const [currentUser, setCurrentUser] = useState<PlayerProfile | null>(null);
  const [allPlayers, setAllPlayers] = useState<PlayerProfile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
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
        return updatedMe && prev.avatar === "⏳"
          ? updatedMe
          : updatedMe || prev;
      });
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, []);

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
      notifs.sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0),
      );
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, [currentUser?.id, currentUser?.avatar]);

  // Auth Functions
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

  // Gamification Functions
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

  const markNotificationRead = async (id: string) => {
    await updateDoc(doc(db, "notifications", id), { read: true });
  };

  return {
    currentUser,
    allPlayers,
    isLoaded,
    notifications,
    unreadCount,
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
    markNotificationRead,
  };
}
