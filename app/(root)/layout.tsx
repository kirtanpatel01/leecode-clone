import { currentUserRole } from "@/modules/auth/actions";
import Navbar from "@/modules/home/components/navbar";
import React from "react";

async function RooLayout({ children }: { children: React.ReactNode }) {
  const userRole = await currentUserRole();
  return (
    <main className="flex flex-col min-h-screen max-h-screen">
      <Navbar userRole={userRole} />
      <div className="flex-1 flex flex-col px-4 pb-4">
        {children}
      </div>
    </main>
  );
}

export default RooLayout;
