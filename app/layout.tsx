import type { Metadata } from "next";
import "./globals.css";
import { MultiplayerProvider } from "@/app/lib/MultiplayerContext";

export const metadata: Metadata = {
  title: "Vibe Reading",
  description: "Bible Vibe Reading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-[#FDFBF7]`} suppressHydrationWarning>
        <MultiplayerProvider>{children}</MultiplayerProvider>
      </body>
    </html>
  );
}
