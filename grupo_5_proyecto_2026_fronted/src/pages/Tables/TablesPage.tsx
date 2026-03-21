import { useEffect, useMemo, useState } from "react";
import { Table } from "../../types/Table";
import { getTables, deleteTable } from "../../services/tableService";
import TableCard from "../../components/tables/TableCard";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Pencil, Trash2 } from "lucide-react";
import CreateOrderModal from "@/components/orders/CreateOrderModal";
import { toast } from "sonner";

export default function TablesPage() {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSidebarToggle = (hidden: boolean) => {
    setSidebarHidden(hidden);
  };

  // eliminar mesa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);
  const [deleting, setDeleting] = useState(false);

  // crear orden
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const navigate = useNavigate();

  const user = useMemo(() => {
    const userString = sessionStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  }, []);

  const isAdmin = user?.role === "Administrador";
  const isMesero = user?.role === "Mesero";

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await getTables();
      setTables(data);
    } catch (error) {
      console.error("Error cargando mesas", error);
      toast.error("No se pudieron cargar las mesas.");
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = (table: Table) => {
    // SOLO Mesero/Admin crean órdenes
    if (!isMesero && !isAdmin) {
      toast.error("No tienes permisos para crear órdenes.");
      return;
    }

    setSelectedTable(table);
    setOrderModalOpen(true);
  };

  const handleAddTable = () => {
    navigate("/tables/create");
  };

  const handleDeleteClick = (table: Table) => {
    setTableToDelete(table);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTableToDelete(null);
  };

  const confirmDelete = async () => {
    if (!tableToDelete) return;

    try {
      setDeleting(true);
      await deleteTable(tableToDelete.id);

      setTables((prev) => prev.filter((t) => t.id !== tableToDelete.id));

      toast.success("Mesa eliminada.");
      closeDeleteModal();
    } catch (error) {
      console.error("Error al eliminar mesa", error);
      toast.error("No se pudo eliminar la mesa.");
    } finally {
      setDeleting(false);
    }
  };

  const closeOrderModal = () => {
    setOrderModalOpen(false);
    setSelectedTable(null);
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar onToggle={handleSidebarToggle} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarHidden ? "md:ml-0" : "md:ml-64"
      }`}>
        <main className="flex-1 px-6 pt-24 pb-10">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-black/40 backdrop-blur-md p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="min-w-[120px]">
              {isAdmin ? (
                <button
                  onClick={handleAddTable}
                  className="rounded-lg bg-primary px-5 py-2 text-primary-foreground font-semibold hover:opacity-90 transition"
                >
                  Agregar
                </button>
              ) : (
                <div />
              )}
            </div>

            <h2 className="text-2xl font-semibold">Mesas</h2>

            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border border-border px-5 py-2 font-semibold hover:bg-muted transition"
            >
              Regresar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 justify-items-center bg-[#1f2937] p-6 rounded-xl">
            {loading ? (
              <div className="col-span-2 text-muted-foreground">
                Cargando mesas...
              </div>
            ) : tables.length === 0 ? (
              <div className="col-span-2 text-muted-foreground">
                No hay mesas registradas.
              </div>
            ) : (
              tables.map((table) => (
                <div key={table.id} className="flex flex-col items-center gap-2">
                  <TableCard table={table} onClick={handleTableClick} />

                  {isAdmin && (
                    <div className="flex gap-4 mt-2">
                      <button
                        title="Editar"
                        onClick={() => navigate(`/tables/edit/${table.id}`)}
                      >
                        <Pencil className="text-blue-400" />
                      </button>

                      <button
                        title="Eliminar"
                        onClick={() => handleDeleteClick(table)}
                      >
                        <Trash2 className="text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
      </div>

      {/* Modal crear orden */}
      <CreateOrderModal
        open={orderModalOpen}
        table={selectedTable}
        onClose={closeOrderModal}
        onCreated={() => {
          closeOrderModal();
          navigate("/orders");
        }}
      />

      {/* Modal eliminar mesa */}
      {showDeleteModal && tableToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-background border border-border p-6">
            <h2 className="text-xl font-semibold">Eliminar mesa</h2>

            <p className="mt-3 text-muted-foreground">
              ¿Deseas eliminar la mesa{" "}
              <span className="font-semibold text-foreground">
                #{tableToDelete.number}
              </span>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
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
    </div>
  );
}
