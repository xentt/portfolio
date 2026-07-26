"use client";

import { useState, FormEvent } from "react";
import { HiOutlineFolderAdd, HiOutlineX } from "react-icons/hi";
import { toast } from "sonner";

export function ModalCreateFolder({
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
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), parentId: currentFolder }),
      });

      if (!res.ok) throw new Error();
      toast.success("Carpeta creada");
      setName("");
      onClose();
      onSuccess?.();
    } catch {
      toast.error("Error al crear la carpeta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-elevated border border-line rounded-2xl shadow-modal w-full max-w-md mx-4 animate-slide-up">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <HiOutlineFolderAdd className="text-xl text-brand-400" />
            </div>
            <h2 className="text-lg font-semibold text-ink">
              Nueva Carpeta
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-surface transition-colors"
          >
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la carpeta"
            autoFocus
            className="input-dark mb-4"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-primary !w-auto !px-6"
            >
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}