import { useEffect, useState } from "react";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/services/announcementService";
import type { Announcement } from "@/types/Announcement";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error cargando avisos:", error);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ title: "", content: "" });
    setIsOpen(true);
  };

  const handleOpenEdit = (a: Announcement) => {
    setEditingId(a.id);
    setForm({ title: a.title, content: a.content });
    setIsOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!form.title.trim() || !form.content.trim()) {
        alert("Todos los campos son obligatorios");
        return;
      }

      if (editingId !== null) {
        await updateAnnouncement(editingId, form);
      } else {
        await createAnnouncement(form);
      }

      setIsOpen(false);
      setEditingId(null);
      setForm({ title: "", content: "" });
      await loadData();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Ocurrió un error al guardar el aviso");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const confirmDelete = window.confirm("¿Seguro que deseas eliminar este aviso?");
      if (!confirmDelete) return;

      await deleteAnnouncement(id);
      await loadData();
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("Error al eliminar el aviso");
    }
  };

  return (
    <div className="mt-16 bg-muted/30 rounded-xl p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📢 Avisos Importantes</h2>

        <button
          onClick={handleOpenCreate}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
        >
          + Agregar
        </button>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 && (
          <p className="text-muted-foreground">
            No hay avisos publicados.
          </p>
        )}

        {announcements.map((a) => (
          <div key={a.id} className="bg-card text-foreground p-4 rounded-lg shadow-md border border-border">
            <h3 className="text-lg font-semibold">{a.title}</h3>
            <p className="text-muted-foreground">{a.content}</p>

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => handleOpenEdit(a)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
                type="button"
              >
                Editar
              </button>

              <button
                onClick={() => handleDelete(a.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
                type="button"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card text-foreground p-6 rounded-2xl w-96 shadow-2xl border border-border">
            <h3 className="text-xl font-bold mb-4">
              {editingId !== null ? "Editar Aviso" : "Nuevo Aviso"}
            </h3>

            <input
              type="text"
              placeholder="Título"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              className="w-full bg-input text-foreground border border-border p-2 rounded mb-3"
            />

            <textarea
              placeholder="Contenido"
              value={form.content}
              onChange={(e) =>
                setForm({ ...form, content: e.target.value })
              }
              className="w-full bg-input text-foreground border border-border p-2 rounded mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-muted text-foreground rounded-lg"
                type="button"
              >
                Cancelar
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                type="button"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;