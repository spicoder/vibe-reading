import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { StoryItem, SpeakerTheme } from "@/app/types";

interface StorySlideProps {
  currentSlide: StoryItem;
  direction: number;
  currentTheme: SpeakerTheme;
  currentChapter: number;
}

const variants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "circOut" },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    transition: { duration: 0.4, ease: "circIn" },
  }),
};

export function StorySlide({
  currentSlide,
  direction,
  currentTheme,
  currentChapter,
}: StorySlideProps) {
  const verseData = currentSlide.type === "verse" ? currentSlide.data : null;
  const visualData = currentSlide.type === "visual" ? currentSlide.data : null;

  return (
    <AnimatePresence initial={false} custom={direction} mode="popLayout">
      <motion.div
        key={currentSlide.id}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none"
      >
        {visualData ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center relative bg-black">
            <div className="absolute inset-0">
              {visualData.imageSrc && visualData.imageSrc.trim() !== "" ? (
                <Image
                  src={visualData.imageSrc}
                  alt={visualData.alt || ""}
                  fill
                  className="object-contain transition-transform duration-700"
                  priority
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60"></div>
            </div>
            <motion.div className="relative z-10 p-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8 shadow-xl">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  {visualData.description}
                </span>
              </div>
              <h2 className="text-4xl md:text-7xl font-black font-serif text-white mb-6 leading-tight tracking-tighter drop-shadow-2xl">
                {visualData.title}
              </h2>
            </motion.div>
          </div>
        ) : verseData ? (
          <div
            className={`w-full h-full flex flex-col relative justify-center transition-colors duration-700 ${currentTheme.container}`}
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[length:16px_16px]"></div>
            <div className="relative z-10 max-w-xl mx-auto w-full px-8">
              <p
                className={`font-serif leading-relaxed mb-6 transition-transform duration-300 ${currentTheme.text}`}
              >
                {verseData.text}
              </p>
            </div>
            <div className="absolute bottom-12 left-8 z-20">
              <p className="font-bold uppercase tracking-widest text-amber-500/80 text-xs">
                Isaias {currentChapter}:{verseData.verseDisplay}
              </p>
            </div>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
