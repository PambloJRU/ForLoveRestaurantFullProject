import { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/images/logo.png";


const NAV_ITEMS = [
  
  {
    name: "Mesas",
    href: "/tables",
    roles: ["Administrador", "Mesero"],
  },
  {
    name: "Ingredientes",
    href: "/ingredients",
    roles: ["Administrador", "Mesero", "Cocinero"],
  },

   {
    name: "Platillos",
    href: "/menuitems",
    roles: ["Administrador", "Mesero", "Cocinero"], // o solo Admin si querés
  },

  {
  name: "Órdenes",
  href: "/orders",
  roles: ["Administrador", "Mesero"],
},
  
  {
    name: "Empleados",
    href: "/employees",
    roles: ["Administrador"],
  },
  {
    name: "Usuarios",
    href: "/users",
    roles: ["Administrador"],
  },
  {
    name: "Proveedores",
    href: "/suppliers",
    roles: ["Administrador"],
  },
  {
    name: "Pagos",
    href:"/payments",
    roles:["Administrador"]
  }
];


interface StoredUser {
  id: string;
  name: string;
  role: "Administrador" | "Mesero" | "Cocinero";
  permissions?: string[];
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* 🔑 Obtener sesión desde sessionStorage */
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, [location.pathname]);

  /* 🎯 Filtrar navegación según rol */
  const getVisibleNavItems = () => {
    if (!user) return [];
    return NAV_ITEMS.filter(item =>
      item.roles.includes(user.role)
    );
  };

  /* 🚦 Navegación */
  const handleNavigation = (href: string) => {
    setIsMenuOpen(false);

    if (href.startsWith("/")) {
      navigate(href);
      return;
    }

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document
          .querySelector(href)
          ?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return;
    }

    document
      .querySelector(href)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  /* 🚪 Cerrar sesión */
  const confirmLogout = () => {
    sessionStorage.clear();
    setUser(null);
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        hasScrolled
          ? "bg-background/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <nav className="container-width">
        <div className="flex items-center justify-between h-16 md:h-20">
          <img
            src={Logo}
            width={200}
            className="p-2 cursor-pointer"
            onClick={() => navigate("/")}
          />

          {/* 🖥️ Desktop */}
          <div className="hidden md:flex items-center flex-1 justify-end gap-8">
            {user && (
              <div className="flex space-x-8">
                {getVisibleNavItems().map(({ name, href }) => (
                  <button
                    key={name}
                    onClick={() => handleNavigation(href)}
                    className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              {!user ? (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold"
                >
                  Iniciar sesión
                </button>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-md bg-muted text-sm select-none">
                    <User className="w-4 h-4" />
                    {user.name} / {user.role}
                  </div>

                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md hover:bg-destructive hover:text-destructive-foreground transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 📱 Mobile button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* 📱 Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 p-3 bg-background rounded-lg space-y-2">
            {user &&
              getVisibleNavItems().map(({ name, href }) => (
                <button
                  key={name}
                  onClick={() => handleNavigation(href)}
                  className="block w-full text-left px-3 py-2"
                >
                  {name}
                </button>
              ))}

            {!user ? (
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-primary text-primary-foreground px-3 py-2 rounded-md"
              >
                Iniciar sesión
              </button>
            ) : (
              <>
                <div className="px-3 py-2 border rounded-md bg-muted text-sm">
                  {user.name} / {user.role}
                </div>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 border rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* 🧩 Modal cerrar sesión */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-background border border-border p-6 text-center">
            <h2 className="text-xl font-semibold">
              Cerrar sesión
            </h2>

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
    </header>
  );
};

export default Header;
