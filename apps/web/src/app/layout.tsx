import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "STRATIX AI - Competitive Intelligence Platform",
  description: "Premium AI-powered competitive intelligence and positioning platform",
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
