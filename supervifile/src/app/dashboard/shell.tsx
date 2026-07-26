"use client";

import { Sidebar } from "@/components/Sidebar";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { HiOutlineBars3 } from "react-icons/hi2";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const isTrash = searchParams.get("papelera") === "1";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
