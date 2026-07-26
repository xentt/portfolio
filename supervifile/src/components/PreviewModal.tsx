"use client";

import { useEffect } from "react";
import { HiOutlineX, HiOutlineDownload } from "react-icons/hi";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: string;
    name: string;
    mimeType: string;
    webViewLink: string | null;
  } | null;
}

export function PreviewModal({ isOpen, onClose, file }: PreviewModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !file) return null;

  const isImage = file.mimeType.startsWith("image/");
  const isPdf = file.mimeType === "application/pdf";
  const isVideo = file.mimeType.startsWith("video/");
  const isAudio = file.mimeType.startsWith("audio/");
  const isViewable = isImage || isPdf || isVideo || isAudio;

  const publicUrl = file.webViewLink;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-elevated border border-line rounded-2xl shadow-modal w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-ink truncate pr-4">
            {file.name}
          </h2>
          <div className="flex items-center gap-2">
            <a
              href={`/api/files/${file.id}/download?name=${encodeURIComponent(file.name)}`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-surface transition-colors"
              title="Descargar"
            >
              <HiOutlineDownload className="text-xl" />
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-surface transition-colors"
            >
              <HiOutlineX className="text-xl" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 flex-1 overflow-auto min-h-0">
          {isImage && publicUrl && (
            <div className="flex items-center justify-center">
              <img
                src={publicUrl}
                alt={file.name}
                className="max-w-full max-h-[70vh] rounded-xl object-contain"
              />
            </div>
          )}

          {isPdf && publicUrl && (
            <iframe
              src={`${publicUrl}#toolbar=0`}
              className="w-full h-[70vh] rounded-xl border border-line"
              title={file.name}
            />
          )}

          {isVideo && publicUrl && (
            <div className="flex items-center justify-center">
              <video
                controls
                className="max-w-full max-h-[70vh] rounded-xl"
              >
                <source src={publicUrl} type={file.mimeType} />
              </video>
            </div>
          )}

          {isAudio && publicUrl && (
            <div className="flex items-center justify-center py-20">
              <audio controls className="w-full max-w-md">
                <source src={publicUrl} type={file.mimeType} />
              </audio>
            </div>
          )}

          {!isViewable && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-muted mb-4">
                Vista previa no disponible para este tipo de archivo
              </p>
              <a
                href={`/api/files/${file.id}/download?name=${encodeURIComponent(file.name)}`}
                className="btn-primary !w-auto !px-6"
              >
                <HiOutlineDownload className="text-lg" />
                Descargar
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}