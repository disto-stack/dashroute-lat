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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=Figtree:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
