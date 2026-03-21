import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { MenuItemFormData, MenuItem } from "@/types/MenuItem";
import { menuItemPhotoUrl } from "@/services/menuItem";

type Props = {
  existingItems?: MenuItem[];
  onSubmit: (data: MenuItemFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;

  initialValues?: MenuItemFormData;
  title?: string;
  existingPhoto?: string | null; // ruta del back "/uploads/dishes/..."
};

const onlyLettersAndSpaces = (value: string) =>
  value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");

const onlyPrice = (value: string) =>
  value
    .replace(/[^0-9.]/g, "")
    .replace(/(\..*)\./g, "$1"); // solo 1 punto decimal

export default function MenuItemForm({
  existingItems = [],
  onSubmit,
  onCancel,
  isSubmitting,
  initialValues,
  title,
  existingPhoto,
}: Props) {
  const [form, setForm] = useState<MenuItemFormData>({
    name: "",
    description: "",
    price: "",
    isactive: true,
    photoFile: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const existingPhotoUrl = existingPhoto ? menuItemPhotoUrl(existingPhoto) : "";
  const previewToShow = photoPreview || existingPhotoUrl;

  useEffect(() => {
  if (initialValues) {
    setForm({
      name: initialValues.name ?? "",
      description: initialValues.description ?? "",
      price: initialValues.price ?? "",
      isactive: initialValues.isactive ?? true,
      photoFile: null, // nunca precargamos archivo
    });
  }
}, [initialValues]);

  const normalizedExistingNames = useMemo(
    () =>
      new Set(
        existingItems.map((x) => (x.name ?? "").trim().toLowerCase()).filter(Boolean)
      ),
    [existingItems]
  );

  const validate = () => {
    const e: Record<string, string> = {};

    const name = form.name.trim();
    const desc = form.description.trim();
    const price = form.price.trim();
 
    if (!name) e.name = "El nombre es obligatorio.";
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(name))
      e.name = "El nombre solo puede tener letras y espacios.";
    else if (normalizedExistingNames.has(name.toLowerCase()))
      e.name = "Ya existe un platillo con ese nombre.";

    if (!desc) e.description = "La descripción es obligatoria.";

    if (!price) e.price = "El precio es obligatorio.";
    else if (!/^\d+(\.\d{1,2})?$/.test(price))
      e.price = "Precio inválido (ej: 5000 o 5000.00).";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (k: keyof MenuItemFormData, v: any) => {
    let next = v;

    if (k === "name") next = onlyLettersAndSpaces(String(v));
    if (k === "price") next = onlyPrice(String(v));

    setForm((p) => ({ ...p, [k]: next }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const handlePickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm((p) => ({ ...p, photoFile: file }));

    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setForm((p) => ({ ...p, photoFile: null }));
    setPhotoPreview("");
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Revisá los campos marcados.");
      return;
    }
    await onSubmit({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price.trim(),
    });
  };

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-black/40 backdrop-blur-md p-8">
    
    <h1 className="text-3xl font-playfair font-semibold">
      {title ?? "Registrar platillo"}
    </h1>

      <p className="text-muted-foreground mt-2">Completa la información del platillo.</p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nombre */}
        <div className="md:col-span-2">
          <label className="block text-sm text-muted-foreground mb-2">Nombre *</label>
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/30 border border-border outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ej: Cantones"
          />
          {errors.name && <p className="text-destructive text-sm mt-2">{errors.name}</p>}
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block text-sm text-muted-foreground mb-2">Descripción *</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/30 border border-border outline-none focus:ring-2 focus:ring-primary min-h-[110px]"
            placeholder="Ej: Arroz chino, bueno bonito y barato"
          />
          {errors.description && (
            <p className="text-destructive text-sm mt-2">{errors.description}</p>
          )}
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Precio *</label>
          <input
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/30 border border-border outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ej: 5000.00"
            inputMode="decimal"
          />
          {errors.price && <p className="text-destructive text-sm mt-2">{errors.price}</p>}
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Categoría *</label>
          <select
           
            className="w-full px-4 py-3 rounded-lg bg-black/30 border border-border outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Seleccionar...</option>
            {/* 🔧 por ahora estático; luego lo conectamos a API */}
            <option value="1">Platos fuertes</option>
            <option value="2">Entradas</option>
            <option value="3">Bebidas</option>
            <option value="4">Postres</option>
          </select>
          {errors.categoryId && (
            <p className="text-destructive text-sm mt-2">{errors.categoryId}</p>
          )}
        </div>

        {/* Disponibilidad */}
        <div className="md:col-span-2 flex items-center gap-3 mt-2">
          <input
            id="isactive"
            type="checkbox"
            checked={form.isactive}
            onChange={(e) => handleChange("isactive", e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="isactive" className="text-sm text-muted-foreground">
            Disponible en el menú (activo)
          </label>
        </div>

        {/* Foto */}
        <div className="md:col-span-2">
          <label className="block text-sm text-muted-foreground mb-2">Foto del platillo</label>

          <div className="flex items-center gap-5">
           {previewToShow ? (
         <img
             src={previewToShow}
             alt="Foto platillo"
             className="h-24 w-24 rounded-xl object-cover border border-border"
           />
            ) : (
            <div className="h-24 w-24 rounded-xl border border-border flex items-center justify-center text-muted-foreground text-xs">
                Sin foto
           </div>
            )}


            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handlePickPhoto}
                className="block w-full text-sm text-muted-foreground
                           file:mr-4 file:rounded-lg file:border-0
                           file:bg-primary file:px-4 file:py-2
                           file:text-primary-foreground file:font-semibold
                           hover:file:opacity-90"
              />

              {photoPreview && (
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="self-start text-sm text-muted-foreground hover:text-foreground underline"
                >
                  Quitar foto
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="md:col-span-2 flex gap-3 justify-end mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-5 py-2 hover:bg-white/5 transition"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-5 py-2 text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
