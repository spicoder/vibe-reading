import { PlayerProfile } from "@/app/lib/MultiplayerContext";

export default function MapAvatar({
  avatarPos,
  mapWidth,
  currentUser,
}: {
  avatarPos: { x: number; y: number };
  mapWidth: number;
  currentUser: PlayerProfile | null;
}) {
  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        left: `${(avatarPos.x / mapWidth) * 100}%`,
        top: avatarPos.y,
        transform: "translate(-50%, -120%)",
        transition: "left 1.2s ease-in-out, top 1.2s ease-in-out",
      }}
    >
      <div className="text-4xl drop-shadow-2xl animate-[bounce_2s_infinite]">
        {currentUser?.avatar || "👤"}
        <p className="text-black text-center text-xs bg-white border border-stone-200">{`${currentUser?.name}`}</p>
      </div>
    </div>
  );
}
