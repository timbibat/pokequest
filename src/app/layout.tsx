import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pokequest-explorer.vercel.app"),
  title: {
    default: "PokéQuest Explorer - Next-Gen Pokédex & Battle Party Deck",
    template: "%s | PokéQuest Explorer",
  },
  description:
    "Explore all 151 Generation 1 Pokémon with a stunning interactive Pokédex and team-builder. Search, filter by type, sort, and build synergistic battle parties — powered by PokeAPI.",
  authors: [{ name: "Timothy Irwin Bibat" }],
  creator: "Timothy Irwin Bibat",
  publisher: "Timothy Irwin Bibat",
  keywords: [
    "Pokédex",
    "Pokémon",
    "Generation 1",
    "team builder",
    "battle party",
    "PokeAPI",
    "interactive",
    "Next.js",
    "PokéQuest",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "PokéQuest Explorer - Next-Gen Pokédex & Battle Party Deck",
    description:
      "Explore all 151 Gen 1 Pokémon. Search, filter, sort, and build synergistic battle parties with a beautiful interactive Pokédex.",
    siteName: "PokéQuest Explorer",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PokéQuest Explorer — Interactive Pokédex & Team Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PokéQuest Explorer - Next-Gen Pokédex & Battle Party Deck",
    description:
      "Explore 151 Gen 1 Pokémon. Search, filter, sort, and build synergistic battle parties.",
    images: ["/og-image.png"],
    creator: "@timbibat",
  },

  manifest: "/manifest.json",
  other: {
    "theme-color": "#0f172a",
    "color-scheme": "dark",
    "msapplication-TileColor": "#0f172a",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable} h-full`} suppressHydrationWarning>
      <body className="h-full antialiased font-sans bg-slate-950 text-slate-100" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
