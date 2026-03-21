import { useState } from "react";
import type { Employee } from "@/types/Employee";

type EmployeeFormState = Omit<Employee, "salary"> & { salary: string };

interface Props {
  initialData?: Employee;
  onSubmit: (data: Employee) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  title?: string; 
}

const onlyDigits = (v: string) => v.replace(/\D/g, "");
const onlyLettersSpaces = (v: string) =>
  v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s']/g, "");

const EmployeeForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  title,
}: Props) => {
  const [form, setForm] = useState<EmployeeFormState>(() => {
    if (initialData) {
      return {
        ...initialData,
        salary: String(initialData.salary ?? ""),
      };
    }

    return {
      identification: "",
      name: "",
      lastNames: "",
      shift: "Diurno",
      salary: "",
      isActive: true,
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "identification") {
      const clean = onlyDigits(value).slice(0, 9);
      setForm((p) => ({ ...p, identification: clean }));
      return;
    }

    if (name === "name") {
      const clean = onlyLettersSpaces(value);
      setForm((p) => ({ ...p, name: clean }));
      return;
    }

    if (name === "lastNames") {
      const clean = onlyLettersSpaces(value);
      setForm((p) => ({ ...p, lastNames: clean }));
      return;
    }

    if (name === "salary") {
      const clean = onlyDigits(value);
      setForm((p) => ({ ...p, salary: clean }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value as any }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.identification.length !== 9) {
      alert("La identificación debe tener exactamente 9 números.");
      return;
    }

    if (!form.name.trim()) {
      alert("El nombre es requerido.");
      return;
    }

    if (!form.lastNames.trim()) {
      alert("Los apellidos son requeridos.");
      return;
    }

    const salaryNumber = Number(form.salary);
    if (!form.salary || Number.isNaN(salaryNumber) || salaryNumber <= 0) {
      alert("Por favor ingresa un salario válido (mayor que 0).");
      return;
    }

    const payload: Employee = {
      id: initialData?.id,
      identification: form.identification.trim(),
      name: form.name.trim(),
      lastNames: form.lastNames.trim(),
      shift: form.shift,
      salary: salaryNumber,
      isActive: true,
      
    };

    onSubmit(payload);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 pt-24 pb-10">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-black/40 backdrop-blur-md shadow-2xl p-8 md:p-10">
        <h2 className="text-3xl font-playfair font-semibold">
          {title ?? (initialData ? "Editar empleado" : "Registrar empleado")}
        </h2>
        <p className="text-muted-foreground mt-2">
          Completa los datos para guardar el empleado.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">Identificación</label>
              <input
                name="identification"
                placeholder="Ej: 702910420"
                value={form.identification}
                onChange={handleChange}
                required
                inputMode="numeric"
                maxLength={9}
                autoComplete="off"
                className="w-full rounded-lg border border-border bg-black/30 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Solo números (9 dígitos).
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Turno</label>
              <select
                name="shift"
                value={form.shift}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-black/30 px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Diurno">Diurno</option>
                <option value="Nocturno">Nocturno</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nombre</label>
              <input
                name="name"
                placeholder="Ej: Dayron"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="off"
                className="w-full rounded-lg border border-border bg-black/30 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Solo letras y espacios.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Apellidos</label>
              <input
                name="lastNames"
                placeholder="Ej: Ortiz Alvarado"
                value={form.lastNames}
                onChange={handleChange}
                required
                autoComplete="off"
                className="w-full rounded-lg border border-border bg-black/30 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Solo letras y espacios.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Salario</label>
            <input
              name="salary"
              type="text"
              inputMode="numeric"
              placeholder="Ej: 300000"
              value={form.salary}
              onChange={handleChange}
              required
              autoComplete="off"
              className="w-full rounded-lg border border-border bg-black/30 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Coloca el salario en colones (sin comas).
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-border bg-black/20 px-6 py-3 text-foreground hover:bg-black/30 transition"
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-60"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
