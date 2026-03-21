import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import MenuItemForm from "@/components/menuitems/MenuItemForm";
import type { MenuItemFormData, MenuItem } from "@/types/MenuItem";
import {
  getMenuItemById,
  listMenuItems,
  updateMenuItem,
} from "@/services/menuItem";

export default function EditMenuItem() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();

  // ✅ Parseo robusto del id
  const dishId = useMemo(() => Number(id), [id]);
  const isValidId = Number.isInteger(dishId) && dishId > 0;

  const [saving, setSaving] = useState(false);

  // ✅ Lista para validaciones (nombres duplicados)
  const { data: existingItems = [] } = useQuery<MenuItem[]>({
    queryKey: ["menuitems"],
    queryFn: listMenuItems,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutos cache
  });

  // ✅ Obtener platillo por id
  const {
    data: item,
    isLoading,
    isFetching,
    error,
  } = useQuery<MenuItem>({
    queryKey: ["menuitem", dishId],
    queryFn: () => getMenuItemById(dishId),
    enabled: isValidId,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  // ✅ Valores iniciales memoizados
  const initialValues: MenuItemFormData | undefined = useMemo(() => {
    if (!item) return undefined;

    return {
      name: item.name ?? "",
      description: item.description ?? "",
      price: item.price != null ? String(item.price) : "",
      isactive: item.isactive ?? true,
      photoFile: null,
    };
  }, [item]);

  // ✅ Excluir el actual para validaciones
  const filteredExisting = useMemo(
    () => existingItems.filter((x) => x.id !== dishId),
    [existingItems, dishId]
  );

  // ✅ Submit robusto
  const handleSubmit = async (data: MenuItemFormData) => {
    if (saving) return; // evita doble submit

    try {
      setSaving(true);

      const res: any = await updateMenuItem(dishId, data);

      toast.success(res?.value ?? "Platillo editado correctamente");

      // ✅ invalidaciones precisas
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["menuitems"] }),
        queryClient.invalidateQueries({ queryKey: ["menuitem", dishId] }),
      ]);

      navigate("/menuitems");
    } catch (e: any) {
      console.error("Update error:", e);
      toast.error(e?.message ?? "Error editando platillo");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // 🚨 GUARDS
  // =========================

  // ID inválido
  if (!isValidId) {
    return (
      <div className="p-6 text-white">
        <p className="text-red-500 font-semibold">
          ID de platillo inválido
        </p>
      </div>
    );
  }

  // Loading inicial
  if (isLoading) {
    return (
      <div className="p-6 text-white">
        Cargando platillo...
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="p-6 text-white">
        <p className="text-red-500 font-semibold">
          Error cargando platillo
        </p>
        <p className="text-sm mt-2">
          {String((error as any)?.message ?? error)}
        </p>

        <button
          onClick={() => navigate("/menuitems")}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-black font-semibold"
        >
          Volver
        </button>
      </div>
    );
  }

  // No encontrado
  if (!item || !initialValues) {
    return (
      <div className="p-6 text-white">
        <p className="text-red-500 font-semibold">
          Platillo no encontrado
        </p>

        <button
          onClick={() => navigate("/menuitems")}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-black font-semibold"
        >
          Volver
        </button>
      </div>
    );
  }

  // =========================
  // ✅ RENDER
  // =========================

  return (
    <MenuItemForm
      title="Editar platillo"
      existingItems={filteredExisting}
      initialValues={initialValues}
      existingPhoto={item.photo ?? null}
      onSubmit={handleSubmit}
      onCancel={() => navigate(-1)}
      isSubmitting={saving || isFetching}
    />
  );
}