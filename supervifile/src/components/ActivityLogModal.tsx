"use client";

import { useState, useEffect } from "react";
import { HiOutlineX, HiOutlineClock } from "react-icons/hi";
import { getActionLabel } from "@/lib/utils";

interface ActivityEntry {
  id: number;
  userId: number;
  userEmail: string;
  userName: string | null;
  action: string;
  target: string;
  details: string | null;
  createdAt: string;
}

export function ActivityLogModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch("/api/activity")
      .then((r) => r.json())
      .then((data) => setLogs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-elevated border border-line rounded-2xl shadow-modal w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <HiOutlineClock className="text-xl text-brand-400" />
            </div>
            <h2 className="text-lg font-semibold text-ink">
              Historial de actividad
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-surface transition-colors"
          >
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        <div className="px-6 pb-6 flex-1 overflow-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <HiOutlineClock className="text-4xl text-muted mb-3" />
              <p className="text-sm text-muted">No hay actividad registrada</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-line" />
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 flex justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-500 mt-2 ring-4 ring-elevated" />
                    </div>
                    <div className="flex-1 min-w-0 bg-surface rounded-xl px-4 py-3 border border-line">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <p className="text-sm font-medium text-ink">
                          {log.userName || log.userEmail}
                        </p>
                        <span className="text-xs text-muted flex-shrink-0">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted">
                        <span className="text-brand-400 font-medium">
                          {getActionLabel(log.action)}
                        </span>{" "}
                        <span className="text-ink">{log.target}</span>
                      </p>
                      {log.details && (
                        <p className="text-xs text-muted mt-0.5">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}