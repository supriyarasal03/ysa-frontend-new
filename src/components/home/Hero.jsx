
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    const el = document.getElementById(id);

    if (el) {
      const yOffset = -70;
      const y =
        el.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="home"
      className="
        relative
        min-h-[600px]
        h-[calc(100svh-60px)]
        md:min-h-[650px]
        md:h-screen
        flex items-center justify-center
        overflow-hidden
        px-4
      "
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&q=80"
          alt="Sports background"
          className="w-full h-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-slate-900/70" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto text-center py-12 sm:py-16">

        {/* Running Icon */}
        <div
          className="
            mx-auto mb-5 sm:mb-6
            w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28
            rounded-full
            bg-white/15 backdrop-blur-md
            border-2 border-white/40
            flex items-center justify-center
            shadow-2xl
          "
        >
          <i className="fas fa-running text-white text-3xl sm:text-4xl md:text-5xl" />
        </div>

        {/* Heading */}
        <h1
          className="
            text-4xl sm:text-5xl md:text-6xl lg:text-7xl
            font-extrabold text-white
            leading-tight
            mb-4
            break-words
          "
        >
          Yashashree
          <br />

          <span
            className="
              text-transparent bg-clip-text
              bg-gradient-to-r from-orange-400 to-yellow-300
            "
          >
            Sports Academy
          </span>
        </h1>

        {/* Description */}
        <p
          className="
            text-sm sm:text-lg md:text-xl
            text-white/90 font-medium
            mb-7 sm:mb-8
            max-w-2xl mx-auto
            px-2
          "
        >
          Building Young Athletes Through Structured Training
        </p>

        {/* Buttons */}
        <div
          className="
            flex flex-col sm:flex-row
            items-stretch sm:items-center
            justify-center
            gap-3 sm:gap-4
            w-full sm:w-auto
            max-w-xs sm:max-w-none
            mx-auto
          "
        >
          <button
            type="button"
            onClick={() => scrollTo("sports")}
            className="
              w-full sm:w-auto
              px-6 sm:px-8 py-3
              text-sm sm:text-base
              font-semibold text-white
              bg-gradient-to-r from-orange-500 to-orange-400
              rounded-full shadow-lg
              hover:shadow-xl hover:scale-105
              transition-all
            "
          >
            View Sports Programs
          </button>

          <button
            type="button"
            onClick={() => scrollTo("contact")}
            className="
              w-full sm:w-auto
              px-6 sm:px-8 py-3
              text-sm sm:text-base
              font-semibold text-white
              border-2 border-white/80
              rounded-full
              hover:bg-white hover:text-blue-800
              transition-all
            "
          >
            Book Free Trial
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className="
          absolute bottom-4 sm:bottom-8
          left-1/2 -translate-x-1/2
          animate-bounce
        "
      >
        <i className="fas fa-chevron-down text-white/80 text-xl sm:text-2xl" />
      </div>
    </section>
  );
};

export default Hero;