import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "ProDératisation - Expert en lutte antiparasitaire à Paris",
  description: "Débarrassez-vous des rats, cafards, punaises de lit et frelons. Intervention sous 24h, devis gratuit.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
