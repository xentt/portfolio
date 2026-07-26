import { HiOutlineFolderOpen, HiOutlineSearch } from "react-icons/hi";

export function EmptyState({
  isSearch,
  searchQuery,
}: {
  isSearch?: boolean;
  searchQuery?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {isSearch ? (
        <>
          <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
            <HiOutlineSearch className="text-3xl text-muted" />
          </div>
          <h3 className="text-lg font-medium text-ink mb-1">
            Sin resultados
          </h3>
          <p className="text-sm text-muted max-w-sm">
            No se encontraron archivos o carpetas para &ldquo;{searchQuery}&rdquo;
          </p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
            <HiOutlineFolderOpen className="text-3xl text-muted" />
          </div>
          <h3 className="text-lg font-medium text-ink mb-1">
            Esta carpeta está vacía
          </h3>
          <p className="text-sm text-muted max-w-sm">
            Sube archivos o crea carpetas para empezar
          </p>
        </>
      )}
    </div>
  );
}
