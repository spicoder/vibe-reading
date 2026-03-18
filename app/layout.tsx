import type { Metadata } from "next";
import "./globals.css";

// 1. Import the new Provider
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
        {" "}
        {/* 2. Wrap the children with the Provider */}
        <MultiplayerProvider>{children}</MultiplayerProvider>
      </body>
    </html>
  );
}
