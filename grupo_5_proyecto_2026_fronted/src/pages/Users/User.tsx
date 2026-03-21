import { useState } from "react";
import { useNavigate } from "react-router-dom";

import LoginForm from "../../components/Users/LoginForm";
import { authService } from "../../services/authService";
import { useToast } from "../../components/ui/use-toast";
import { getUserFromToken } from "../../utils/jwt";

interface LoginData {
  name: string;
  password: string;
}

const User = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const handleLogin = async (data: LoginData) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(undefined);

      const token = await authService.login(data);

      if (!token) {
        setErrorMessage("Usuario no existente o contraseña incorrecta.");
        return;
      }

      sessionStorage.setItem("token", token);

      const user = getUserFromToken(token);
      if (!user) {
        setErrorMessage("Sesión inválida. Intenta nuevamente.");
        return;
      }

      const role =
        user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      const name =
        user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];

      const id =
        user[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

      sessionStorage.setItem(
        "user",
        JSON.stringify({
          id,
          name,
          role,
        })
      );

      toast({
        title: "Sesión iniciada",
        description: `Bienvenido ${name}`,
      });

      setTimeout(() => {
        switch (role) {
          case "Administrador":
            navigate("/");
            break;
          case "Mesero":
            navigate("/");
            break;
          case "Cocinero":
            navigate("/");
            break;
          default:
            navigate("/");
        }
      }, 800);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.status === 204
          ? "Usuario no existente o contraseña incorrecta."
          : err?.response?.data?.message ??
              "Error al iniciar sesión. Intenta nuevamente."
      );

      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "No se pudo iniciar sesión",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
    />
  );
};

export default User;
