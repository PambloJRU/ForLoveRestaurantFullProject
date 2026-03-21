import { Button } from "@/components/ui/button";
import HeroBG from "./../assets/images/hero-bg.webp";

// Configurable constants for background image and section targets
const MENU_SECTION_ID = "#";
const CONTACT_SECTION_ID = "#";

const Hero = () => {
  // Smooth scroll to a target section
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
 
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url(${HeroBG})`,
      }}
    >
      {/* Overlay gradient for improved text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>

      {/* Content Container */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          data-aos="fade-up"
          data-aos-delay="100"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair font-bold text-white mb-6 leading-tight"
        >
          Bienvenido a <span className="text-primary">Four Love Restaurant</span>
        </h1>

        <p
          data-aos="fade-up"
          data-aos-delay="500"
          className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          Cocinar es un arte
        </p>
      </div>

      {/* Scroll indicator to encourage downward navigation */}

    </section>
  );
};

export default Hero;
