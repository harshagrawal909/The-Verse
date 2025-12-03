import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import Provider from "./Provider";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Verse",
  description:
    "Explore The Verse — a creative portfolio and storytelling universe by Harsh Agrawal. Discover writings, projects, and tales crafted with imagination and heart.",
  icons:{
    icon: "/favicon.png",
  },
  keywords: [
    "Harsh Agrawal",
    "The Verse",
    "writer portfolio",
    "stories",
    "fantasy fiction",
    "creative writing",
  ],
  authors: [{ name: "Harsh Agrawal" }],
  
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="192x192" />

      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
