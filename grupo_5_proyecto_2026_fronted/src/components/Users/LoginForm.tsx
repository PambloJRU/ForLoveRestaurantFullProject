import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface LoginData {
  name: string;
  password: string;
}

interface Props {
  onSubmit: (data: LoginData) => void;
  isSubmitting?: boolean;
  errorMessage?: string;
}

// helpers
const isOnlyDigits = (v: string) => /^\d+$/.test(v);
const isValidNickname = (v: string) => /^[a-zA-Z0-9_]{3,20}$/.test(v);

const LoginForm = ({ onSubmit, isSubmitting = false, errorMessage }: Props) => {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginData>({
    name: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // 🔄 Si hay error → limpiar solo la contraseña
  useEffect(() => {
    if (errorMessage) {
      setForm((p) => ({
        ...p,
        password: "",
      }));
      setShowPassword(false);
    }
  }, [errorMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((p) => ({
      ...p,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const id = form.name.trim();

    if (!id) {
      alert("La identificación o usuario es requerido.");
      return;
    }

    // 📄 Cédula
    if (isOnlyDigits(id)) {
      if (id.length !== 9) {
        alert("La cédula debe tener exactamente 9 dígitos.");
        return;
      }
    }
    // 👤 Nickname
    else {
      if (!isValidNickname(id)) {
        alert(
          "El usuario debe tener entre 3 y 20 caracteres y solo letras, números o _"
        );
        return;
      }
    }

    if (!form.password.trim()) {
      alert("La contraseña es requerida.");
      return;
    }

    onSubmit({
      name: id,
      password: form.password,
    });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 pt-24 pb-10">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-black/40 backdrop-blur-md shadow-2xl p-8 md:p-10">

        {/* 🔄 Overlay de carga */}
        {isSubmitting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-2xl z-10">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-playfair font-semibold text-foreground">
          Iniciar sesión
        </h1>

        <p className="text-muted-foreground mt-2">
          Ingresa tu cédula o nombre de usuario.
        </p>

        {/* ❌ Error visible */}
        {errorMessage && (
          <div className="mt-4 rounded-lg bg-destructive/15 text-destructive px-4 py-2 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">

          {/* Usuario */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Usuario
            </label>
            <input
              name="name"
              placeholder="Nombre"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="username"
              className="w-full rounded-lg border border-border bg-black/30 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Puedes usar tu cédula (9 dígitos) o tu nombre de usuario.
            </p>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Contraseña
            </label>

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-border bg-black/30 px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-60"
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>



        </form>
      </div>
    </div>
  );
};

export default LoginForm;