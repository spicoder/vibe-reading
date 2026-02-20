"use client";
import React, { Suspense, useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  Check,
  Search,
  Trash2,
  Edit3,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useGems } from "@/app/lib/hooks";

function GemsEditor({ initialRef }: { initialRef: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const { getGem, saveGem, isLoaded } = useGems();
  const [note, setNote] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (isLoaded && !hasLoaded) {
      setNote(getGem(initialRef));
      setHasLoaded(true);
    }
  }, [isLoaded, hasLoaded, getGem, initialRef]);

  const handleSave = () => {
    saveGem(initialRef, note);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      <header className="flex items-center gap-4 p-6 sticky top-0 z-10 bg-[#FDFBF7]/90 backdrop-blur-md">
        <button
          onClick={() => {
            if (returnTo) {
              router.push(decodeURIComponent(returnTo));
            } else {
              router.push("/spiritual-gems");
            }
          }}
          className="p-2 bg-white border border-stone-200 rounded-full text-stone-600 hover:bg-stone-100 transition-colors shadow-sm"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="font-serif text-xl font-bold text-stone-900">
            Edit Note
          </h1>
          <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">
            Personal Reflection
          </p>
        </div>
      </header>

      <div className="flex-1 p-6 max-w-lg mx-auto w-full">
        <div className="bg-white border-l-4 border-amber-500 p-5 mb-8 rounded-r-xl shadow-sm">
          <p className="text-xs font-bold uppercase text-amber-600 mb-1 tracking-widest">
            Reference
          </p>
          <p className="font-serif text-2xl text-stone-900 font-bold">
            {initialRef}
          </p>
        </div>

        <div className="space-y-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type your spiritual gems here..."
            className="w-full h-[50vh] p-6 rounded-2xl bg-white border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-lg text-black placeholder:text-stone-300 outline-none transition-all resize-none shadow-sm leading-relaxed"
            autoFocus
          ></textarea>

          <button
            onClick={handleSave}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg active:scale-95 ${
              isSaved
                ? "bg-green-600 text-white"
                : "bg-stone-900 text-white hover:bg-black"
            }`}
          >
            {isSaved ? (
              <>
                <Check size={20} /> Saved
              </>
            ) : (
              <>
                <Save size={20} /> Save Note
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function GemsList() {
  const { allGems, deleteGem, isLoaded } = useGems();
  const [searchTerm, setSearchTerm] = useState("");

  // NEW: State for custom delete modal
  const [gemToDelete, setGemToDelete] = useState<string | null>(null);

  if (!isLoaded)
    return (
      <div className="p-10 text-center text-stone-400">Loading gems...</div>
    );

  const gemsArray = Object.entries(allGems).map(([ref, content]) => ({
    ref,
    content,
  }));
  const filteredGems = gemsArray.filter(
    (g) =>
      g.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7] relative">
      <header className="p-6 sticky top-0 z-10 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-100">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/"
            className="p-2 bg-white border border-stone-200 rounded-full text-stone-600 hover:bg-stone-100 transition-colors shadow-sm"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              Spiritual Gems
            </h1>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-widest">
              {gemsArray.length} Notes Saved
            </p>
          </div>
        </div>
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search your notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-stone-800 placeholder:text-stone-300 transition-all"
          />
        </div>
      </header>

      <div className="flex-1 p-6">
        {gemsArray.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-300">
              <MessageCircle size={40} />
            </div>
            <p className="font-serif text-xl text-stone-600 mb-2 font-bold">
              No gems yet
            </p>
            <p className="text-sm text-stone-400 max-w-xs mx-auto">
              Start reading and tap "Reply" on a verse to add your first note.
            </p>
            <Link
              href="/isaiah/1"
              className="mt-8 px-6 py-3 bg-stone-900 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-colors"
            >
              Go to Reading
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 max-w-2xl mx-auto pb-20">
            {filteredGems.length === 0 && (
              <p className="text-center text-stone-400 mt-10">
                No matches found.
              </p>
            )}
            {filteredGems.map((gem) => (
              <div
                key={gem.ref}
                className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 relative hover:border-amber-200 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <Link
                    href={`/spiritual-gems?ref=${encodeURIComponent(gem.ref)}`}
                    className="flex-1"
                  >
                    <span className="inline-block px-2 py-1 rounded bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest mb-1">
                      {gem.ref}
                    </span>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setGemToDelete(gem.ref); // Trigger the custom modal
                    }}
                    className="p-2 -mt-2 -mr-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
                <Link
                  href={`/spiritual-gems?ref=${encodeURIComponent(gem.ref)}`}
                  className="block group"
                >
                  <p className="text-stone-600 font-serif line-clamp-3 text-lg leading-relaxed group-hover:text-stone-900 transition-colors">
                    {gem.content || (
                      <span className="italic text-stone-300">
                        Empty note...
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 size={12} /> Tap to edit
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {gemToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold font-serif mb-2 text-stone-900">
              Delete Note?
            </h3>
            <p className="text-stone-500 mb-8 leading-relaxed">
              Are you sure you want to delete this spiritual gem? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setGemToDelete(null)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteGem(gemToDelete);
                  setGemToDelete(null);
                }}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GemsPageRouter() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  if (ref) return <GemsEditor initialRef={decodeURIComponent(ref)} />;
  return <GemsList />;
}

export default function SpiritualGemsPage() {
  return (
    <main>
      <Suspense fallback={<div className="min-h-screen bg-[#FDFBF7]" />}>
        <GemsPageRouter />
      </Suspense>
    </main>
  );
}
