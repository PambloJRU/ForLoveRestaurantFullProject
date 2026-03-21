import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { addTable, editTable, getTables } from "../../services/tableService";
import { Table } from "../../types/Table";

type TableState = "Libre" | "Ocupado" | "Reservado";

export default function TableForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = !!id;

  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [state, setState] = useState<TableState>("Libre");

  const handleSidebarToggle = (hidden: boolean) => {
    setSidebarHidden(hidden);
  };

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // =========================
  // 🔒 BLOQUEAR TECLAS INVÁLIDAS
  // =========================
  const blockInvalidKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
      e.preventDefault();
    }
  };

  // =========================
  // 🧹 SOLO DÍGITOS
  // =========================
  const handleNumericChange = (
    value: string,
    setter: (v: string) => void
  ) => {
    const cleaned = value.replace(/\D/g, "");
    setter(cleaned);
  };

  // =========================
  // 🚫 BLOQUEAR PEGADO INVÁLIDO
  // =========================
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData("text");
    if (!/^\d+$/.test(pasteData)) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (isEdit && id) {
      loadTable(id);
    }
  }, [id]);

  /**
   * Cargar mesa
   */
  const loadTable = async (tableId: string) => {
    try {
      const tables = await getTables();
      const table = tables.find((t: Table) => t.id === Number(tableId));

      if (!table) {
        setModalMessage("No se encontró la mesa.");
        setShowModal(true);
        return;
      }

      setNumber(String(table.number));
      setCapacity(String(table.capacity));
      setState((table.state as TableState) ?? "Libre");
    } catch (error) {
      console.error("Error cargando mesa", error);
      setModalMessage("No se pudo cargar la mesa.");
      setShowModal(true);
    }
  };

  /**
   * Guardar
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // =========================
    // 🧠 VALIDACIÓN FINAL ROBUSTA
    // =========================
    if (!/^\d+$/.test(number) || !/^\d+$/.test(capacity)) {
      setModalMessage("Número y capacidad deben contener solo números.");
      setShowModal(true);
      return;
    }

    if (Number(number) <= 0 || Number(capacity) <= 0) {
      setModalMessage("Número y capacidad deben ser mayores a 0.");
      setShowModal(true);
      return;
    }

    try {
      setLoading(true);

      const tables = await getTables();

      const exists = tables.some(
        (t) =>
          t.number === Number(number) &&
          (!isEdit || t.id !== Number(id))
      );

      if (exists) {
        setModalMessage("Ya existe una mesa con ese número.");
        setShowModal(true);
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("number", number);
      formData.append("capacity", capacity);
      formData.append("state", state);

      if (isEdit && id) {
        await editTable(Number(id), formData);
      } else {
        await addTable(formData);
      }

      navigate("/tables");
    } catch (error) {
      console.error("Error guardando mesa", error);
      setModalMessage("Ocurrió un error al guardar la mesa.");
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar onToggle={handleSidebarToggle} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarHidden ? "md:ml-0" : "md:ml-64"
      }`}>
        <main className="flex-1 px-6 pt-24 pb-10">
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-black/40 backdrop-blur-md p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            {isEdit ? "Editar Mesa" : "Agregar Mesa"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Número */}
            <div>
              <label className="block mb-1 text-sm">Número de mesa</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={number}
                onKeyDown={blockInvalidKeys}
                onPaste={handlePaste}
                onChange={(e) =>
                  handleNumericChange(e.target.value, setNumber)
                }
                required
                className="w-full rounded-lg border border-border bg-transparent px-3 py-2"
              />
            </div>

            {/* Capacidad */}
            <div>
              <label className="block mb-1 text-sm">Capacidad</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={capacity}
                onKeyDown={blockInvalidKeys}
                onPaste={handlePaste}
                onChange={(e) =>
                  handleNumericChange(e.target.value, setCapacity)
                }
                required
                className="w-full rounded-lg border border-border bg-transparent px-3 py-2"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block mb-1 text-sm">Estado</label>

              {isEdit ? (
                <select
                  value={state}
                  onChange={(e) =>
                    setState(e.target.value as TableState)
                  }
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2"
                >
                  <option value="Libre">Libre</option>
                  <option value="Ocupado">Ocupado</option>
                  <option value="Reservado">Reservado</option>
                </select>
              ) : (
                <input
                  type="text"
                  value="Libre"
                  disabled
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2 opacity-70"
                />
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg border border-border px-5 py-2 font-semibold hover:bg-muted transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary px-5 py-2 text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-background border border-border p-6">
            <h3 className="text-lg font-semibold">Aviso</h3>
            <p className="mt-3 text-muted-foreground">{modalMessage}</p>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg bg-primary px-4 py-2 text-primary-foreground font-semibold hover:opacity-90 transition"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}