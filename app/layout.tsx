import type { Metadata } from "next";
// 1. Import the fonts from Google
import { Fraunces, Nunito } from "next/font/google";
import "./globals.css";

// 2. Configure the fonts
const fraunces = Fraunces({
  subsets: ["latin"],
  // We define a variable name to use in Tailwind
  variable: "--font-fraunces",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vibe Reading",
  description: "Bible Stories",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* 3. Add the variables to the body class */}
      <body
        className={`${fraunces.variable} ${nunito.variable} font-sans bg-[#FDFBF7]`}
      >
        {children}
      </body>
    </html>
  );
}
