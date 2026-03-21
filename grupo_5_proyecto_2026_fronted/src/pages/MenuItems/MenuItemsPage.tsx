import { useMutation,useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

import type { MenuItem } from "@/types/MenuItem";
import {
  listMenuItems,
  menuItemPhotoUrl,
  deleteMenuItem,
} from "@/services/menuItem";

export default function MenuItemsPage() {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

   const [deleting, setDeleting] = useState<MenuItem | null>(null); 

  const handleSidebarToggle = (hidden: boolean) => {
    setSidebarHidden(hidden);
  };

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery<MenuItem[]>({
    queryKey: ["menuitems"],
    queryFn: listMenuItems,
    retry: false,
  });

  const handleEdit = (id?: number) => {
    if (!id) return;
    navigate(`/menuitems/edit/${id}`);
  };

  const del = useMutation({
    mutationFn: (id: number) => deleteMenuItem(id),
    onSuccess: async (res: any) => {
      toast.success(res?.value ?? "Platillo eliminado correctamente");
      await queryClient.invalidateQueries({ queryKey: ["menuitems"] });
      setDeleting(null);
    },
    onError: (e: any) =>
      toast.error(e?.message ?? "Error eliminando platillo"),
  });

  return (
    <div className="min-h-screen flex">
      <Sidebar onToggle={handleSidebarToggle} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarHidden ? "md:ml-0" : "md:ml-64"
      }`}>
        <main className="flex-1 px-6 pt-24 pb-10">
          <div className="mx-auto max-w-6xl rounded-2xl border border-border bg-black/40 backdrop-blur-md p-8 text-white">

          {/* Header sección */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-semibold font-playfair">
                Gestión de Platillos
              </h1>
              <p className="text-muted-foreground mt-2">
                Lista de platillos registrados.
              </p>
            </div>

            <button
              onClick={() => navigate("/menuitems/create")}
              className="rounded-lg bg-primary px-5 py-2 text-black font-semibold hover:opacity-90 transition"
            >
              + Nuevo platillo
            </button>
          </div>

          {/* Estados */}
          {isLoading && (
            <div className="py-6 text-center">
              Cargando platillos...
            </div>
          )}

          {error && (
            <div className="py-6 text-center text-red-500 font-semibold">
              Error cargando platillos
            </div>
          )}

          {!isLoading && !error && items.length === 0 && (
            <div className="text-gray-400">
              No hay platillos activos.
            </div>
          )}

          {/* Grid */}
          {!isLoading && !error && items.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item) => {
                const img = menuItemPhotoUrl(item.photo);

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-lg hover:shadow-xl transition"
                  >
                    {/* Imagen */}
                    <div className="h-52 w-full bg-zinc-800">
                      {img ? (
                        <img
                          src={img}
                          alt={item.name ?? "Platillo"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
                          Sin foto
                        </div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-white">
                        {item.name ?? "Sin nombre"}
                      </h2>

                      <p className="text-sm text-gray-400 mt-2 line-clamp-3">
                        {item.description ?? ""}
                      </p>

                      <div className="mt-4 font-semibold text-lg text-primary">
                        ₡ {Number(item.price ?? 0).toLocaleString("es-CR")}
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="px-6 pb-6 flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-primary hover:text-black transition"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>

                          <button
                              onClick={() => {
                                if (!item.id) return toast.error("No se puede eliminar: falta el ID.");
                                setDeleting(item); 
                              }}
                              title="Eliminar"
                              disabled={del.isPending}
                              className="hover:opacity-90 disabled:opacity-50"
                            >
                              <Trash2 className="text-red-400" />
                          </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
                ¿Deseas eliminar este platillo?{" "}
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
}