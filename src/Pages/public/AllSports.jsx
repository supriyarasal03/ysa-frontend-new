import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import LandingPageSportService
  from "../../services/LandingPageSportService";


// =========================================================
// IMAGE URL HELPER
// =========================================================

const getImageUrl = (imageUrl) => {

  if (!imageUrl) {
    return "";
  }

  // Already a complete URL
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  // Get file name from:
  // landing-page/sports/filename.jpg
  const fileName = imageUrl.split("/").pop();

  // Backend endpoint for serving sports images
  return `/api/landing-page/sports/image/${fileName}`;
};


const AllSports = () => {

  const navigate = useNavigate();

  const [sports, setSports] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =========================================================
  // FETCH SPORTS
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
          "Error loading sports:",
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
  // RENDER
  // =========================================================

  return (

    <>

      <Navbar />


      <div className="pt-28 pb-20 bg-gray-50 min-h-screen">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


          {/* =================================================
              HEADER
          ================================================= */}

          <div className="text-center mb-14">

            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">

              All{" "}

              <span className="text-blue-800">
                Sports
              </span>

            </h1>


            <p className="text-gray-600 max-w-2xl mx-auto text-lg">

              Explore all the sports programs we offer
              at Yashashree Sports Academy

            </p>

          </div>


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div className="text-center py-16">

              <div className="inline-flex items-center gap-3 text-gray-500">

                <i className="fas fa-spinner fa-spin" />

                Loading sports...

              </div>

            </div>

          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {!loading && error && (

            <div className="text-center py-16">

              <p className="text-red-500">
                {error}
              </p>

            </div>

          )}


          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            !error &&
            sports.length === 0 && (

              <div className="text-center py-16">

                <div className="text-gray-400 mb-3">

                  <i className="fas fa-running text-5xl" />

                </div>


                <h3 className="text-xl font-semibold text-gray-700">

                  No sports available

                </h3>


                <p className="text-gray-500 mt-2">

                  Sports will appear here when they are
                  added by the academy.

                </p>

              </div>

            )}


          {/* =================================================
              SPORTS GRID
          ================================================= */}

          {!loading &&
            !error &&
            sports.length > 0 && (

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

                {sports.map((sport) => (

                  <div
                    key={sport.id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
                  >


                    {/* =================================================
                        IMAGE
                    ================================================= */}

                    <div className="h-52 overflow-hidden">

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

                    </div>


                    {/* =================================================
                        CONTENT
                    ================================================= */}

                    <div className="p-6">


                      {/* TITLE */}

                      <div className="flex items-center gap-2.5 mb-3">

                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">

                          <i
                            className={`fas ${
                              sport.icon ||
                              "fa-running"
                            } text-blue-800`}
                          />

                        </div>


                        <h3 className="text-xl font-bold text-slate-900">

                          {sport.name}

                        </h3>

                      </div>


                      {/* LOCATION */}

                      <p className="text-sm text-gray-500 mb-3 flex items-start gap-1.5">

                        <i className="fas fa-map-marker-alt text-orange-500 mt-0.5" />

                        <span>
                          {sport.location}
                        </span>

                      </p>


                      {/* TAG */}

                      {sport.tag && (

                        <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full mb-5">

                          {sport.tag}

                        </span>

                      )}


                      {/* BUTTONS */}

                      <div className="flex gap-3">

                        <button
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

            )}


          {/* =================================================
              BACK BUTTON
          ================================================= */}

          <div className="text-center mt-14">

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-blue-800 font-medium hover:underline"
            >

              <i className="fas fa-arrow-left" />

              Back to Home

            </Link>

          </div>

        </div>

      </div>


      <Footer />

    </>

  );

};


export default AllSports;