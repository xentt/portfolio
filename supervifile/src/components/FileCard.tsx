"use client";

import { useCallback, useEffect, useRef } from "react";
import { DriveFile } from "@/lib/drive";
import { formatFileSize, formatDate, getFileIcon } from "@/lib/utils";
import { toast } from "sonner";
import {
  HiOutlineDotsVertical,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineDownload,
  HiOutlineFolder,
  HiOutlinePhotograph,
  HiOutlineDocumentText,
  HiOutlineDocument,
  HiOutlineCollection,
  HiOutlineDocumentReport,
  HiOutlineMusicNote,
  HiOutlineVideoCamera,
  HiOutlineCheck,
} from "react-icons/hi";
import { useRouter } from "next/navigation";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  folder: HiOutlineFolder,
  image: HiOutlinePhotograph,
  pdf: HiOutlineDocumentText,
  word: HiOutlineDocument,
  excel: HiOutlineCollection,
  ppt: HiOutlineDocumentReport,
  audio: HiOutlineMusicNote,
  video: HiOutlineVideoCamera,
};

function getIconComponent(mimeType: string) {
  const icon = getFileIcon(mimeType);
  return iconMap[icon] || HiOutlineDocumentText;
}

export function FileCard({
  file,
  currentFolder,
  selected,
  onToggleSelect,
  onAction,
  onPreview,
}: {
  file: DriveFile;
  currentFolder?: string;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onAction?: () => void;
  onPreview?: (file: DriveFile) => void;
}) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isFolder = file.mimeType === "application/vnd.google-apps.folder";
  const Icon = getIconComponent(file.mimeType);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        dropdownRef.current.classList.add("hidden");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const closeMenu = useCallback(() => {
    dropdownRef.current?.classList.add("hidden");
  }, []);

  const handleDelete = async () => {
    closeMenu();
    if (!confirm(`Mover "${file.name}" a la papelera?`)) return;
    try {
      const res = await fetch(`/api/files/${file.id}/trash`, { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success(`"${file.name}" movido a la papelera`);
      onAction?.();
      router.refresh();
    } catch {
      toast.error("Error al mover a la papelera");
    }
  };

  const handleRename = async () => {
    closeMenu();
    const newName = prompt("Nuevo nombre:", file.name);
    if (!newName || newName === file.name) return;
    try {
      const res = await fetch(`/api/files/${file.id}/rename`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) throw new Error();
      toast.success(`"${file.name}" renombrado a "${newName}"`);
      onAction?.();
      router.refresh();
    } catch {
      toast.error("Error al renombrar");
    }
  };

  const handleClick = () => {
    if (isFolder) {
      router.push(`/dashboard?carpeta=${file.id}`);
    } else {
      onPreview?.(file);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (dropdownRef.current) {
      dropdownRef.current.classList.remove("hidden");
    }
  };

  return (
    <div
      className={`card-dark-hover group relative animate-fade-in ${selected ? "ring-2 ring-brand-500 bg-brand-500/5" : ""}`}
      onContextMenu={handleContextMenu}
    >
      <div className="absolute top-3 left-3 z-20">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect?.(file.id); }}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            selected
              ? "bg-brand-500 border-brand-500"
              : "border-muted/30 opacity-0 group-hover:opacity-100 hover:border-muted"
          }`}
        >
          {selected && <HiOutlineCheck className="text-white text-xs" />}
        </button>
      </div>

      <div className="absolute top-3 right-3 z-10" ref={menuRef}>
        <div className="dropdown">
          <button
            className="w-8 h-8 rounded-lg bg-elevated/80 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-surface transition-all border border-line"
            onClick={(e) => {
              e.stopPropagation();
              if (dropdownRef.current) {
                dropdownRef.current.classList.toggle("hidden");
              }
            }}
          >
            <HiOutlineDotsVertical className="text-muted" />
          </button>
          <div ref={dropdownRef} className="hidden absolute right-0 top-10 w-48 bg-elevated border border-line rounded-xl shadow-modal py-1 z-20">
            {!isFolder && (
              <a
                href={`/api/files/${file.id}/download?name=${encodeURIComponent(file.name)}`}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-ink hover:bg-surface transition-colors"
              >
                <HiOutlineDownload className="text-base" />
                Descargar
              </a>
            )}
            <button
              onClick={handleRename}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-ink hover:bg-surface transition-colors w-full text-left"
            >
              <HiOutlinePencil className="text-base" />
              Renombrar
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors w-full text-left"
            >
              <HiOutlineTrash className="text-base" />
              Mover a papelera
            </button>
          </div>
        </div>
      </div>

      <button onClick={handleClick} className="block p-5 w-full text-left">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
            <Icon className="text-3xl text-brand-400" />
          </div>
          <h3 className="text-sm font-medium text-ink line-clamp-2 mb-1">
            {file.name}
          </h3>
          {!isFolder && (
            <p className="text-xs text-muted">
              {formatFileSize(Number(file.size))}
              {file.modifiedTime && ` - ${formatDate(file.modifiedTime)}`}
            </p>
          )}
        </div>
      </button>
    </div>
  );
}