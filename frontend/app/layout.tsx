import type { Metadata } from "next";
import { plexSerif, plexSans, plexMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "100Plante",
  description:
    "Diagnostic de maladies foliaires par transfer learning — importez une photo, obtenez la maladie détectée et un score de confiance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${plexSerif.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
