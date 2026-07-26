"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { getInitials } from "@/lib/utils";
import { useState } from "react";
import { ActivityLogModal } from "./ActivityLogModal";
import {
  HiOutlineHome,
  HiOutlineTrash,
  HiOutlineLogout,
  HiOutlineFolder,
  HiOutlineClock,
  HiOutlineX,
} from "react-icons/hi";
import {
  HiOutlineBars3,
} from "react-icons/hi2";

export function Sidebar({ trashCount = 0 }: { trashCount?: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  const isTrash = searchParams.get("papelera") === "1";
  const isRoot = !searchParams.get("papelera") && !searchParams.get("carpeta");

  const navItems = [
    {
      href: "/dashboard",
      label: "Mi Unidad",
      icon: HiOutlineHome,
      active: !isTrash && (isRoot || pathname === "/dashboard"),
    },
    {
      href: "/dashboard?papelera=1",
      label: "Papelera",
      icon: HiOutlineTrash,
      active: isTrash,
      badge: trashCount > 0 ? trashCount : undefined,
    },
  ];

  const NavContent = ({ closeMenu }: { closeMenu?: () => void }) => (
    <>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeMenu}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
              item.active
                ? "bg-brand-500/10 text-brand-400"
                : "text-muted hover:text-ink hover:bg-surface"
            }`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="text-lg flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
            {item.badge && !collapsed && (
              <span className="ml-auto bg-danger/20 text-danger text-xs font-medium px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
            {item.badge && collapsed && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-[10px] font-bold rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
        <button
          onClick={() => { setShowActivity(true); closeMenu?.(); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-ink hover:bg-surface transition-all duration-200 w-full"
          title={collapsed ? "Historial" : undefined}
        >
          <HiOutlineClock className="text-lg flex-shrink-0" />
          {!collapsed && <span>Historial</span>}
        </button>
      </nav>

      <div className="px-3 py-3 border-t border-line">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200 w-full"
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <HiOutlineLogout className="text-lg flex-shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl bg-elevated border border-line flex items-center justify-center text-muted hover:text-ink shadow-modal"
      >
        <HiOutlineBars3 className="text-xl" />
      </button>

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-canvas border-r border-line h-screen transition-all duration-300 flex-shrink-0 ${
          collapsed ? "w-[68px]" : "w-64"
        }`}
      >
        <div
          className="flex items-center gap-3 px-5 h-16 border-b border-line cursor-pointer hover:bg-surface/50 transition-colors flex-shrink-0"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <HiOutlineFolder className="text-brand-500 text-lg" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight">SuperviFile</span>
          )}
        </div>

        <div className="px-3 py-4 border-b border-line flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-semibold text-brand-400 flex-shrink-0">
              {getInitials(session?.user?.name)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink truncate">
                  {session?.user?.name ?? "Usuario"}
                </p>
                <p className="text-xs text-muted truncate">
                  {session?.user?.email ?? ""}
                </p>
              </div>
            )}
          </div>
        </div>

        <NavContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] h-full bg-canvas border-r border-line flex flex-col animate-slide-right">
            <div className="flex items-center justify-between px-4 h-16 border-b border-line flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                  <HiOutlineFolder className="text-brand-500 text-lg" />
                </div>
                <span className="text-lg font-semibold tracking-tight">SuperviFile</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-surface"
              >
                <HiOutlineX className="text-xl" />
              </button>
            </div>
            <div className="px-3 py-4 border-b border-line flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-semibold text-brand-400 flex-shrink-0">
                  {getInitials(session?.user?.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">
                    {session?.user?.name ?? "Usuario"}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {session?.user?.email ?? ""}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col">
              <NavContent closeMenu={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      <ActivityLogModal
        isOpen={showActivity}
        onClose={() => setShowActivity(false)}
      />
    </>
  );
}