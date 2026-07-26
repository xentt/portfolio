"use client";

import { HiOutlineChevronRight, HiOutlineHome } from "react-icons/hi";

export function Breadcrumbs({
  path,
  onNavigate,
}: {
  path: string[];
  onNavigate: (folderId: string) => void;
}) {
  if (path.length === 0) return null;

  const segments = [{ name: "Mi Unidad", id: "root" }];
  let current = "";
  for (const seg of path) {
    current = current ? `${current}/${seg}` : seg;
    segments.push({ name: seg, id: current });
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-muted min-w-0">
      <button
        onClick={() => onNavigate("root")}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:text-ink hover:bg-surface transition-colors flex-shrink-0"
      >
        <HiOutlineHome className="text-base" />
      </button>
      {segments.map((seg, i) => (
        <div key={seg.id} className="flex items-center gap-1 min-w-0">
          <HiOutlineChevronRight className="text-xs flex-shrink-0" />
          <button
            onClick={() => onNavigate(seg.id)}
            className={`px-2 py-1 rounded-lg truncate transition-colors ${
              i === segments.length - 1
                ? "text-ink font-medium"
                : "hover:text-ink hover:bg-surface"
            }`}
          >
            {seg.name}
          </button>
        </div>
      ))}
    </nav>
  );
}