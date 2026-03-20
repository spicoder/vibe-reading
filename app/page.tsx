"use client";

import { useState } from "react";
import Link from "next/link";
import { bibleBooks } from "@/app/lib/data";
import { useMultiplayer } from "@/app/lib/MultiplayerContext";
import { LogOut, BookOpen } from "lucide-react";

const AVATARS = [
  "🦊",
  "🐰",
  "🦁",
  "🐼",
  "🐯",
  "🐻",
  "🐸",
  "🦉",
  "🍕",
  "🍅",
  "🥔",
  "🍆",
  "🥕",
  "🥬",
];

export default function Home() {
  const { registerUser, loginUser, logoutUser, currentUser, isLoaded } =
    useMultiplayer();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoaded || (currentUser && currentUser.avatar === "⏳")) {
    return <div className="min-h-screen bg-[#FDFBF7]" />;
  }

  // === AUTHENTICATION VIEW ===
  if (!currentUser) {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setIsLoading(true);
      try {
        if (isLoginMode) {
          await loginUser(username);
        } else {
          if (name.trim().length < 2)
            throw new Error("Display Name must be at least 2 characters.");
          await registerUser(username, name, selectedAvatar);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <main className="min-h-screen bg-[#FDFBF7] p-6 pb-24 font-sans max-w-md mx-auto flex flex-col justify-center">
        <h1 className="text-3xl font-black font-serif text-stone-900 mb-2 text-center">
          {isLoginMode ? "Login" : "Join the Map"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
          {!isLoginMode && (
            <div className="flex flex-col gap-2 mb-8">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500">
                Choose Avatar
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setSelectedAvatar(a)}
                    className={`text-3xl w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${selectedAvatar === a ? "bg-amber-200 ring-4 ring-amber-400 scale-110" : "bg-stone-100 hover:bg-stone-200"}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500">
              Username (Unique ID)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. cool-reader-99"
              className="bg-stone-100 border-none rounded-2xl p-4 font-medium outline-none focus:ring-2 focus:ring-amber-400 text-black"
              required
            />
          </div>

          {!isLoginMode && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Isaiah"
                className="bg-stone-100 border-none rounded-2xl p-4 font-medium text-black outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-stone-900 text-white font-bold uppercase tracking-widest p-4 rounded-2xl mt-4 hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            {isLoading
              ? "Loading..."
              : isLoginMode
                ? "Log In"
                : "Create Account"}
          </button>
        </form>

        <button
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setError("");
          }}
          className="mt-6 text-stone-500 text-sm font-medium hover:text-stone-900 transition-colors"
        >
          {isLoginMode
            ? "Need an account? Sign up"
            : "Already have an account? Log in"}
        </button>
      </main>
    );
  }

  // === LIBRARY VIEW ===
  return (
    <main className="min-h-screen bg-[#FDFBF7] p-6 font-sans max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-12 mt-6">
        <div>
          <h1 className="text-4xl font-black font-serif text-stone-900">
            Library
          </h1>
          <p className="text-stone-500 font-medium text-sm">
            Where would you like to explore, {currentUser.name}?
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-3xl bg-stone-100 w-12 h-12 flex items-center justify-center rounded-full shadow-sm">
            {currentUser.avatar}
          </div>
          <button
            onClick={logoutUser}
            className="text-stone-400 hover:text-stone-900 transition-colors p-2"
          >
            <LogOut size={24} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(bibleBooks).map(([id, book]) => (
          <Link
            href={`/book/${id}`}
            key={id}
            className="group bg-white p-6 rounded-3xl shadow-sm border border-stone-100 hover:shadow-xl hover:border-amber-200 transition-all flex flex-col gap-4"
          >
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <BookOpen size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-serif text-stone-900">
                {book.title}
              </h2>
              <p className="text-stone-500 font-medium">
                {Object.keys(book.chapters).length} Chapters
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-amber-600 font-bold uppercase tracking-widest text-sm group-hover:gap-2 transition-all">
              Enter Map &rarr;
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
