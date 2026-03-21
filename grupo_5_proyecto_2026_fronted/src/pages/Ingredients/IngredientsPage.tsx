import { useEffect, useMemo, useState } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { ingredientService, FILES_BASE_URL } from "@/services/ingredientsService";
import { useNavigate } from "react-router-dom";
import type { Ingredient } from "@/types/Ingredients";
import placeholderImg from "@/assets/images/placeholder.webp";

const IngredientsPage = () => {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [search, setSearch] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSidebarToggle = (hidden: boolean) => {
    setSidebarHidden(hidden);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] =
    useState<Ingredient | null>(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const data = await ingredientService.list();
      setIngredients(data);
    } catch (error) {
      console.error("Error al cargar ingredientes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ingredients;

    return ingredients.filter((i) =>
      i.name.toLowerCase().includes(q)
    );
  }, [search, ingredients]);

  const handleDeleteClick = (ingredient: Ingredient) => {
    setIngredientToDelete(ingredient);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!ingredientToDelete) return;

    try {
      setDeleting(true);
      await ingredientService.delete(ingredientToDelete.id);

      setIngredients((prev) =>
        prev.filter((i) => i.id !== ingredientToDelete.id)
      );

      setShowDeleteModal(false);
      setIngredientToDelete(null);
    } catch {
      console.error("Error al eliminar ingrediente");
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

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold">
                Gestión de Ingredientes
              </h1>
              <p className="text-muted-foreground mt-2">
                Lista de ingredientes registrados.
              </p>
            </div>

            <button
              onClick={() => navigate("/ingredientes/crear")}
              className="rounded-lg bg-primary px-5 py-2 text-primary-foreground font-semibold hover:opacity-90 transition"
            >
              Registrar ingrediente
            </button>
          </div>

          <div className="mt-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ingrediente"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/30 border border-border"
            />
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left">
              <thead className="bg-black/30">
                <tr className="text-muted-foreground">
                  <th className="px-4 py-3">Foto</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <img
                        src={
                          i.photo
                            ? `${FILES_BASE_URL}${i.photo}`
                            : placeholderImg
                        }
                        alt={i.name}
                        className="h-12 w-12 object-cover rounded border border-border"
                        onError={(e) => {
                          e.currentTarget.src = placeholderImg;
                        }}
                      />
                    </td>

                    <td className="px-4 py-3">{i.name}</td>
                    <td className="px-4 py-3">{i.stock}</td>
                    <td className="px-4 py-3">₡{i.price}</td>

                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-4">
                        <button
                          title="Editar"
                          onClick={() =>
                            navigate(`/ingredientes/editar/${i.id}`)
                          }
                        >
                          <Pencil className="text-blue-400" />
                        </button>

                        <button
                          title="Eliminar"
                          onClick={() => handleDeleteClick(i)}
                        >
                          <Trash2 className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      No hay ingredientes.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center">
                      Cargando ingredientes...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showDeleteModal && ingredientToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-background border border-border p-6">
              <h2 className="text-xl font-semibold">
                Eliminar ingrediente
              </h2>

              <p className="mt-3 text-muted-foreground">
                ¿Deseas eliminar{" "}
                <span className="font-semibold text-foreground">
                  {ingredientToDelete.name}
                </span>?
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setIngredientToDelete(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-border"
                  disabled={deleting}
                >
                  Cancelar
                </button>

                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white"
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

export default IngredientsPage;

