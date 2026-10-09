
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const location = useLocation();
  const isHome = location.pathname === "/";

  const scrollTo = (id) => {
    setMobileOpen(false);
    setActiveSection(id);

    if (isHome) {
      const el = document.getElementById(id);

      if (el) {
        const yOffset = -80;
        const y =
          el.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;

        window.scrollTo({
          top: y,
          behavior: "smooth",
        });
      }
    } else {
      window.location.href = `/#${id}`;
    }
  };

  useEffect(() => {
    if (!isHome) return;

    const sections = [
      "home",
      "about",
      "sports",
      "gallery",
      "contact",
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);

        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // Prevent background page scrolling while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close menu after route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const getLinkClass = (id) => {
    return activeSection === id
      ? "px-4 py-1.5 text-sm font-semibold text-blue-800 bg-white rounded-full shadow-sm"
      : "px-4 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-800";
  };

  const mobileLinkClass = (id) =>
    `block w-full px-4 py-3 rounded-lg text-left text-base font-medium transition-colors ${
      activeSection === id
        ? "bg-blue-50 text-blue-800"
        : "text-gray-700 hover:bg-blue-50 hover:text-blue-800"
    }`;

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-[100] bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 sm:gap-3 shrink-0"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-blue-800 to-cyan-500 flex items-center justify-center shadow-lg">
                <i className="fas fa-running text-white text-xl" />
              </div>

              <div>
                <h1 className="text-base sm:text-lg font-bold text-blue-800 leading-tight">
                  Yashashree
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 tracking-wide">
                  Sports Academy
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 bg-gray-100/80 rounded-full px-2 py-1.5">
              <button onClick={() => scrollTo("home")} className={getLinkClass("home")}>
                Home
              </button>

              <button onClick={() => scrollTo("about")} className={getLinkClass("about")}>
                About
              </button>

              <div className="relative group">
                <button
                  onClick={() => scrollTo("sports")}
                  className={`${getLinkClass("sports")} flex items-center gap-1`}
                >
                  Sports We Offer
                  <i className="fas fa-chevron-down text-xs" />
                </button>

                <div className="absolute top-full left-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {[
                    "Cricket",
                    "Table Tennis",
                    "Football",
                    "Badminton",
                    "Basketball",
                    "Athletics",
                  ].map((sport) => (
                    <button
                      key={sport}
                      onClick={() => scrollTo("sports")}
                      className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800"
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => scrollTo("gallery")} className={getLinkClass("gallery")}>
                Gallery
              </button>

              <button onClick={() => scrollTo("contact")} className={getLinkClass("contact")}>
                Contact Us
              </button>
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2 text-sm font-semibold text-blue-800 border-2 border-blue-800 rounded-full hover:bg-blue-800 hover:text-white transition-all"
              >
                Login
              </Link>

              <button
                onClick={() => scrollTo("contact")}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-400 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Book Free Trial
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-lg text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <i className={`fas ${mobileOpen ? "fa-times" : "fa-bars"} text-2xl`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[200] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          {/* Dark backdrop */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 w-full h-full bg-black/50"
          />

          {/* Full-height menu panel */}
          <div className="absolute top-0 right-0 h-[100dvh] w-[min(85vw,360px)] bg-white text-gray-800 shadow-2xl flex flex-col overflow-y-auto">
            {/* Menu Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-800 to-cyan-500 flex items-center justify-center">
                  <i className="fas fa-running text-white" />
                </div>
                <span className="font-bold text-lg text-blue-800">
                  Menu
                </span>
              </div>

              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <i className="fas fa-times text-xl" />
              </button>
            </div>

            {/* Mobile Links */}
            <nav className="flex flex-col gap-2 p-5">
              <button onClick={() => scrollTo("home")} className={mobileLinkClass("home")}>
                Home
              </button>

              <button onClick={() => scrollTo("about")} className={mobileLinkClass("about")}>
                About
              </button>

              <button onClick={() => scrollTo("sports")} className={mobileLinkClass("sports")}>
                Sports We Offer
              </button>

              <button onClick={() => scrollTo("gallery")} className={mobileLinkClass("gallery")}>
                Gallery
              </button>

              <button onClick={() => scrollTo("contact")} className={mobileLinkClass("contact")}>
                Contact Us
              </button>

              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-5 py-3 text-base font-semibold text-blue-800 border-2 border-blue-800 rounded-full hover:bg-blue-50"
                >
                  Login
                </Link>

                <button
                  type="button"
                  onClick={() => scrollTo("contact")}
                  className="w-full text-center px-5 py-3 text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-400 rounded-full shadow-md"
                >
                  Book Free Trial
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;