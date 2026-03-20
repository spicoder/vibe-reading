export default function CompletionMessage({
  starsEarned,
  nextChapterId,
}: {
  starsEarned: number;
  nextChapterId?: string | null;
}) {
  if (!nextChapterId) {
    return (
      <p className="text-amber-400 font-bold text-lg animate-in slide-in-from-bottom-2 fade-in duration-500 delay-150">
        Amazing! You have finished the entire book! 🏆✨
      </p>
    );
  }

  if (starsEarned === 3)
    return (
      <p className="text-amber-400 font-bold text-lg animate-in slide-in-from-bottom-2 fade-in duration-500 delay-500">
        Outstanding! You earned 3 Stars! 🌟
      </p>
    );
  if (starsEarned === 2)
    return (
      <p className="text-amber-200 text-md animate-in slide-in-from-bottom-2 fade-in duration-500 delay-300">
        You earned 2 Stars! Add gems (notes) to earn 3 next time! ✨
      </p>
    );
  return (
    <p className="text-stone-400 text-md animate-in slide-in-from-bottom-2 fade-in duration-500 delay-150">
      You earned 1 Star! Save favorites or add gems to earn more! ⭐
    </p>
  );
}
