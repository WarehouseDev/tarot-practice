import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Tvoj Online Tarot",
  description:
    "Besplatno online tumačenje tarot karata! Otkrij tajne sudbine na tvojtarot.com. Dobijte odgovore na pitanja o ljubavi, poslu i budućnosti.",
  icons: {
    icon: [{ url: "/logo-pentacles.png" }],
  },
};

export const viewport = {
  themeColor: "#0B0D14",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
