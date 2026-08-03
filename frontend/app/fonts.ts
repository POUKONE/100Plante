import localFont from "next/font/local";

export const plexSerif = localFont({
  src: "./fonts/plex_serif_500.woff2",
  weight: "500",
  variable: "--font-plex-serif",
  display: "swap",
});

export const plexSans = localFont({
  src: [
    { path: "./fonts/plex_sans_400.woff2", weight: "400" },
    { path: "./fonts/plex_sans_600.woff2", weight: "600" },
  ],
  variable: "--font-plex-sans",
  display: "swap",
});

export const plexMono = localFont({
  src: [
    { path: "./fonts/plex_mono_400.woff2", weight: "400" },
    { path: "./fonts/plex_mono_500.woff2", weight: "500" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
});
