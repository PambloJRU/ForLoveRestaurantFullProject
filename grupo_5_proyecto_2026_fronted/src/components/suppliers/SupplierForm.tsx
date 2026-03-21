import { useEffect, useState } from "react";
import type { Supplier, SupplierFormData } from "@/types/Supplier";
import { supplierPhotoUrl } from "@/services/supplier";

type Props = {
  initialData?: Supplier | null;
  onSubmit: (data: SupplierFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
};

const SupplierForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: Props) => {
  const emptyForm: SupplierFormData = {
    name: "",
    phone: "",
    email: "",
    identification: "",
    photoFile: null,
  };

  const [form, setForm] = useState<SupplierFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string>("");

  // ✅ SINCRONIZAR CUANDO CAMBIA initialData
  useEffect(() => {
    setErrors({}); // 🔥 limpiar errores siempre

    if (initialData) {
      setForm({
        name: initialData.name ?? "",
        phone: initialData.phone ?? "",
        email: initialData.email ?? "",
        identification: initialData.identification ?? "",
        photoFile: null,
      });

      setPhotoPreview(
        initialData.photo ? supplierPhotoUrl(initialData.photo) : ""
      );
    } else {
      setForm(emptyForm);
      setPhotoPreview("");
    }
  }, [initialData]);

  // ✅ limpiar URLs blob para evitar leaks
  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // ================= VALIDACIÓN =================

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.name.trim()) e.name = "El nombre es obligatorio.";
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(form.name.trim()))
      e.name = "El nombre solo puede tener letras.";

    if (form.phone && !/^\d+$/.test(form.phone))
      e.phone = "El teléfono solo puede tener números.";

    if (form.identification && !/^\d+$/.test(form.identification))
      e.identification = "La identificación solo puede tener números.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onlyLettersAndSpaces = (value: string) =>
    value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");

  const onlyNumbers = (value: string) =>
    value.replace(/[^0-9]/g, "");

  const handleChange = (k: keyof SupplierFormData, v: string) => {
    let next = v;

    if (k === "name") next = onlyLettersAndSpaces(v);
    if (k === "phone") next = onlyNumbers(v);
    if (k === "identification") next = onlyNumbers(v);

    setForm((prev) => ({ ...prev, [k]: next }));
    setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const handlePickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    setForm((prev) => ({ ...prev, photoFile: file }));

    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const clearPhoto = () => {
    setForm((prev) => ({ ...prev, photoFile: null }));
    setPhotoPreview("");
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    await onSubmit({
      ...form,
      name: form.name.trim(),
      phone: form.phone?.trim() ?? "",
      email: form.email?.trim() ?? "",
      identification: form.identification?.trim() ?? "",
    });
  };

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-black/40 backdrop-blur-md p-8">
      <h1 className="text-3xl font-playfair font-semibold">
        {initialData ? "Editar proveedor" : "Registrar proveedor"}
      </h1>

      <p className="text-muted-foreground mt-2">
        Completa la información del proveedor.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {/* Nombre */}
        <div className="md:col-span-2">
          <label className="block text-sm text-muted-foreground mb-2">
            Nombre *
          </label>
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/30 border border-border outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ej: Distribuidora XYZ"
          />
          {errors.name && (
            <p className="text-destructive text-sm mt-2">{errors.name}</p>
          )}
        </div>

        {/* Identificación */}
        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            Identificación
          </label>
          <input
            value={form.identification ?? ""}
            onChange={(e) =>
              handleChange("identification", e.target.value)
            }
            className="w-full px-4 py-3 rounded-lg bg-black/30 border border-border outline-none focus:ring-2 focus:ring-primary"
            placeholder="Cédula/Jurídica/RUC"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            Teléfono
          </label>
          <input
            value={form.phone ?? ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/30 border border-border outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ej: 88888888"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            Correo
          </label>
          <input
            type="email"
            value={form.email ?? ""}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/30 border border-border outline-none focus:ring-2 focus:ring-primary"
            placeholder="ejemplo@correo.com"
          />
        </div>

        {/* Foto */}
        <div className="md:col-span-2">
          <label className="block text-sm text-muted-foreground mb-2">
            Foto del proveedor
          </label>

          <div className="flex items-center gap-4">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Foto proveedor"
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
};

export default SupplierForm;