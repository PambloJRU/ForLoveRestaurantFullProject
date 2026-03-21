import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import { Facebook, Instagram, Youtube } from "lucide-react";

type SocialLink = {
  name: string;
  icon: React.ElementType;
  href: string;
};

type QuickLink = {
  name: string;
  href: string; // puede ser "#home" o "/menuitems"
};

const SOCIAL_LINKS: SocialLink[] = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com" },
];

const QUICK_LINKS: QuickLink[] = [
  { name: "Inicio", href: "/" },
  { name: "Acerca de", href: "#about" },
  { name: "Platillos", href: "/menuitems" },
  { name: "Mesas", href: "/tables" },
];

const CONTACT_INFO = {
  address: ["Four Love Restaurant", "Guácimo, Limon, Costa Rica"],
  phone: "(+506) 8353-7920",
  email: "reservas@fourlove.com",
};

const HOURS = [
  { days: "Lun-Sab", time: "7:00 AM - 7:00 PM" },
  { days: "Domingo", time: "Cerrado" },
];

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const goTo = (href: string) => {
    // 1) Secciones con ancla: #about, #chefs, etc.
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // 2) Rutas internas: /menuitems, /tables...
    if (href.startsWith("/")) {
      navigate(href);
      return;
    }

    // 3) Links externos (por si agregás alguno)
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="bg-muted/50 border-t mt-12 md:mt-20">
      <div className="container-width py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Marca */}
          <div className="space-y-4">
            <div className="flex-shrink-0">
              <img src={Logo} width={200} height={200} className="p-2" alt="Four Love" />
            </div>

            <p className="text-muted-foreground leading-relaxed">
              Un lugar donde cada platillo refleja pasión, creatividad y buen sabor.
            </p>

            <div className="flex space-x-4">
              {SOCIAL_LINKS.map(({ name, icon: Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Enlaces */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Enlaces rápidos</h4>
            <ul className="space-y-2">
              {QUICK_LINKS.map(({ name, href }) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => goTo(href)}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-left"
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Contacto</h4>
            <div className="space-y-2 text-muted-foreground">
              {CONTACT_INFO.address.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
              <p>{CONTACT_INFO.phone}</p>
              <p>{CONTACT_INFO.email}</p>
            </div>
          </div>

          {/* Horarios */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Horario</h4>
            <div className="space-y-2 text-muted-foreground">
              {HOURS.map(({ days, time }) => (
                <div key={days} className="flex justify-between gap-4">
                  <span className="whitespace-nowrap">{days}:</span>
                  <span className="text-right">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © {currentYear} Four Love Restaurant. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
