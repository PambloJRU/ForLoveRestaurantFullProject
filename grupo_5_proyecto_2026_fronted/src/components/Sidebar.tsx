import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/images/logo.png";

const NAV_ITEMS = [
  { name: "Mesas", href: "/tables", roles: ["Administrador", "Mesero"] },
  { name: "Ingredientes", href: "/ingredients", roles: ["Administrador", "Mesero", "Cocinero"] },
  { name: "Platillos", href: "/menuitems", roles: ["Administrador", "Mesero", "Cocinero"] },
  { name: "Órdenes", href: "/orders", roles: ["Administrador", "Mesero"] },
  { name: "Empleados", href: "/employees", roles: ["Administrador"] },
  { name: "Usuarios", href: "/users", roles: ["Administrador"] },
  { name: "Proveedores", href: "/suppliers", roles: ["Administrador"] },
  { name: "Pagos", href: "/payments", roles: ["Administrador"] },
];

interface StoredUser {
  id: string;
  name: string;
  role: "Administrador" | "Mesero" | "Cocinero";
  permissions?: string[];
}

/** ✅ NUEVO: props del Sidebar */
interface SidebarProps {
  onToggle?: (hidden: boolean) => void;
}

const Sidebar = ({ onToggle }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /* Obtener sesión */
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, [location.pathname]);

  /* 🔥 NUEVO: notificar estado inicial */
  useEffect(() => {
    onToggle?.(isCollapsed);
  }, [isCollapsed, onToggle]);

  /* Filtrar navegación */
  const getVisibleNavItems = () => {
    if (!user) return [];
    return NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  };

  /* Navegación */
  const handleNavigation = (href: string) => {
    setIsMobileOpen(false);

    if (href.startsWith("/")) {
      navigate(href);
      return;
    }

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return;
    }

    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  /* Logout */
  const confirmLogout = () => {
    sessionStorage.clear();
    setUser(null);
    setShowLogoutModal(false);
    navigate("/");
  };

  /** ✅ toggle desktop sidebar */
  const handleCollapseToggle = () => {
    const newValue = !isCollapsed;
    setIsCollapsed(newValue);
    onToggle?.(newValue);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-background border rounded-md shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-background border-r shadow-lg transition-all duration-300 z-40 hidden md:flex flex-col ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo y toggle */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <img
              src={Logo}
              width={150}
              className="cursor-pointer"
              onClick={() => navigate("/")}
            />
          )}

          <button
            onClick={handleCollapseToggle}
            className="p-2 hover:bg-muted rounded-md transition"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {user ? (
            <div className="space-y-2">
              {getVisibleNavItems().map(({ name, href }) => (
                <button
                  key={name}
                  onClick={() => handleNavigation(href)}
                  className={`w-full text-left px-4 py-3 rounded-md transition hover:bg-muted ${
                    location.pathname === href
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  }`}
                  title={isCollapsed ? name : undefined}
                >
                  {isCollapsed ? name.charAt(0) : name}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-sm">
              {!isCollapsed && "Inicia sesión para ver el menú"}
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold"
            >
              {isCollapsed ? "Login" : "Iniciar sesión"}
            </button>
          ) : (
            <>
              {!isCollapsed && (
                <div className="flex items-center gap-2 px-4 py-2 border rounded-md bg-muted text-sm mb-2">
                  <User className="w-4 h-4" />
                  <div className="truncate">
                    <div className="font-medium truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.role}</div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border rounded-md hover:bg-destructive hover:text-destructive-foreground transition"
                title={isCollapsed ? "Cerrar sesión" : undefined}
              >
                <LogOut className="w-4 h-4" />
                {!isCollapsed && "Cerrar sesión"}
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <aside className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
          <div className="fixed left-0 top-0 h-screen w-64 bg-background shadow-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <img
                src={Logo}
                width={150}
                className="cursor-pointer"
                onClick={() => {
                  navigate("/");
                  setIsMobileOpen(false);
                }}
              />
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              {user ? (
                <div className="space-y-2">
                  {getVisibleNavItems().map(({ name, href }) => (
                    <button
                      key={name}
                      onClick={() => handleNavigation(href)}
                      className={`w-full text-left px-4 py-3 rounded-md transition hover:bg-muted ${
                        location.pathname === href
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-sm">
                  Inicia sesión para ver el menú
                </div>
              )}
            </nav>

            <div className="border-t p-4">
              {!user ? (
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsMobileOpen(false);
                  }}
                  className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold"
                >
                  Iniciar sesión
                </button>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-md bg-muted text-sm mb-2">
                    <User className="w-4 h-4" />
                    <div className="truncate">
                      <div className="font-medium truncate">{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.role}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border rounded-md hover:bg-destructive hover:text-destructive-foreground transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Modal logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-background border border-border p-6 text-center">
            <h2 className="text-xl font-semibold">Cerrar sesión</h2>

            <p className="mt-3 text-muted-foreground">
              ¿Estás seguro de que deseas cerrar sesión?
            </p>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-lg border py-2 font-semibold hover:bg-muted"
              >
                Cancelar
              </button>

              <button
                onClick={confirmLogout}
                className="flex-1 rounded-lg bg-destructive text-destructive-foreground py-2 font-semibold"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;