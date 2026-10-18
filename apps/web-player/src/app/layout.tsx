import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Whiskey Bent Social Casino",
  description: "Whiskey Bent Social Casino, a social gaming platform in development.",
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
