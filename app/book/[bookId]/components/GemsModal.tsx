import { X } from "lucide-react";
import { PlayerProfile } from "@/app/lib/MultiplayerContext";

interface CommunityGemsModalProps {
  bookTitle: string;
  viewingGems: {
    chapter: string;
    gems: { player: PlayerProfile; ref: string; content: string }[];
  };
  onClose: () => void;
}

export default function CommunityGemsModal({
  bookTitle,
  viewingGems,
  onClose,
}: CommunityGemsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-3xl p-6 max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
          <div>
            <h3 className="text-xl font-bold font-serif text-stone-900">
              Community Gems
            </h3>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mt-1">
              {bookTitle} Chapter {viewingGems.chapter}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white border border-stone-200 text-stone-400 hover:bg-stone-50 hover:text-stone-700 rounded-full transition-colors shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-2">
          {viewingGems.gems.map((gem, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm relative"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-white border-2 border-stone-100 flex items-center justify-center text-sm shadow-sm shrink-0">
                  {gem.player.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900 leading-none">
                    {gem.player.name}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mt-1">
                    {gem.ref}
                  </p>
                </div>
              </div>
              <div className="text-stone-700 font-serif leading-relaxed text-sm bg-stone-50 p-3.5 rounded-xl border border-stone-100 whitespace-pre-wrap">
                {gem.content || (
                  <span className="italic text-stone-400">Empty note...</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
