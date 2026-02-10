import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import LayoutShell from "@/components/LayoutShell";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { Providers } from "./providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

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
      <body className={`${dmSans.variable} ${spaceGrotesk.variable} font-sans`}>
        <Providers>
          <UserProvider>
            <LayoutShell>{children}</LayoutShell>
            <Toaster />
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
