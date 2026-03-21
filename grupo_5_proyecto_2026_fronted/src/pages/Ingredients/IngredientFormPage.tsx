import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { ingredientService } from "@/services/ingredientsService";
import placeholderImg from "@/assets/images/placeholder.webp";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// 🔥 LÍMITES DE NEGOCIO
const MAX_PRICE = 10_000_000;
const MAX_STOCK = 100_000;
const MAX_NAME_LENGTH = 30;

const IngredientFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(placeholderImg);
  const [loading, setLoading] = useState(false);

  const handleSidebarToggle = (hidden: boolean) => {
    setSidebarHidden(hidden);
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  // =========================
  // 🔒 BLOQUEAR TECLAS NUMÉRICAS INVÁLIDAS
  // =========================
  const blockInvalidNumberKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
      e.preventDefault();
    }
  };

  // =========================
  // 🔤 NOMBRE (solo letras, máximo 30)
  // =========================
  const handleNameChange = (value: string) => {
    const cleaned = value
      .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
      .slice(0, MAX_NAME_LENGTH);

    setName(cleaned);
  };

  // =========================
  // 🔢 SOLO DÍGITOS (SIN LIMITE DURO)
  // =========================
  const handleNumericChange = (
    value: string,
    setter: (v: string) => void
  ) => {
    const cleaned = value.replace(/\D/g, "");
    setter(cleaned);
  };

  // =========================
  // 🚫 BLOQUEAR PEGADO NO NUMÉRICO
  // =========================
  const handlePasteNumbers = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    const pasteData = e.clipboardData.getData("text");
    if (!/^\d+$/.test(pasteData)) {
      e.preventDefault();
    }
  };

  // =========================
  // 🖼️ VALIDACIÓN IMAGEN
  // =========================
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setModalMessage("Formato de imagen no permitido.");
      setShowModal(true);
      return;
    }

    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setModalMessage("Extensión de archivo no válida.");
      setShowModal(true);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setModalMessage("La imagen no debe superar 5MB.");
      setShowModal(true);
      return;
    }

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    if (isEdit) {
      loadIngredient();
    }
  }, [id]);

  const loadIngredient = async () => {
    try {
      const data = await ingredientService.getById(Number(id));

      setName(data.name ?? "");
      setPrice(String(data.price ?? ""));
      setStock(String(data.stock ?? ""));

      if (data.photo) {
        setPreview(`http://localhost:5151${data.photo}`);
      }
    } catch (error) {
      console.error("Error al cargar ingrediente", error);
    }
  };

  // =========================
  // 🧠 VALIDACIÓN FINAL ROBUSTA
  // =========================
  const validateForm = (): boolean => {
    // 🔤 nombre requerido
    if (!name.trim()) {
      setModalMessage("El nombre es requerido.");
      setShowModal(true);
      return false;
    }

    if (name.length > MAX_NAME_LENGTH) {
      setModalMessage(`El nombre permite máximo ${MAX_NAME_LENGTH} caracteres.`);
      setShowModal(true);
      return false;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name.trim())) {
      setModalMessage("El nombre solo debe contener letras.");
      setShowModal(true);
      return false;
    }

    // 🔢 precio requerido
    if (!price) {
      setModalMessage("El precio es requerido.");
      setShowModal(true);
      return false;
    }

    if (!/^\d+$/.test(price)) {
      setModalMessage("El precio debe ser numérico.");
      setShowModal(true);
      return false;
    }

    const priceNumber = Number(price);

    if (priceNumber <= 0) {
      setModalMessage("El precio debe ser mayor a 0.");
      setShowModal(true);
      return false;
    }

    if (priceNumber > MAX_PRICE) {
      setModalMessage(
        `El precio máximo permitido es ${MAX_PRICE.toLocaleString()}.`
      );
      setShowModal(true);
      return false;
    }

    // 🔢 stock requerido
    if (!stock) {
      setModalMessage("El stock es requerido.");
      setShowModal(true);
      return false;
    }

    if (!/^\d+$/.test(stock)) {
      setModalMessage("El stock debe ser numérico.");
      setShowModal(true);
      return false;
    }

    const stockNumber = Number(stock);

    if (stockNumber <= 0) {
      setModalMessage("El stock debe ser mayor a 0.");
      setShowModal(true);
      return false;
    }

    if (stockNumber > MAX_STOCK) {
      setModalMessage(
        `El stock máximo permitido es ${MAX_STOCK.toLocaleString()}.`
      );
      setShowModal(true);
      return false;
    }

    return true;
  };

  // =========================
  // 💾 GUARDAR
  // =========================
  const saveIngredient = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("Name", name.trim());
      formData.append("Price", price);
      formData.append("Stock", stock);
      formData.append("IdSuppliers", "1");

      if (photo) {
        formData.append("Photo", photo);
      }

      if (isEdit) {
        await ingredientService.update(Number(id), formData);
      } else {
        await ingredientService.create(formData);
      }

      navigate("/ingredients");
    } catch (error) {
      console.error("Error al guardar ingrediente", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit) {
      if (!validateForm()) return;
      setShowConfirmModal(true);
    } else {
      saveIngredient();
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
          <h1 className="text-2xl font-semibold">
            {isEdit ? "Editar ingrediente" : "Registrar ingrediente"}
          </h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="flex justify-center">
              <img
                src={preview}
                alt="preview"
                className="h-32 w-32 object-cover rounded-lg border border-border"
                onError={(e) => (e.currentTarget.src = placeholderImg)}
              />
            </div>

            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/30 border border-border"
              required
            />

            <input
              type="text"
              inputMode="numeric"
              placeholder="Precio"
              value={price}
              onKeyDown={blockInvalidNumberKeys}
              onPaste={handlePasteNumbers}
              onChange={(e) =>
                handleNumericChange(e.target.value, setPrice)
              }
              className="w-full p-3 rounded-lg bg-black/30 border border-border"
              required
            />

            <input
              type="text"
              inputMode="numeric"
              placeholder="Stock"
              value={stock}
              onKeyDown={blockInvalidNumberKeys}
              onPaste={handlePasteNumbers}
              onChange={(e) =>
                handleNumericChange(e.target.value, setStock)
              }
              className="w-full p-3 rounded-lg bg-black/30 border border-border"
              required
            />

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handlePhotoChange}
              className="w-full p-2"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/ingredients")}
                className="w-full rounded-lg border border-border py-3"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary py-3 font-semibold"
              >
                {loading
                  ? "Guardando..."
                  : isEdit
                  ? "Actualizar"
                  : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Modal aviso */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-black border border-border rounded-2xl p-6 w-[400px]">
            <h2 className="text-xl font-semibold mb-3">Aviso</h2>
            <p className="text-muted-foreground mb-6">{modalMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-primary rounded-lg font-semibold"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-black border border-border rounded-2xl p-6 w-[400px]">
            <h2 className="text-xl font-semibold mb-3">
              Actualizar ingrediente
            </h2>

            <p className="text-muted-foreground mb-6">
              ¿Deseas actualizar este ingrediente?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-border rounded-lg"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  saveIngredient();
                }}
                className="px-4 py-2 bg-primary rounded-lg font-semibold"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      </div>
    </div>
  );
};

export default IngredientFormPage;