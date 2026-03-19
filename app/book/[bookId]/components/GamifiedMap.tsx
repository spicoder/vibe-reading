import Link from "next/link";
import Image from "next/image";
import { Star, Lock, MessageCircle } from "lucide-react";
import { PlayerProfile } from "@/app/lib/MultiplayerContext";

interface GamifiedMapProps {
  book: any;
  bookId: string;
  chapters: [string, any][];
  completedChapters: string[];
  nextChapterId: string;
  theme: any;
  currentUser: PlayerProfile | null;
  allPlayers: PlayerProfile[];
  isLoaded: boolean;
  mounted: boolean;
  onViewGems: (gemsData: { chapter: string; gems: any[] }) => void;
}

export default function GamifiedMap({
  book,
  bookId,
  chapters,
  completedChapters,
  nextChapterId,
  theme,
  currentUser,
  allPlayers,
  isLoaded,
  mounted,
  onViewGems,
}: GamifiedMapProps) {
  const MAP_WIDTH = 400;
  const NODE_SPACING = 140;

  const nodePositions = chapters.map(([id, chapter], i) => {
    const x = 200 + Math.sin(i * 0.7) * 90;
    const y = i * NODE_SPACING + 80;
    return { id, chapter, x, y, i };
  });

  const containerHeight = chapters.length * NODE_SPACING + 160;

  let pathD = "";
  if (nodePositions.length > 0) {
    pathD = `M ${nodePositions[0].x} ${nodePositions[0].y}`;
    for (let i = 1; i < nodePositions.length; i++) {
      const prev = nodePositions[i - 1];
      const curr = nodePositions[i];
      pathD += ` C ${prev.x} ${prev.y + 60}, ${curr.x} ${curr.y - 60}, ${curr.x} ${curr.y}`;
    }
  }

  return (
    <section className="w-full overflow-hidden px-4">
      <div
        className={`relative mx-auto w-full max-w-[400px] transition-opacity duration-500 ${mounted && isLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ height: containerHeight }}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm"
          viewBox={`0 0 ${MAP_WIDTH} ${containerHeight}`}
          preserveAspectRatio="none"
        >
          <path
            d={pathD}
            fill="none"
            className={theme.path}
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="0 22"
          />
        </svg>

        {nodePositions.map((pos) => {
          const isDone = completedChapters.includes(`${bookId}-${pos.id}`);
          const isActive = !isDone && pos.id === nextChapterId;
          const thumbnail = pos.chapter.visuals[0]?.imageSrc;
          const isRightSide = pos.x > 200;

          const playersOnThisNode = allPlayers.filter((player) => {
            if (player.id === currentUser?.id) return false;
            const playerNextChapter =
              chapters.find(
                ([id]) => !player.completedChapters.includes(`${bookId}-${id}`),
              )?.[0] || "1";
            return playerNextChapter === pos.id;
          });

          const chapterPrefix = `${book.title} ${pos.id}:`;
          const communityGems: any[] = [];

          allPlayers.forEach((player) => {
            if (!player.gems) return;
            Object.entries(player.gems).forEach(([ref, content]) => {
              if (ref.startsWith(chapterPrefix)) {
                communityGems.push({ player, ref, content: content as string });
              }
            });
          });

          return (
            <div
              key={pos.id}
              style={{ left: `${(pos.x / MAP_WIDTH) * 100}%`, top: pos.y }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
            >
              <Link
                href={`/book/${bookId}/${pos.id}`}
                className="relative group flex items-center justify-center"
              >
                {/* Node Button */}
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 relative
                  ${
                    isActive
                      ? `bg-white border-4 ${theme.activeBorder} shadow-[0_0_30px_rgba(0,0,0,0.15)] scale-[1.3] z-20 animate-[bounce_2s_infinite]`
                      : isDone
                        ? `${theme.doneBg} border-4 ${theme.doneBorder} shadow-lg text-white scale-100 hover:scale-110 z-10`
                        : `bg-stone-100 border-4 border-stone-200 text-stone-300 scale-90 hover:scale-100 z-0 hover:border-stone-300`
                  }`}
                >
                  {isActive ? (
                    <span className="text-3xl md:text-4xl drop-shadow-md pb-1">
                      {currentUser?.avatar || "👤"}
                    </span>
                  ) : isDone ? (
                    <Star className="fill-white text-white" size={20} />
                  ) : (
                    <Lock size={18} />
                  )}
                </div>

                {/* Multiplayer Avatars */}
                {playersOnThisNode.length > 0 && (
                  <div className="absolute -top-3 -right-3 flex -space-x-2 z-30">
                    {playersOnThisNode.slice(0, 3).map((player) => (
                      <div
                        key={player.id}
                        className="w-8 h-8 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center text-sm shadow-md"
                        title={player.name}
                      >
                        {player.avatar}
                      </div>
                    ))}
                    {playersOnThisNode.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-stone-100 border-2 border-stone-200 flex items-center justify-center text-xs font-bold text-stone-500 shadow-md">
                        +{playersOnThisNode.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Community Gems */}
                {communityGems.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onViewGems({ chapter: pos.id, gems: communityGems });
                    }}
                    className="absolute -bottom-2 -left-2 w-8 h-8 bg-amber-50 border-2 border-white rounded-full flex items-center justify-center text-amber-500 shadow-md hover:scale-110 hover:bg-amber-100 transition-all z-40"
                    title={`View ${communityGems.length} community gems`}
                  >
                    <MessageCircle size={14} className="fill-amber-200" />
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                      {communityGems.length}
                    </span>
                  </button>
                )}

                {/* Thumbnail Signpost */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-3 w-max
                  ${isRightSide ? "right-full mr-3 flex-row-reverse" : "left-full ml-3"}
                  ${isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"} transition-all duration-300`}
                >
                  {thumbnail ? (
                    <div
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden relative shadow-md shrink-0 border-2 ${isActive ? theme.activeBorder : "border-white"}`}
                    >
                      <Image
                        src={thumbnail}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-stone-200 border-2 border-white flex items-center justify-center">
                      <span className="font-serif text-stone-400 font-bold">
                        {pos.chapter.chapter}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex flex-col ${isRightSide ? "items-end" : "items-start"} drop-shadow-sm`}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? theme.text : "text-stone-400"} mb-0.5`}
                    >
                      Chapter
                    </span>
                    <span
                      className={`text-xl font-black font-serif ${isActive ? "text-stone-900" : "text-stone-600"} leading-none`}
                    >
                      {pos.chapter.chapter}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
