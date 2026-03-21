import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { listEmployees } from "@/services/employee";
import { userService } from "@/services/userService";
import type { Employee } from "@/types/Employee";

const roles = [
  { id: 1, name: "Administrador" },
  { id: 2, name: "Cocinero" },
  { id: 3, name: "Mesero" },
];

const CreateUserPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSidebarToggle = (hidden: boolean) => {
    setSidebarHidden(hidden);
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    password: "",
    idEmploye: 0,
    idRol: 1,
  });

  useEffect(() => {
    listEmployees().then(setEmployees).catch(console.error);
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    userService.list().then((users) => {
      const user = users.find((u: any) => u.id === Number(id));
      if (!user) return;
      setForm({
        name: user.name,
        password: "",
        idEmploye: user.idEmploye,
        idRol: user.idRol,
      });
    });
  }, [id, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "idEmploye" || name === "idRol" ? Number(value) : value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setErrorMessage("El nombre de usuario no puede estar vacío ni contener solo espacios.");
      setShowErrorModal(true);
      return false;
    }
    if (!isEdit && !form.password.trim()) {
      setErrorMessage("La contraseña no puede estar vacía ni contener solo espacios.");
      setShowErrorModal(true);
      return false;
    }
    if (!form.idEmploye) {
      setErrorMessage("Debes seleccionar un empleado.");
      setShowErrorModal(true);
      return false;
    }
    if (!form.idRol) {
      setErrorMessage("Debes seleccionar un rol.");
      setShowErrorModal(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      if (isEdit) {
        await userService.edit(Number(id), {
          ...form,
          name: form.name.trim(),
          password: form.password.trim(),
        });
        setSuccessMessage("Usuario actualizado correctamente");
      } else {
        await userService.create({
          ...form,
          name: form.name.trim(),
          password: form.password.trim(),
        });
        setSuccessMessage("Usuario creado correctamente");
      }
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error al guardar usuario");
      setErrorMessage("Ocurrió un error al guardar el usuario.");
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar onToggle={handleSidebarToggle} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarHidden ? "md:ml-0" : "md:ml-64"
      }`}>
        <main className="flex-1 px-6 pt-24 pb-10">
          <div className="mx-auto max-w-xl rounded-2xl border border-border bg-black/40 p-8">
          <h1 className="text-2xl font-semibold mb-6">
            {isEdit ? "Editar usuario" : "Registrar usuario"}
          </h1>
          <div className="space-y-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nombre de usuario"
              className="w-full p-3 rounded-lg bg-black/30 border"
            />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder={isEdit ? "Nueva contraseña (opcional)" : "Contraseña"}
              className="w-full p-3 rounded-lg bg-black/30 border"
            />
            <select
              name="idRol"
              value={form.idRol}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-black/30 border"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <select
              name="idEmploye"
              value={form.idEmploye}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-black/30 border"
            >
              <option value={0}>Selecciona un empleado</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} {e.lastNames}
                </option>
              ))}
            </select>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={saving}
                className="w-full bg-gray-600 hover:bg-gray-700 py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="w-full bg-primary py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {saving
                  ? "Guardando..."
                  : isEdit
                    ? "Guardar cambios"
                    : "Registrar usuario"}
              </button>
            </div>
          </div>
        </div>

        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-background border border-border p-6 text-center">
              <h2 className="text-xl font-semibold">¡Operación exitosa!</h2>
              <p className="mt-3 text-muted-foreground">{successMessage}</p>
              <button
                onClick={() => navigate("/")}
                className="mt-6 w-full rounded-lg bg-primary py-2 font-semibold"
              >
                Aceptar
              </button>
            </div>
          </div>
        )}

        {showErrorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-background border border-border p-6 text-center">
              <h2 className="text-xl font-semibold text-red-500">Error</h2>
              <p className="mt-3 text-muted-foreground">{errorMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="mt-6 w-full rounded-lg bg-primary py-2 font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
      </div>
    </div>
  );
};

export default CreateUserPage;