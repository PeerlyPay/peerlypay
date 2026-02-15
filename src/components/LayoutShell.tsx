"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

/** Routes that render fullscreen without Header/BottomNav */
function isFullscreenRoute(pathname: string): boolean {
  if (!pathname.startsWith("/trade/")) {
    return false;
  }

  return pathname !== "/trade/confirm" && pathname !== "/trade/payment" && pathname !== "/trade/waiting" && pathname !== "/trade/success";
}

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFullscreen = isFullscreenRoute(pathname);

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-120 flex-col bg-white px-4 pb-24 pt-20 shadow-md shadow-black/25">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      <BottomNav />
    </div>
  );
}
