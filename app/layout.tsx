import type { Metadata } from "next";
import { Geist, Geist_Mono ,Inter} from "next/font/google";
import "./globals.css";
import Header from "@/components/Header"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PayTrackr",
  description: "The Smart Payments Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header/>
        {children}</body>
    </html>
  );
}
