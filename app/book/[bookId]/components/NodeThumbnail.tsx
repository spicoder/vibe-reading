import Image from "next/image";

interface NodeThumbnailProps {
  thumbnail?: string;
  chapterNumber: string;
  isRightSide: boolean;
  isActive: boolean;
}

export default function NodeThumbnail({
  thumbnail,
  chapterNumber,
  isRightSide,
  isActive,
}: NodeThumbnailProps) {
  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-2 w-max
      ${isRightSide ? "right-full mr-3 flex-row-reverse" : "left-full ml-3"}
      ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-all duration-300 pointer-events-none`}
    >
      <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-xl shadow-sm flex items-center gap-2 border border-stone-100">
        {thumbnail ? (
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden relative border border-stone-200">
            <Image src={thumbnail} alt="" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center">
            <span className="font-serif text-stone-400 font-bold text-sm">
              {chapterNumber}
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
            {chapterNumber}
          </span>
        </div>
      </div>
    </div>
  );
}
