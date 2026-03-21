import { useEffect, useMemo, useState } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { userService } from "@/services/userService";
import { listEmployees } from "@/services/employee";
import { useNavigate } from "react-router-dom";
import type { Employee } from "@/types/Employee";

interface UserAPI {
  id: number;
  name: string;
  idEmploye: number;
  idRol: number;
  isActve: boolean;
}

interface UserUI {
  id: number;
  username: string;
  employee: string;
  role: "Administrador" | "Cocinero" | "Mesero";
}

const ROLE_MAP: Record<number, UserUI["role"]> = {
  1: "Administrador",
  2: "Cocinero",
  3: "Mesero",
};

const UsersPage = () => {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserUI[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSidebarToggle = (hidden: boolean) => {
    setSidebarHidden(hidden);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserUI | null>(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      setLoading(true);

      const [usersData, employeesData]: [
        UserAPI[],
        Employee[]
      ] = await Promise.all([
        userService.list(),
        listEmployees(),
      ]);

      const employeeMap = new Map<number, string>();

      employeesData.forEach((e) => {
        if (e.id) {
          employeeMap.set(
            e.id,
            `${e.name} ${e.lastNames}`
          );
        }
      });

      const mapped: UserUI[] = usersData.map((u) => ({
        id: u.id,
        username: u.name,
        employee:
          employeeMap.get(u.idEmploye) ??
          "Empleado no encontrado",
        role: ROLE_MAP[u.idRol] ?? "Mesero",
      }));

      setUsers(mapped);
    } catch {
      console.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.employee.toLowerCase().includes(q)
    );
  }, [search, users]);

  const handleDeleteClick = (user: UserUI) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      await userService.delete(userToDelete.id);
      setUsers((prev) =>
        prev.filter((u) => u.id !== userToDelete.id)
      );
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch {
      console.error("Error al eliminar usuario");
    } finally {
      setDeleting(false);
    }
  };

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
                Gestión de usuarios
              </h1>
              <p className="text-muted-foreground mt-2">
                Usuarios del sistema y sus roles.
              </p>
            </div>

            <button
              onClick={() => navigate("/usuarios/crear")}
              className="rounded-lg bg-primary px-5 py-2 text-primary-foreground font-semibold hover:opacity-90 transition"
            >
              Registrar usuario
            </button>
          </div>

          {/* Buscar */}
          <div className="mt-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por usuario o empleado"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/30 border border-border"
            />
          </div>

          {/* Tabla */}
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left">
              <thead className="bg-black/30">
                <tr className="text-muted-foreground">
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Empleado</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-4 py-3">{u.username}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.employee}
                    </td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-4">
                        <button
                          title="Editar"
                          onClick={() =>
                            navigate(`/usuarios/editar/${u.id}`)
                          }
                        >
                          <Pencil className="text-blue-400" />
                        </button>

                        <button
                          title="Eliminar"
                          onClick={() => handleDeleteClick(u)}
                        >
                          <Trash2 className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No hay resultados.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center">
                      Cargando usuarios...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-background border border-border p-6">
              <h2 className="text-xl font-semibold">
                Eliminar usuario
              </h2>

              <p className="mt-3 text-muted-foreground">
                ¿Deseas eliminar el usuario {" "}
                <span className="font-semibold text-foreground">
                  {userToDelete.username}
                </span>
                ? Esta acción no se puede deshacer.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition"
                  disabled={deleting}
                >
                  Cancelar
                </button>

                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
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

export default UsersPage;
