import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

// Variable Inter (no fixed weights), so the theme's in-between Medium (560)
// renders as set.
const inter = Inter({
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-curio-serif",
});

export const metadata: Metadata = {
  title: "Curio.city",
  description: "Curio.city — a curious little chatbot that builds interfaces as it talks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${playfair.variable}`}>{children}</body>
    </html>
  );
}
