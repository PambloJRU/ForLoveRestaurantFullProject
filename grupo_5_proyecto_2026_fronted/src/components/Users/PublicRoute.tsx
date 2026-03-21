import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

export const PublicRoute = ({ children }: Props) => {
  const user = sessionStorage.getItem("user");

  if (user) {
    const parsed = JSON.parse(user);

    switch (parsed.role) {
      case "Administrador":
      case "Cocinero":
      case "Mesero":
        return <Navigate to="/" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};
