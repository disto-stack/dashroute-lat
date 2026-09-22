import type { Metadata } from "next";
import "@dashroute/ui-tokens/tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Web",
  description: "DashRoute Admin Web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
