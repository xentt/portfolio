"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DriveFile } from "@/lib/drive";
import { SearchBar } from "@/components/SearchBar";
import { FileCard } from "@/components/FileCard";
import { EmptyState } from "@/components/EmptyState";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PreviewModal } from "@/components/PreviewModal";
import { FileListSkeleton } from "@/components/LoadingSkeleton";
import { ModalCreateFolder } from "@/components/ModalCreateFolder";
import { ModalUpload } from "@/components/ModalUpload";
import { toast } from "sonner";
import {
  HiOutlineFolderPlus,
  HiOutlineCloudArrowUp,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
} from "react-icons/hi2";

type SortField = "name" | "modifiedTime" | "size";
type SortDir = "asc" | "desc";

export function DashboardClient({
  searchParams,
}: {
  searchParams: {
    carpeta?: string;
    papelera?: string;
    query?: string;
  };
}) {
  const router = useRouter();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [parentId, setParentId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [batchLoading, setBatchLoading] = useState(false);

  const isTrash = searchParams.papelera === "1";
  const currentFolder = !isTrash && searchParams.carpeta
    ? searchParams.carpeta
    : "root";
  const searchQuery = searchParams.query?.trim() || "";

  const navigateTo = useCallback((folderId: string) => {
    router.push(`/dashboard?carpeta=${folderId}`);
  }, [router]);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (isTrash) {
        params.set("papelera", "1");
      } else {
        params.set("carpeta", currentFolder);
      }

      const res = await fetch(`/api/files?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFiles(data);
      setSelected(new Set());

      if (!isTrash) {
        if (currentFolder === "root") {
          setParentId(null);
          setFolderPath([]);
        } else {
          const parts = currentFolder.split("/");
          setFolderPath(parts);
          setParentId(parts.length > 1 ? parts.slice(0, -1).join("/") : "root");
        }
      } else {
        setFolderPath([]);
        setParentId(null);
      }
    } catch {
      toast.error("Error al cargar archivos");
    } finally {
      setLoading(false);
    }
  }, [currentFolder, isTrash]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir(field === "name" ? "asc" : "desc");
    }
  };

  const filteredFiles = useMemo(() => {
    let list = searchQuery
      ? files.filter((f) =>
          f.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [...files];

    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "name") {
        return a.name.localeCompare(b.name) * dir;
      }
      if (sortField === "size") {
        const sa = Number(a.size) || 0;
        const sb = Number(b.size) || 0;
        return (sa - sb) * dir;
      }
      const da = a.modifiedTime ? new Date(a.modifiedTime).getTime() : 0;
      const db = b.modifiedTime ? new Date(b.modifiedTime).getTime() : 0;
      return (da - db) * dir;
    });

    return list;
  }, [files, searchQuery, sortField, sortDir]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filteredFiles.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredFiles.map((f) => f.id)));
    }
  };

  const batchTrash = async () => {
    if (selected.size === 0) return;
    if (!confirm(`¿Mover ${selected.size} archivo(s) a la papelera?`)) return;
    setBatchLoading(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`/api/files/${id}/trash`, { method: "POST" })
        )
      );
      toast.success(`${selected.size} archivo(s) movidos a la papelera`);
      setSelected(new Set());
      fetchFiles();
    } catch {
      toast.error("Error al mover archivos");
    } finally {
      setBatchLoading(false);
    }
  };

  const batchRestore = async () => {
    if (selected.size === 0) return;
    setBatchLoading(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`/api/files/${id}/restore`, { method: "POST" })
        )
      );
      toast.success(`${selected.size} archivo(s) restaurados`);
      setSelected(new Set());
      fetchFiles();
    } catch {
      toast.error("Error al restaurar");
    } finally {
      setBatchLoading(false);
    }
  };

  const batchDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`¿Eliminar permanentemente ${selected.size} archivo(s)?`)) return;
    setBatchLoading(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`/api/files/${id}/delete`, { method: "POST" })
        )
      );
      toast.success(`${selected.size} archivo(s) eliminados`);
      setSelected(new Set());
      fetchFiles();
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleRestore = async (fileId: string) => {
    try {
      const res = await fetch(`/api/files/${fileId}/restore`, { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("Archivo restaurado");
      fetchFiles();
    } catch {
      toast.error("Error al restaurar");
    }
  };

  const handlePermanentDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`¿Eliminar permanentemente "${fileName}"?`)) return;
    try {
      const res = await fetch(`/api/files/${fileId}/delete`, { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("Eliminado permanentemente");
      fetchFiles();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleFolderCreated = () => {
    setShowCreateFolder(false);
    fetchFiles();
  };

  const handleFilesUploaded = () => {
    setShowUpload(false);
    fetchFiles();
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
        sortField === field
          ? "text-brand-400 bg-brand-500/10"
          : "text-muted hover:text-ink hover:bg-surface"
      }`}
    >
      {label}
      {sortField === field && (
        sortDir === "asc" ? <HiOutlineArrowUp className="text-xs" /> : <HiOutlineArrowDown className="text-xs" />
      )}
    </button>
  );

  return (
    <>
      <header className="flex items-center gap-4 px-6 h-16 border-b border-line flex-shrink-0 bg-canvas">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isTrash ? (
            <h1 className="text-lg font-semibold truncate">Papelera</h1>
          ) : (
            <Breadcrumbs path={folderPath} onNavigate={navigateTo} />
          )}
        </div>
        <SearchBar folderId={currentFolder} />
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {parentId && !isTrash && (
              <button
                onClick={() => navigateTo(parentId)}
                className="btn-secondary !px-3 !py-2"
                title="Volver"
              >
                <svg className="text-lg w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {isTrash && (
              <button
                onClick={() => router.push("/dashboard")}
                className="btn-secondary !px-3 !py-2"
                title="Volver a Mi Unidad"
              >
                <svg className="text-lg w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-line">
              <SortButton field="name" label="Nombre" />
              <SortButton field="modifiedTime" label="Fecha" />
              <SortButton field="size" label="Tamaño" />
            </div>
          </div>

          {!isTrash && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateFolder(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <HiOutlineFolderPlus className="text-lg" />
                <span className="hidden sm:inline">Nueva Carpeta</span>
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="bg-brand-500 hover:bg-brand-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              >
                <HiOutlineCloudArrowUp className="text-lg" />
                <span className="hidden sm:inline">Subir</span>
              </button>
            </div>
          )}
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-brand-500/10 border border-brand-500/20 rounded-xl">
            <button
              onClick={selectAll}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                selected.size === filteredFiles.length
                  ? "bg-brand-500 border-brand-500"
                  : "border-muted"
              }`}
            >
              {selected.size === filteredFiles.length && <HiOutlineCheck className="text-white text-xs" />}
            </button>
            <span className="text-sm text-ink font-medium flex-1">
              {selected.size} seleccionado(s)
            </span>
            {isTrash ? (
              <>
                <button
                  onClick={batchRestore}
                  disabled={batchLoading}
                  className="btn-secondary !py-1.5 !px-3 text-xs"
                >
                  Restaurar todos
                </button>
                <button
                  onClick={batchDelete}
                  disabled={batchLoading}
                  className="text-danger hover:bg-danger/10 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Eliminar
                </button>
              </>
            ) : (
              <button
                onClick={batchTrash}
                disabled={batchLoading}
                className="text-danger hover:bg-danger/10 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                Mover a papelera
              </button>
            )}
            <button
              onClick={() => setSelected(new Set())}
              className="p-1 text-muted hover:text-ink"
            >
              <HiOutlineXMark className="text-lg" />
            </button>
          </div>
        )}

        {loading ? (
          <FileListSkeleton />
        ) : isTrash && filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
              <HiOutlineTrash className="text-3xl text-muted" />
            </div>
            <h3 className="text-lg font-medium text-ink mb-1">Papelera vacía</h3>
            <p className="text-sm text-muted">Los archivos eliminados aparecerán aquí</p>
          </div>
        ) : !isTrash && filteredFiles.length === 0 ? (
          <EmptyState isSearch={!!searchQuery} searchQuery={searchQuery} />
        ) : isTrash ? (
          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 bg-surface rounded-xl px-5 py-3 border border-line"
              >
                <button
                  onClick={() => toggleSelect(file.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    selected.has(file.id)
                      ? "bg-brand-500 border-brand-500"
                      : "border-muted/30 hover:border-muted"
                  }`}
                >
                  {selected.has(file.id) && <HiOutlineCheck className="text-white text-xs" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{file.name}</p>
                  <p className="text-xs text-muted">
                    {file.size ? `Tamaño: ${(Number(file.size) / 1024).toFixed(1)} KB` : "Carpeta"}
                  </p>
                </div>
                <button
                  onClick={() => handleRestore(file.id)}
                  className="btn-secondary !py-1.5 !px-3 text-xs"
                >
                  Restaurar
                </button>
                <button
                  onClick={() => handlePermanentDelete(file.id, file.name)}
                  className="text-danger hover:bg-danger/10 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredFiles.length > 0 && (
              <div className="flex items-center gap-2 mb-3 px-1">
                <button
                  onClick={selectAll}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selected.size === filteredFiles.length && selected.size > 0
                      ? "bg-brand-500 border-brand-500"
                      : "border-muted/30 hover:border-muted"
                  }`}
                >
                  {selected.size === filteredFiles.length && selected.size > 0 && (
                    <HiOutlineCheck className="text-white text-xs" />
                  )}
                </button>
                <span className="text-xs text-muted">
                  {filteredFiles.length} archivo(s)
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  currentFolder={currentFolder}
                  selected={selected.has(file.id)}
                  onToggleSelect={toggleSelect}
                  onAction={fetchFiles}
                  onPreview={(f) => setPreviewFile(f)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ModalCreateFolder
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onSuccess={handleFolderCreated}
        currentFolder={currentFolder}
      />

      <ModalUpload
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={handleFilesUploaded}
        currentFolder={currentFolder}
      />

      <PreviewModal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />
    </>
  );
}