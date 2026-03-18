"use client";

import { useState } from "react";
import Link from "next/link";
import { bibleBooks } from "@/app/lib/data";
import { useMultiplayer } from "@/app/lib/MultiplayerContext";
import { LogOut } from "lucide-react";

const AVATARS = ["🦊", "🐰", "🦁", "🐼", "🐯", "🐻", "🐸", "🦉"];

export default function Home() {
  const { registerUser, loginUser, logoutUser, currentUser, isLoaded } =
    useMultiplayer();

  // Form State
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoaded) return <div className="min-h-screen bg-[#FDFBF7]" />;

  // === AUTHENTICATION VIEW (If no device is linked) ===
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
          {isLoginMode ? "Link Device" : "Join the Map"}
        </h1>
        <p className="text-center text-stone-500 mb-8">
          {isLoginMode
            ? "Enter your unique username to sync your progress."
            : "Create a unique username to save your progress."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLoginMode && (
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest text-stone-400 mb-4 text-center">
                Select Your Avatar
              </label>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {AVATARS.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`text-4xl aspect-square rounded-2xl flex items-center justify-center transition-all ${
                      selectedAvatar === emoji
                        ? "bg-amber-100 border-2 border-amber-400 scale-110 shadow-lg"
                        : "bg-white border-2 border-transparent hover:bg-stone-50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                  Display Name (Visible on Map)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David"
                  className="w-full bg-white border-2 border-stone-200 rounded-2xl px-4 py-3 text-lg font-medium text-stone-900 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
              Unique Username (For Logging In)
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. david123"
              className="w-full bg-white border-2 border-stone-200 rounded-2xl px-4 py-3 text-lg font-medium text-stone-900 focus:outline-none focus:border-amber-400 lowercase"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-600 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-stone-900 text-white px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-stone-800 transition-colors shadow-xl disabled:opacity-50"
          >
            {isLoading
              ? "Loading..."
              : isLoginMode
                ? "Log In"
                : "Start Reading"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError("");
            }}
            className="text-stone-500 font-medium hover:text-stone-900 transition-colors"
          >
            {isLoginMode
              ? "Don't have an account? Create one"
              : "Already have an account? Link device"}
          </button>
        </div>
      </main>
    );
  }

  // === MAIN BOOK LIST VIEW (If user exists) ===
  return (
    <main className="min-h-screen bg-[#FDFBF7] p-6 pb-24 font-sans">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black font-serif text-stone-900">
            Library
          </h1>
          <p className="text-stone-500">Welcome back, {currentUser.name}!</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl bg-white w-14 h-14 flex items-center justify-center rounded-full shadow-sm border border-stone-100">
            {currentUser.avatar}
          </div>
          <button
            onClick={logoutUser}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </header>

      <div className="grid gap-6">
        {Object.entries(bibleBooks).map(([id, book]) => (
          <Link key={id} href={`/book/${id}`} className="block group">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-all group-hover:border-amber-200 group-hover:scale-[1.02]">
              <h2 className="text-2xl font-bold font-serif text-stone-900">
                {book.title}
              </h2>
              <p className="text-stone-500 mt-1">
                {Object.keys(book.chapters).length} Chapters
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
