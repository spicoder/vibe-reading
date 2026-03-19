export const getBookTheme = (bookId: string) => {
  const themes = [
    {
      path: "text-amber-200",
      doneBg: "bg-amber-400",
      doneBorder: "border-amber-200",
      activeBorder: "border-amber-500",
      text: "text-amber-900",
    },
    {
      path: "text-emerald-200",
      doneBg: "bg-emerald-400",
      doneBorder: "border-emerald-200",
      activeBorder: "border-emerald-500",
      text: "text-emerald-900",
    },
    {
      path: "text-blue-200",
      doneBg: "bg-blue-400",
      doneBorder: "border-blue-200",
      activeBorder: "border-blue-500",
      text: "text-blue-900",
    },
    {
      path: "text-rose-200",
      doneBg: "bg-rose-400",
      doneBorder: "border-rose-200",
      activeBorder: "border-rose-500",
      text: "text-rose-900",
    },
    {
      path: "text-violet-200",
      doneBg: "bg-violet-400",
      doneBorder: "border-violet-200",
      activeBorder: "border-violet-500",
      text: "text-violet-900",
    },
  ];

  const hash = bookId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return themes[hash % themes.length];
};
