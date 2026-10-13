import type { ReactNode } from "react";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { Navbar } from "@/components/layout/Navbar";
import { ShowModalProvider } from "@/components/shows/ShowModalProvider";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <ShowModalProvider>
        <div className="min-h-screen bg-bg">
          <Navbar />
          <main>{children}</main>
        </div>
      </ShowModalProvider>
    </RequireAuth>
  );
}
