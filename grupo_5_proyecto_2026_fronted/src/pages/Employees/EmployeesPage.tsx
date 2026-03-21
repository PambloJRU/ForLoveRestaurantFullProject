import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Search, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import EmployeeForm from "@/components/employees/employeeForm";
import type { Employee } from "@/types/Employee";
import { disableEmployee, editEmployee, listEmployees, enableEmployee } from "@/services/employee";
import { toast } from "sonner";

const EmployeesPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [sidebarHidden] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Employee | null>(null);

  const token = sessionStorage.getItem("token");
  if (!token) navigate("/login");

  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: ["employees"],
    queryFn: listEmployees,
    retry: false,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;

    return data.filter((e) => {
      const full = `${e.name ?? ""} ${e.lastNames ?? ""}`.trim().toLowerCase();
      return full.startsWith(q);
    });
  }, [search, data]);

  const edit = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Employee }) =>
      editEmployee(id, payload),
    onSuccess: async (res: any) => {
      toast.success(res?.value ?? "Empleado actualizado correctamente");
      setEditing(null);
      await qc.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Error editando empleado"),
  });

 const toggleStatus = async (employee: Employee) => {
  try {
    if (!employee.id) return toast.error("Falta el ID.");

    if (employee.isActive) {
      await disableEmployee(employee.id);
      toast.success("Empleado desactivado");
    } else {
      await enableEmployee({ ...employee, isActive: true });
      toast.success("Empleado activado");
    }

    await qc.invalidateQueries({ queryKey: ["employees"] });
  } catch (e: any) {
    toast.error(e?.message ?? "Error cambiando estado");
  }
};

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarHidden ? "md:ml-0" : "md:ml-64"
      }`}>
        <main className="flex-1 px-6 pt-24 pb-10">
          <div className="mx-auto max-w-6xl rounded-2xl border border-border bg-black/40 backdrop-blur-md p-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-semibold">Empleados</h1>
                <p className="text-muted-foreground mt-2">
                  Consulta y edita empleados registrados.
                </p>
              </div>

              <button
                onClick={() => navigate("/employees/create")}
                className="rounded-lg bg-primary px-5 py-2 text-primary-foreground font-semibold hover:opacity-90 transition"
              >
                Registrar empleado
              </button>
            </div>

            {/* Buscar */}
            <div className="mt-6 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/30 border border-border outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Estados */}
            {isLoading && (
              <div className="mt-6 text-muted-foreground">
                Cargando empleados...
              </div>
            )}

            {isError && (
              <div className="mt-6 rounded-xl border border-border bg-black/30 p-4">
                <p className="text-destructive font-semibold">
                  Error cargando empleados
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  {(error as any)?.message}
                </p>
              </div>
            )}

            {/* Tabla */}
            {!isLoading && !isError && (
              <div className="mt-6 overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left">
                  <thead className="bg-black/30">
                    <tr className="text-muted-foreground">
                      <th className="px-4 py-3">Identificación</th>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Apellidos</th>
                      <th className="px-4 py-3">Turno</th>
                      <th className="px-4 py-3">Salario</th>
                      <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((e) => (
                      <tr key={e.id ?? e.identification} className="border-t border-border">
                        <td className="px-4 py-3 text-muted-foreground">{e.identification}</td>
                        <td className="px-4 py-3">{e.name}</td>
                        <td className="px-4 py-3">{e.lastNames}</td>
                        <td className="px-4 py-3 text-muted-foreground">{e.shift}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          ₡ {Number(e.salary ?? 0).toLocaleString("es-CR")}
                        </td>

                        

                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-4 items-center">
                            <button
                              onClick={() => setEditing(e)}
                              title="Editar"
                              className="hover:opacity-90"
                            >
                              <Pencil className="text-blue-400" />
                            </button>

                            {/* SWITCH */}
                            <button
                              onClick={() => toggleStatus(e)}
                              className={`relative w-14 h-7 flex items-center rounded-full p-1 transition duration-300 ${
                                e.isActive ? "bg-green-500" : "bg-red-500"
                              }`}
                              title={e.isActive ? "Desactivar" : "Activar"}
                            >
                              <div
                                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition duration-300 ${
                                  e.isActive ? "translate-x-7" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                       <td colSpan={6} className="py-6 text-center text-muted-foreground">
                          No hay resultados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal editar */}
          {editing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
              <div className="relative w-full max-w-lg">
                <button
                  onClick={() => setEditing(null)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
                >
                  <X />
                </button>

                <EmployeeForm
                  initialData={editing}
                  onSubmit={(payload) => {
                    if (!editing.id) return toast.error("Falta el ID.");
                    edit.mutate({ id: editing.id, payload });
                  }}
                  onCancel={() => setEditing(null)}
                  isSubmitting={edit.isPending}
                />
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default EmployeesPage;
