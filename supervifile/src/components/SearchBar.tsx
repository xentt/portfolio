"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineSearch } from "react-icons/hi";

interface SearchResult {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string | null;
}

export function SearchBar({ folderId }: { folderId?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ query: value.trim() });
        if (folderId) params.set("carpeta", folderId);
        const res = await fetch(`/api/files/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch {
        setResults([]);
      }
    }, 300);
  };

  const handleSelect = (item: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    if (item.mimeType === "application/vnd.google-apps.folder") {
      router.push(`/dashboard?carpeta=${item.id}`);
    } else {
      window.open(item.webViewLink || "#", "_blank");
    }
  };

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="relative">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar archivos..."
          className="w-full bg-surface border border-line rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink placeholder-muted/50 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-elevated border border-line rounded-xl shadow-modal overflow-hidden z-50 animate-fade-in">
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="w-full px-4 py-3 text-left text-sm text-ink hover:bg-surface transition-colors border-b border-line last:border-0 flex items-center gap-3"
            >
              <span className="text-muted">
                {item.mimeType === "application/vnd.google-apps.folder"
                  ? "📁"
                  : "📄"}
              </span>
              <span className="truncate">{item.name}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-elevated border border-line rounded-xl shadow-modal overflow-hidden z-50 animate-fade-in">
          <p className="px-4 py-3 text-sm text-muted">
            No se encontraron resultados
          </p>
        </div>
      )}
    </div>
  );
}
