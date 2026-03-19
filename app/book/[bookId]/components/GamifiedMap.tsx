import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Trophy, Crown } from "lucide-react";
import { PlayerProfile } from "@/app/lib/MultiplayerContext";
import { useEffect, useRef } from "react";

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
  const activeNodeRef = useRef<HTMLDivElement>(null);

  const MAP_WIDTH = 400;
  const NODE_SPACING = 150;
  const containerHeight = chapters.length * NODE_SPACING + 250;

  // Invert the Y-axis so Chapter 1 starts at the bottom and goes "uphill"
  const nodePositions = chapters.map(([id, chapter], i) => {
    const x = 200 + Math.sin(i * 0.8) * 110;
    const y = containerHeight - (i * NODE_SPACING + 150);
    return { id, chapter, x, y, i };
  });

  const treasureX = 200;
  const treasureY =
    nodePositions.length > 0
      ? nodePositions[nodePositions.length - 1].y - 130
      : 100;

  let pathD = "";
  if (nodePositions.length > 0) {
    pathD = `M ${nodePositions[0].x} ${nodePositions[0].y}`;
    for (let i = 1; i < nodePositions.length; i++) {
      const prev = nodePositions[i - 1];
      const curr = nodePositions[i];
      pathD += ` C ${prev.x} ${prev.y - 75}, ${curr.x} ${curr.y + 75}, ${curr.x} ${curr.y}`;
    }
    const lastNode = nodePositions[nodePositions.length - 1];
    pathD += ` C ${lastNode.x} ${lastNode.y - 65}, ${treasureX} ${treasureY + 65}, ${treasureX} ${treasureY + 20}`;
  }

  // Sparsely generated background scenery (Reduced density)
  const sceneryElements: any[] = [];
  const numSceneryRow = Math.floor(containerHeight / 180); // Increased spacing from 90 to 180

  for (let i = 0; i < numSceneryRow; i++) {
    const y = containerHeight - (i * 180 + 60);
    const rollLeft = Math.abs(Math.sin(i * 21));
    const rollRight = Math.abs(Math.cos(i * 23));

    const getType = (roll: number) => {
      if (roll > 0.7) return "pine";
      if (roll > 0.4) return "tree";
      if (roll > 0.2) return "bush";
      return "cloud";
    };

    sceneryElements.push({
      id: `scen-L-${i}`,
      type: getType(rollLeft),
      x: 20 + rollLeft * 40,
      y: y + rollLeft * 40,
      scale: 0.7 + rollLeft * 0.3,
      flip: rollLeft > 0.5,
    });

    sceneryElements.push({
      id: `scen-R-${i}`,
      type: getType(rollRight),
      x: MAP_WIDTH - 20 - rollRight * 40,
      y: y + rollRight * 40,
      scale: 0.7 + rollRight * 0.3,
      flip: rollRight > 0.5,
    });
  }

  const renderScenery = (item: any) => {
    const transform = `scale(${item.scale}) ${item.flip ? "scaleX(-1)" : ""}`;

    // Define the source based on the type
    let imageSrc = "";
    if (item.type === "pine") imageSrc = "/assets/3d/pine-tree.png";
    if (item.type === "tree") imageSrc = "/assets/3d/round-tree.png";
    if (item.type === "bush") imageSrc = "/assets/3d/bush.png";
    if (item.type === "cloud") imageSrc = "/assets/3d/cloud.png";

    if (!imageSrc) return null;

    return (
      <div
        className="relative drop-shadow-lg opacity-90 transition-transform hover:scale-110"
        style={{ transform }}
      >
        <Image
          src={imageSrc}
          alt={`${item.type} scenery`}
          width={80} // Adjust base size based on your assets
          height={80}
          className="object-contain"
        />
      </div>
    );
  };

  useEffect(() => {
    if (mounted && isLoaded && activeNodeRef.current) {
      setTimeout(() => {
        activeNodeRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  }, [mounted, isLoaded, nextChapterId]);

  return (
    <section className="w-full overflow-hidden px-4 py-8 relative">
      <div
        className={`relative mx-auto w-full max-w-[450px] transition-opacity duration-1000 ${
          mounted && isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ height: containerHeight }}
      >
        {/* SVG Volumetric Road Layers */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md z-0"
          viewBox={`0 0 ${MAP_WIDTH} ${containerHeight}`}
          preserveAspectRatio="none"
        >
          <path
            d={pathD}
            fill="none"
            stroke="#d4c5b0"
            strokeWidth="60"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0, 12)"
            className="opacity-50"
          />
          <path
            d={pathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth="60"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />
          <path
            d={pathD}
            fill="none"
            stroke="#e7e5e4"
            strokeWidth="4"
            strokeDasharray="12 20"
            strokeLinecap="round"
          />
        </svg>

        {/* Scenery Layer */}
        {sceneryElements.map((item) => (
          <div
            key={item.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
            style={{ left: `${(item.x / MAP_WIDTH) * 100}%`, top: item.y }}
          >
            {renderScenery(item)}
          </div>
        ))}

        {/* Streamlined Treasure Design */}
        {nodePositions.length > 0 && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20 animate-[bounce_3s_infinite]"
            style={{
              left: `${(treasureX / MAP_WIDTH) * 100}%`,
              top: treasureY,
            }}
          >
            <div className="relative group cursor-pointer hover:scale-110 transition-transform duration-300 flex flex-col items-center">
              <div className="absolute inset-0 bg-amber-400 blur-[25px] opacity-40 rounded-full scale-[2]"></div>
              <Crown
                size={40}
                className="text-amber-400 drop-shadow-md z-30 -mb-3 fill-amber-300"
              />
              <Trophy
                size={56}
                className="text-amber-300 drop-shadow-lg z-20 fill-amber-200"
              />
            </div>
          </div>
        )}

        {/* Chapter Nodes */}
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

          const communityGems: any[] = [];
          const chapterPrefix = `${book.title} ${pos.id}:`;
          allPlayers.forEach((player) => {
            if (!player.gems) return;
            Object.entries(player.gems).forEach(([ref, content]) => {
              if (ref.startsWith(chapterPrefix))
                communityGems.push({ player, ref, content: content as string });
            });
          });

          return (
            <div
              key={pos.id}
              ref={isActive ? activeNodeRef : null}
              style={{ left: `${(pos.x / MAP_WIDTH) * 100}%`, top: pos.y }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-30"
            >
              <Link
                href={`/book/${bookId}/${pos.id}`}
                className={`relative group flex items-center justify-center transition-transform duration-300 ${isDone ? "hover:-translate-y-1" : ""}`}
              >
                {/* Cleaned up 3D Candy Node Button */}
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 relative font-black text-2xl
                  ${
                    isActive
                      ? `bg-green-400 border-[3px] border-white shadow-[0_6px_0_#16a34a,0_10px_15px_rgba(0,0,0,0.2)] scale-[1.15] z-20 text-white animate-[bounce_2s_infinite]`
                      : isDone
                        ? `bg-amber-400 border-[3px] border-white shadow-[0_6px_0_#d97706,0_8px_10px_rgba(0,0,0,0.15)] text-white hover:shadow-[0_3px_0_#d97706,0_5px_10px_rgba(0,0,0,0.15)] z-10`
                        : `bg-stone-200 border-[3px] border-white text-stone-400 scale-90 shadow-[0_4px_0_#a8a29e,0_5px_10px_rgba(0,0,0,0.1)] z-0`
                  }`}
                >
                  <div className="transform -translate-y-0.5">{pos.id}</div>

                  {/* Only show avatar badge for the active state to reduce noise */}
                  {isActive && (
                    <div className="absolute -top-3 -right-3 text-2xl drop-shadow-sm z-30">
                      {currentUser?.avatar || "👤"}
                    </div>
                  )}
                </div>

                {/* Multiplayer Avatars */}
                {playersOnThisNode.length > 0 && (
                  <div className="absolute -top-3 -left-5 flex -space-x-2 z-30 drop-shadow-sm">
                    {playersOnThisNode.slice(0, 3).map((player) => (
                      <div
                        key={player.id}
                        className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center text-xs shadow-sm"
                        title={player.name}
                      >
                        {player.avatar}
                      </div>
                    ))}
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
                    className="absolute -bottom-2 -left-2 w-8 h-8 bg-amber-50 border-2 border-white rounded-full flex items-center justify-center text-amber-500 shadow-sm hover:scale-110 transition-all z-40"
                  >
                    <MessageCircle size={14} className="fill-amber-200" />
                  </button>
                )}

                {/* Thumbnail Signpost */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-2 w-max
                  ${isRightSide ? "right-full mr-3 flex-row-reverse" : "left-full ml-3"}
                  ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-all duration-300 pointer-events-none`}
                >
                  <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-xl shadow-sm flex items-center gap-2 border border-stone-100">
                    {thumbnail ? (
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden relative border border-stone-200">
                        <Image
                          src={thumbnail}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center">
                        <span className="font-serif text-stone-400 font-bold text-sm">
                          {pos.chapter.chapter}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex flex-col px-1 ${isRightSide ? "items-end text-right" : "items-start text-left"}`}
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-0.5">
                        Chapter
                      </span>
                      <span className="text-lg font-black font-serif text-stone-700 leading-none">
                        {pos.chapter.chapter}
                      </span>
                    </div>
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
