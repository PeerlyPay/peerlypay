import type { Metadata } from "next";
import LayoutShell from "@/components/LayoutShell";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "PeerlyPay",
  description: "P2P Exchange on Stellar",
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
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <Providers>
          <LayoutShell>{children}</LayoutShell>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
