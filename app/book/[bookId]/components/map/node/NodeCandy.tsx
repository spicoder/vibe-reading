export default function NodeCandy({
  id,
  isActive,
  isDone,
}: {
  id: string;
  isActive: boolean;
  isDone: boolean;
}) {
  return (
    <div
      className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 relative font-black text-2xl
      ${
        isActive
          ? `bg-green-400 border-[3px] border-white shadow-[0_6px_0_#16a34a,0_10px_15px_rgba(0,0,0,0.2)] scale-[1.15] z-20 text-white`
          : isDone
            ? `bg-amber-400 border-[3px] border-white shadow-[0_6px_0_#d97706,0_8px_10px_rgba(0,0,0,0.15)] text-white hover:shadow-[0_3px_0_#d97706,0_5px_10px_rgba(0,0,0,0.15)] z-10`
            : `bg-stone-200 border-[3px] border-white text-stone-400 scale-90 shadow-[0_4px_0_#a8a29e,0_5px_10px_rgba(0,0,0,0.1)] z-0`
      }`}
    >
      <div className="transform -translate-y-0.5">{id}</div>
    </div>
  );
}
