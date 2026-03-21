import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
  allowedRoles: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const user = sessionStorage.getItem("user");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const parsed = JSON.parse(user);

  if (!allowedRoles.includes(parsed.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
