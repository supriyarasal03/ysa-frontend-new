import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";

const Login = () => {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!loginData.username.trim()) {
      setError("Username is required");
      return;
    }
    if (!loginData.password) {
      setError("Password is required");
      return;
    }

    setLoading(true);

    try {
      const response = await login(loginData);

      if (response.success && response.data) {
        const { token, role } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        if (role === "ADMIN") navigate("/admin");

        else if (role === "COACH") navigate("/coach/player-attendance");

        else if (role === "RECEPTIONIST") navigate("/receptionist/players");

        else if (role === "INVENTORY_MANAGER") navigate("/inventory");
        else if (role === "CLEANING_STAFF") navigate("cleaningStaff");
        else if (role === "PLAYER") navigate("/player/attendance");
        else if (role === "PARENT") navigate("/parent");
        else setError("Unknown role received");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ================= LEFT SIDE - BRANDING ================= */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1920')] bg-cover bg-center"></div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/85 to-indigo-900/90"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center px-12 text-white w-full">

          {/* Logo */}
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border border-white/20">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold mb-2">
            Yashashree
          </h1>
          <h2 className="text-3xl xl:text-4xl font-bold text-orange-400 mb-6">
            Sports Academy
          </h2>

          <p className="text-lg text-blue-100 max-w-md leading-relaxed">
            Building Young Athletes Through Structured Coaching
          </p>

          {/* Decorative dots */}
          <div className="flex gap-2 mt-10">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE - FORM ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile Logo (only visible on small screens) */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-900">Yashashree</h1>
            <p className="text-orange-500 font-semibold">Sports Academy</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-500 mt-1">Please login to your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-2">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/forgotPassword")}
                  className="text-sm font-medium text-blue-600 hover:text-orange-500 transition"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Back to Home */}
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate("/")}
                className="text-sm text-gray-500 hover:text-blue-600 transition"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;