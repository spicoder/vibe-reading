import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { StoryItem } from "@/app/types";
import { speakerThemes } from "@/app/lib/speakerThemes";

const getSpeakerTheme = (speakerName: string) => {
  return speakerThemes[speakerName] || speakerThemes.default;
};

interface StoryGridProps {
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  currentChapter: number;
  slides: StoryItem[];
  currentIndex: number;
  onSelectSlide: (idx: number) => void;
}

export function StoryGrid({
  showGrid,
  setShowGrid,
  currentChapter,
  slides,
  currentIndex,
  onSelectSlide,
}: StoryGridProps) {
  if (!showGrid) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto overflow-x-hidden p-4 touch-auto select-auto"
      >
        <div className="flex justify-between items-center mb-6 sticky top-0 z-10 py-2 bg-black/40 backdrop-blur-sm -mx-4 px-4 rounded-b-xl">
          <h3 className="text-xl font-bold font-serif">
            Chapter {currentChapter}
          </h3>
          <button
            onClick={() => setShowGrid(false)}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-20">
          {slides.map((slide, idx) => {
            if (slide.type === "visual") {
              const vData = slide.data;
              return (
                <div
                  key={slide.id}
                  onClick={() => onSelectSlide(idx)}
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                    currentIndex === idx
                      ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  <div className="w-full h-full bg-stone-900 relative">
                    {vData.imageSrc && vData.imageSrc.trim() !== "" && (
                      <Image
                        src={vData.imageSrc}
                        alt=""
                        fill
                        className="object-cover opacity-60"
                      />
                    )}
                    <div className="absolute inset-0 p-3 flex flex-col justify-center bg-gradient-to-t from-black via-black/40 to-transparent">
                      <span className="text-[10px] text-center font-bold text-amber-400 uppercase tracking-widest mb-1">
                        {vData.description}
                      </span>
                      <span className="text-sm text-center font-bold font-serif leading-tight">
                        {vData.title}
                      </span>
                    </div>
                  </div>
                </div>
              );
            } else {
              const vData = slide.data;
              const theme = getSpeakerTheme(vData.speaker);
              return (
                <div
                  key={slide.id}
                  onClick={() => onSelectSlide(idx)}
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all flex flex-col p-4 ${theme.container} ${
                    currentIndex === idx
                      ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[length:16px_16px]"></div>
                  <div className="relative z-10 flex-1 flex flex-col">
                    <div className="mb-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${theme.badge}`}
                      >
                        {vData.speaker}
                      </span>
                    </div>
                    <p
                      className={`text-xs line-clamp-6 font-serif ${theme.text}`}
                    >
                      {vData.text}
                    </p>
                    <div className="mt-auto pt-2">
                      <span className="text-[10px] font-bold uppercase text-amber-500/80">
                        Verse {vData.verseDisplay}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
