import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "My App",
  description: "Modern app with role-based dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
