"use client";

import { useState } from "react";
import Link from "next/link";
import { bibleBooks } from "@/app/lib/data";
import { useMultiplayer } from "@/app/lib/MultiplayerContext";
import { BookOpen, Store, LogOut, Bell, X } from "lucide-react"; // Imported X icon for individual deletion

export default function LibraryView() {
  const {
    currentUser,
    logoutUser,
    notifications,
    unreadCount,
    markNotificationRead,
    clearNotification,
    clearAllNotifications,
  } = useMultiplayer();

  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <main className="min-h-screen bg-[#FDFBF7] p-6 font-sans max-w-4xl mx-auto">
      <header className="px-2 py-5 border-b border-stone-100 bg-white/80 backdrop-blur-md z-10 flex justify-between items-center relative mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl shadow-inner border border-amber-200">
            {currentUser.avatar}
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-800 leading-tight">
              {currentUser.name}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {currentUser.completedChapters?.length || 0} chapters read
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="/store"
            className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2.5 rounded-full font-bold text-sm transition"
          >
            <Store size={18} />
            <span className="hidden sm:inline">Store</span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-3 bg-stone-100 hover:bg-stone-200 rounded-full transition relative"
            >
              <Bell size={20} className="text-stone-700" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-[#FDFBF7] rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifs && (
              <div className="absolute top-full -right-12 mt-3 w-80 bg-white shadow-2xl rounded-2xl border border-stone-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="bg-stone-50 px-4 py-3 border-b border-stone-100 flex justify-between items-center">
                  <h4 className="font-bold text-stone-800">Notifications</h4>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} New
                      </span>
                    )}
                    {/* NEW: Clear All UI */}
                    {notifications?.length > 0 && (
                      <button
                        onClick={() => clearAllNotifications()}
                        className="text-xs font-semibold text-stone-400 hover:text-red-500 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto p-2">
                  {notifications?.length === 0 && (
                    <p className="text-sm text-stone-500 text-center py-6">
                      All caught up!
                    </p>
                  )}
                  {notifications?.map((n: any) => (
                    <div
                      key={n.id}
                      onClick={() => !n.read && markNotificationRead(n.id)}
                      className={`group relative p-3 rounded-xl mb-1 cursor-pointer transition pr-8 ${
                        n.read
                          ? "opacity-60 hover:bg-stone-50"
                          : "bg-amber-50 hover:bg-amber-100"
                      }`}
                    >
                      <p className="text-sm text-stone-800 leading-snug">
                        {n.message}
                      </p>
                      {!n.read && (
                        <div className="text-xs text-amber-600 font-bold mt-2">
                          Click to mark read
                        </div>
                      )}

                      {/* NEW: Individual Clear Notification UI */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents marking as read when clicking the delete button
                          clearNotification(n.id);
                        }}
                        className="absolute top-3 right-3 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete notification"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
