"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { HiOutlineUpload, HiOutlineX, HiOutlineDocumentText } from "react-icons/hi";
import { toast } from "sonner";

export function ModalUpload({
  isOpen,
  onClose,
  onSuccess,
  currentFolder,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentFolder?: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setLoading(true);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    if (currentFolder) formData.append("parentId", currentFolder);

    try {
      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();
      toast.success(`${files.length} archivo(s) subido(s)`);
      setFiles([]);
      onClose();
      onSuccess?.();
    } catch {
      toast.error("Error al subir archivos");
    } finally {
      setLoading(false);
    }
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const maxSize = 100 * 1024 * 1024;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-elevated border border-line rounded-2xl shadow-modal w-full max-w-lg mx-4 animate-slide-up">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <HiOutlineUpload className="text-xl text-brand-400" />
            </div>
            <h2 className="text-lg font-semibold text-ink">
              Subir Archivos
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-surface transition-colors"
          >
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        <div className="px-6 pb-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4 ${
              dragOver
                ? "border-brand-500 bg-brand-500/5"
                : "border-line hover:border-brand-500/50 hover:bg-surface"
            }`}
          >
            <HiOutlineUpload className="text-4xl text-muted mx-auto mb-3" />
            <p className="text-sm text-ink font-medium mb-1">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted">
              Máximo 100MB por archivo
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-surface rounded-lg px-4 py-2.5"
                >
                  <HiOutlineDocumentText className="text-muted flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{file.name}</p>
                    <p className="text-xs text-muted">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-muted hover:text-danger transition-colors"
                  >
                    <HiOutlineX />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={loading || files.length === 0 || totalSize > maxSize}
              className="btn-primary !w-auto !px-6"
            >
              {loading
                ? "Subiendo..."
                : `Subir ${files.length > 0 ? `(${files.length})` : ""}`}
            </button>
          </div>

          {totalSize > maxSize && (
            <p className="text-xs text-danger mt-2 text-right">
              Los archivos exceden el límite total de 100MB
            </p>
          )}
        </div>
      </div>
    </div>
  );
}