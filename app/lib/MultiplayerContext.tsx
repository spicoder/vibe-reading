"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";

export type PlayerProfile = {
  id: string;
  name: string;
  avatar: string;
  completedChapters: string[];
  favorites: string[]; // <-- NEW: Added to profile
  gems: Record<string, string>; // <-- NEW: Added to profile
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

  // Auto-login from cache
  useEffect(() => {
    const cachedUser = localStorage.getItem("viber_reader");
    if (cachedUser) {
      // Temporarily set a shell user so the UI doesn't flash the login screen
      setCurrentUser({
        id: cachedUser,
        name: "Loading...",
        avatar: "⏳",
        completedChapters: [],
        favorites: [],
        gems: {},
      });
    }
  }, []);

  // 1. Listen for ALL players on the map
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const players = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as PlayerProfile,
      );
      setAllPlayers(players);

      setCurrentUser((prev) => {
        if (!prev) return null;
        const updatedMe = players.find((p) => p.id === prev.id);

        // If we found the real user data after auto-login, update it
        if (updatedMe && prev.avatar === "⏳") {
          return updatedMe;
        }
        return updatedMe || prev;
      });
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // 2. Register Account
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
    };

    await setDoc(userRef, newUser);
    localStorage.setItem("viber_reader", normalizedId); // Cache login
    setCurrentUser(newUser);
  };

  // 3. Log In
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

    localStorage.setItem("viber_reader", normalizedId); // Cache login
    setCurrentUser({ id: userSnap.id, ...userSnap.data() } as PlayerProfile);
  };

  // 4. Log Out
  const logoutUser = () => {
    localStorage.removeItem("viber_reader"); // Clear cache
    setCurrentUser(null);
  };

  // 5. MAP PROGRESS: Mark chapter completed
  const markAsCompleted = async (chapterId: string) => {
    if (!currentUser) return;
    if (currentUser.completedChapters.includes(chapterId)) return;

    setCurrentUser((prev) =>
      prev
        ? { ...prev, completedChapters: [...prev.completedChapters, chapterId] }
        : null,
    );

    await updateDoc(doc(db, "users", currentUser.id), {
      completedChapters: arrayUnion(chapterId),
    });
  };

  // === NEW: FAVORITES LOGIC ===
  const toggleFavorite = async (slideId: string) => {
    if (!currentUser) return;

    // Safety fallback in case favorites is undefined on older accounts
    const currentFavs = currentUser.favorites || [];
    const isFav = currentFavs.includes(slideId);

    const newFavs = isFav
      ? currentFavs.filter((id) => id !== slideId)
      : [...currentFavs, slideId];

    setCurrentUser((prev) => (prev ? { ...prev, favorites: newFavs } : null));

    await updateDoc(doc(db, "users", currentUser.id), {
      favorites: newFavs,
    });
  };

  const isFavorite = (slideId: string) => {
    return currentUser?.favorites?.includes(slideId) || false;
  };

  // === NEW: SPIRITUAL GEMS (NOTES) LOGIC ===
  const saveGem = async (reference: string, content: string) => {
    if (!currentUser) return;

    const currentGems = currentUser.gems || {};
    const newGems = { ...currentGems, [reference]: content };

    setCurrentUser((prev) => (prev ? { ...prev, gems: newGems } : null));

    await updateDoc(doc(db, "users", currentUser.id), {
      gems: newGems,
    });
  };

  const deleteGem = async (reference: string) => {
    if (!currentUser) return;

    const newGems = { ...(currentUser.gems || {}) };
    delete newGems[reference];

    setCurrentUser((prev) => (prev ? { ...prev, gems: newGems } : null));

    await updateDoc(doc(db, "users", currentUser.id), {
      gems: newGems,
    });
  };

  const getGem = (reference: string) => {
    return currentUser?.gems?.[reference] || "";
  };

  return (
    <MultiplayerContext.Provider
      value={{
        currentUser,
        allPlayers,
        isLoaded,
        registerUser,
        loginUser,
        logoutUser,
        markAsCompleted,
        toggleFavorite, // Exported
        isFavorite, // Exported
        saveGem, // Exported
        deleteGem, // Exported
        getGem, // Exported
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = () => useContext(MultiplayerContext);
