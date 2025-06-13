"use client";
import Loader from "@/components/loader";
import { AuthType } from "@/lib/api";
import { authCookies } from "@/lib/utils/cookies";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authenticateUser, AuthMode } from "./tools";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setError("");
    setFormData({ username: "", email: "", password: "", confirmPassword: "" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (mode === "register" && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const authData =
      mode === "register"
        ? {
            username: formData.username,
            password: formData.password,
            email: formData.email, // Use the provided email
          }
        : {
            username: formData.username,
            password: formData.password,
            email: undefined,
          };

    const authMode = mode === "login" ? AuthType.Login : AuthType.Register;
    const res = await authenticateUser(authMode, authData);
    setLoading(false);
    if (res.success && res.user) {
      // Save user data in cookies
      authCookies.setToken(res.user.token);
      // Redirect to home page
      router.push("/");
    } else setError(res.message || "Authentication failed");
  };

  const updateForm = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="absolute top-0 w-full h-1/2 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),rgba(255,255,255,0))]" />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <div className="relative">
          {/* Glass Card */}
          <div className="backdrop-blur-xl bg-white/10 p-8 rounded-2xl shadow-2xl border border-white/20">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <div className="mb-4 relative w-20 h-20 mx-auto">
                <Image
                  src="/svgs/microscope.svg"
                  alt="CrohnScope Logo"
                  fill
                  className="drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                />
              </div>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={mode}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                >
                  {mode === "login" ? "Welcome Back" : "Create Account"}
                </motion.h2>
              </AnimatePresence>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-2 rounded-lg mb-6 text-sm">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => updateForm("username", e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-gray-400 transition-colors"
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <AnimatePresence>
                  {mode === "register" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateForm("email", e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-gray-400 transition-colors"
                          placeholder="Enter your email address"
                          required={mode === "register"}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-gray-400 transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <AnimatePresence>
                  {mode === "register" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            updateForm("confirmPassword", e.target.value)
                          }
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-gray-400 transition-colors"
                          placeholder="Confirm your password"
                          required={mode === "register"}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg font-medium transition-all duration-200 ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="scale-50 mr-2">
                        <Loader className="!h-auto !w-auto" />
                      </div>
                      <span className="ml-2">
                        {mode === "login"
                          ? "Signing in..."
                          : "Creating account..."}
                      </span>
                    </div>
                  ) : mode === "login" ? (
                    "Sign in"
                  ) : (
                    "Create account"
                  )}
                </motion.button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {mode === "login"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </form>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-3xl" />
        </div>
      </motion.div>
    </div>
  );
}
