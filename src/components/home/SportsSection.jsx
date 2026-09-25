import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import LandingPageSportService
  from "../../services/LandingPageSportService";

// =========================================================
// IMAGE URL HELPER
// =========================================================

const getImageUrl = (imageUrl) => {

  if (!imageUrl) {
    return "";
  }

  // If backend already returns complete URL
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  // Get only the file name from:
  // landing-page/sports/filename.jpg
  const fileName = imageUrl.split("/").pop();

  // Backend endpoint for serving sports images
  return `/api/landing-page/sports/image/${fileName}`;
};


const SportsSection = () => {

  const sliderRef = useRef(null);

  const navigate = useNavigate();

  const [sports, setSports] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =========================================================
  // GET LANDING PAGE SPORTS
  // =========================================================

  useEffect(() => {

    const fetchSports = async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await LandingPageSportService.getAll();

        if (response?.success) {

          setSports(
            response.data || []
          );

        } else {

          setSports([]);

        }

      } catch (err) {

        console.error(
          "Error loading landing page sports:",
          err
        );

        setError(
          "Unable to load sports."
        );

      } finally {

        setLoading(false);

      }

    };

    fetchSports();

  }, []);


  // =========================================================
  // SLIDER
  // =========================================================

  const scroll = (direction) => {

    if (sliderRef.current) {

      const scrollAmount = 340;

      sliderRef.current.scrollBy({

        left:
          direction === "left"
            ? -scrollAmount
            : scrollAmount,

        behavior: "smooth",

      });

    }

  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <section
        id="sports"
        className="py-20 md:py-28 bg-gray-50"
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center">

            <div className="inline-flex items-center gap-3 text-gray-500">

              <i className="fas fa-spinner fa-spin" />

              Loading sports...

            </div>

          </div>

        </div>

      </section>

    );

  }


  // =========================================================
  // ERROR / EMPTY
  // =========================================================

  if (error || sports.length === 0) {

    return (

      <section
        id="sports"
        className="py-20 md:py-28 bg-gray-50"
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">

              Sports{" "}

              <span className="text-blue-800">
                We Offer
              </span>

            </h2>

            <p className="text-gray-600 max-w-2xl mx-auto text-lg">

              Professional coaching programs designed
              for every age and skill level

            </p>

          </div>

          <div className="text-center text-gray-500">

            {error ||
              "No sports are currently available."}

          </div>

        </div>

      </section>

    );

  }


  // =========================================================
  // MAIN UI
  // =========================================================

  return (

    <section
      id="sports"
      className="py-20 md:py-28 bg-gray-50"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="text-center mb-12">

          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">

            Sports{" "}

            <span className="text-blue-800">
              We Offer
            </span>

          </h2>

          <p className="text-gray-600 max-w-2xl mx-auto text-lg">

            Professional coaching programs designed
            for every age and skill level

          </p>

        </div>


        {/* =====================================================
            SLIDER
        ===================================================== */}

        <div className="relative">


          {/* ===================================================
              LEFT BUTTON
          =================================================== */}

          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-11 h-11 bg-white rounded-full shadow-lg border border-gray-200 items-center justify-center hover:bg-blue-50 transition-all hidden md:flex"
            aria-label="Previous sports"
          >

            <i className="fas fa-chevron-left text-blue-800" />

          </button>


          {/* ===================================================
              RIGHT BUTTON
          =================================================== */}

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-11 h-11 bg-white rounded-full shadow-lg border border-gray-200 items-center justify-center hover:bg-blue-50 transition-all hidden md:flex"
            aria-label="Next sports"
          >

            <i className="fas fa-chevron-right text-blue-800" />

          </button>


          {/* ===================================================
              CARDS TRACK
          =================================================== */}

          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-6 px-2 scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >

            {sports.map((sport) => (

              <div
                key={sport.id}
                className="group min-w-[300px] sm:min-w-[320px] bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:-translate-y-3 hover:shadow-2xl transition-all duration-300 flex-shrink-0 cursor-pointer"
              >


                {/* =================================================
                    IMAGE
                ================================================= */}

                <div className="h-48 overflow-hidden relative">

                  <img
                    src={getImageUrl(
                      sport.imageUrl
                    )}
                    alt={sport.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"

                    onError={(event) => {

                      console.error(
                        "Sport image failed:",
                        getImageUrl(
                          sport.imageUrl
                        )
                      );

                      event.currentTarget.src =
                        "https://via.placeholder.com/800x500?text=Sport";

                    }}
                  />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                </div>


                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="p-5">


                  {/* =================================================
                      TITLE
                  ================================================= */}

                  <div className="flex items-center gap-2.5 mb-2">

                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition">

                      <i
                        className={`fas ${
                          sport.icon ||
                          "fa-running"
                        } text-blue-800 text-sm`}
                      />

                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-800 transition">

                      {sport.name}

                    </h3>

                  </div>


                  {/* =================================================
                      LOCATION
                  ================================================= */}

                  <p className="text-sm text-gray-500 mb-3 flex items-start gap-1.5">

                    <i className="fas fa-map-marker-alt text-orange-500 mt-0.5" />

                    <span>
                      {sport.location}
                    </span>

                  </p>


                  {/* =================================================
                      TAG
                  ================================================= */}

                  {sport.tag && (

                    <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full mb-4">

                      {sport.tag}

                    </span>

                  )}


                  {/* =================================================
                      ENROLL BUTTON
                  ================================================= */}

                  <div className="flex gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/player-enquiry", {
                          state: {
                            sportId: sport.sportId,
                            sportName: sport.name,
                          },
                        })
                      }
                      className="w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-700 to-blue-500 rounded-full hover:shadow-lg transition-all"
                    >

                      Enroll Now

                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* =====================================================
            VIEW ALL SPORTS
        ===================================================== */}

        <div className="text-center mt-12">

          <button
            onClick={() => navigate("/sports")}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-700 to-blue-500 text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all"
          >

            View All Sports

            <i className="fas fa-arrow-right text-sm" />

          </button>

        </div>

      </div>


      {/* =====================================================
          HIDE SCROLLBAR
      ===================================================== */}

      <style>{`

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

      `}</style>

    </section>

  );

};


export default SportsSection;