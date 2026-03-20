"use client";

import LibraryHeader from "./LibraryHeader";
import LibraryBookGrid from "./LibraryBookGrid";

export default function LibraryView() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] p-6 font-sans max-w-4xl mx-auto">
      <LibraryHeader />
      <LibraryBookGrid />
    </main>
  );
}
