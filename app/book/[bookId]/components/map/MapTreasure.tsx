import { Trophy, Crown } from "lucide-react";

export default function MapTreasure({
  x,
  y,
  mapWidth,
}: {
  x: number;
  y: number;
  mapWidth: number;
}) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20 animate-[bounce_3s_infinite]"
      style={{ left: `${(x / mapWidth) * 100}%`, top: y }}
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
  );
}
