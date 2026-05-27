import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Whiskey Bent Admin",
  description: "Admin control portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
