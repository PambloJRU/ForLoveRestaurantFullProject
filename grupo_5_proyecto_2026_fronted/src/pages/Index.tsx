import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

import Hero from "@/components/Hero";
import Announcements from "@/components/Announcements";


const SECTIONS = [
  { id: "hero", Component: Hero },
  { id: "Announcements", Component: Announcements },

];

const HomePage = () => {
  const [sidebarHidden, setSidebarHidden] = useState(false);

  const handleSidebarToggle = (hidden: boolean) => {
    setSidebarHidden(hidden);
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar onToggle={handleSidebarToggle} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarHidden ? "md:ml-0" : "md:ml-64"
      }`}>
        {SECTIONS.map(({ id, Component }) => (
          <section key={id} id={id}>
            <Component />
          </section>
        ))}

        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
