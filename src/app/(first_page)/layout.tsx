import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import "../globals.css";

const inter = Inter({ subsets: ["latin"] });
import Navbar from "@/components/layouts/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Navbar></Navbar>
        {children}
      </body>
    </html>
  );
}
