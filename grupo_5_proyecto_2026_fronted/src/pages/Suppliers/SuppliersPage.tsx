import { useMemo, useState } from "react";
import { Search, Pencil, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { Navigate, useNavigate } from "react-router-dom";
import type { Supplier, SupplierFormData } from "@/types/Supplier";
import {
  deleteSupplier,
  editSupplier,
  listSuppliers,
  supplierPhotoUrl,
} from "@/services/supplier";
import { toast } from "sonner";

const SuppliersPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null); 

  const handleSidebarToggle = (hidden: boolean) => {
    setSidebarHidden(hidden);
  };

  const token = sessionStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: ["suppliers"],
    queryFn: listSuppliers,
    retry: false,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((s) => (s.name ?? "").toLowerCase().startsWith(q));
  }, [search, data]);

  // ================= DELETE =================
  const del = useMutation({
    mutationFn: (id: number) => deleteSupplier(id),
    onSuccess: async (res: any) => {
      toast.success(res?.value ?? "Proveedor eliminado correctamente");
      await qc.invalidateQueries({ queryKey: ["suppliers"] });
      setDeleting(null);
    },
    onError: (e: any) =>
      toast.error(e?.message ?? "Error eliminando proveedor"),
  });

  // ================= EDIT =================
  const edit = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: SupplierFormData;
    }) => editSupplier(id, payload),
    onSuccess: async (res: any) => {
      toast.success(res?.value ?? "Proveedor actualizado correctamente");
      setEditing(null);
      await qc.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (e: any) =>
      toast.error(e?.message ?? "Error editando proveedor"),
  });

  return (
    <div className="min-h-screen flex">
      <Sidebar onToggle={handleSidebarToggle} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarHidden ? "md:ml-0" : "md:ml-64"
      }`}>
        <main className="flex-1 px-6 pt-24 pb-10">
          <div className="mx-auto max-w-6xl rounded-2xl border border-border bg-black/40 backdrop-blur-md p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-playfair font-semibold">
                Proveedores
              </h1>
              <p className="text-muted-foreground mt-2">
                Consulta, edita o elimina proveedores registrados.
              </p>
            </div>

            <button
              onClick={() => navigate("/suppliers/create")}
              className="rounded-lg bg-primary px-5 py-2 text-primary-foreground font-semibold hover:opacity-90 transition"
            >
              Registrar proveedor
            </button>
          </div>

          {/* Buscar */}
          <div className="mt-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/30 border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Estados */}
          {isLoading && (
            <div className="mt-6 text-muted-foreground">
              Cargando proveedores...
            </div>
          )}

          {isError && (
            <div className="mt-6 rounded-xl border border-border bg-black/30 p-4">
              <p className="text-destructive font-semibold">
                Error cargando proveedores
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {(error as any)?.message ?? "Revisa token y back"}
              </p>
            </div>
          )}

          {/* Tabla */}
          {!isLoading && !isError && (
            <div className="mt-6 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left">
                <thead className="bg-black/30">
                  <tr className="text-muted-foreground">
                    <th className="px-4 py-3">Foto</th>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Identificación</th>
                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">Correo</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((s) => (
                    // ✅ KEY ESTABLE (FIX PRINCIPAL)
                    <tr
                      key={`supplier-${s.id}`}
                      className="border-t border-border"
                    >
                      <td className="px-4 py-3">
                        {s.photo ? (
                          <img
                            src={supplierPhotoUrl(s.photo)}
                            alt={s.name ?? "Proveedor"}
                            className="h-10 w-10 rounded-lg object-cover border border-border"
                          />
                        ) : (
                          <span className="text-muted-foreground">
                            Sin foto
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">{s.name ?? "-"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {s.identification ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {s.phone ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {s.email ?? "-"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-4">
                          {/* ✅ CLONAR OBJETO (FIX IMPORTANTE) */}
                          <button
                            onClick={() => setEditing({ ...s })}
                            title="Editar"
                            className="hover:opacity-90"
                          >
                            <Pencil className="text-blue-400" />
                          </button>

                          <button
                              onClick={() => {
                                if (!s.id) return toast.error("No se puede eliminar: falta el ID.");
                                setDeleting(s); 
                              }}
                              title="Eliminar"
                              disabled={del.isPending}
                              className="hover:opacity-90 disabled:opacity-50"
                            >
                              <Trash2 className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-muted-foreground"
                      >
                        No hay resultados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ================= MODAL EDITAR ================= */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <button
              onClick={() => setEditing(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
              aria-label="Cerrar"
            >
              <X />
            </button>

            <div className="mt-6">
              <SupplierForm
                key={editing.id} // ✅ FORZAR REMOUNT
                initialData={editing}
                onSubmit={(payload: SupplierFormData) => {
                  if (!editing.id) {
                    toast.error("No se puede editar: falta el ID.");
                    return;
                  }

                  edit.mutate({ id: editing.id, payload });
                }}
                onCancel={() => setEditing(null)}
                isSubmitting={edit.isPending}
              />
            </div>
          </div>
        )}

        {/* ================= MODAL ELIMINAR ================= */}
        {deleting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-zinc-950/90 p-6 shadow-2xl">
              
              {/* Botón X para cerrar */}
              <button
                onClick={() => setDeleting(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-playfair font-semibold text-white">
                Confirmar eliminación
              </h2>

              <p className="text-muted-foreground mt-3">
                ¿Deseas eliminar al proveedor{" "}
                <span className="font-semibold text-foreground">
                  {deleting.name}
                </span>? 
                Esta acción no se puede deshacer.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setDeleting(null)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-white/5 transition text-sm font-medium"
                  disabled={del.isPending}
                >
                  Cancelar
                </button>

                <button
                  onClick={() => {
                    if (deleting.id) del.mutate(deleting.id);
                  }}
                  disabled={del.isPending}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50 transition text-sm"
                >
                  {del.isPending ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      </div>
    </div>
  );
};

export default SuppliersPage;