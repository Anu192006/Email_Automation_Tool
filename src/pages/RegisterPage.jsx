import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { Logo } from "../components/Logo";

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [validation, setValidation] = useState({
    email: true,
    password: true,
    passwordMatch: true,
    passwordLength: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validation
    if (name === "email") {
      setValidation((prev) => ({
        ...prev,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value === "",
      }));
    }

    if (name === "password") {
      setValidation((prev) => ({
        ...prev,
        passwordLength: value.length >= 8 || value === "",
        passwordMatch: formData.confirmPassword === "" || value === formData.confirmPassword,
      }));
    }

    if (name === "confirmPassword") {
      setValidation((prev) => ({
        ...prev,
        passwordMatch: value === formData.password,
      }));
    }
  };

  const isFormValid = () => {
    return (
      formData.email &&
      formData.password &&
      formData.password === formData.confirmPassword &&
      formData.password.length >= 8 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!isFormValid()) {
      setError("Please fix the validation errors above.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/api/auth/register", {
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim() || undefined,
      });

      if (response.data.success) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(response.data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Logo and header */}
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <Logo size="lg" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Create Account
              </h1>
              <p className="text-slate-600 mt-2 text-sm">
                Email Automation Platform
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p>{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field (optional) */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name (optional)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 hover:border-slate-400 transition-all duration-150 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 hover:border-slate-400 transition-all duration-150 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
                    validation.email
                      ? "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      : "border-red-500 focus:border-red-500 focus:ring-red-500"
                  }`}
                  placeholder="admin@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              {!validation.email && (
                <p className="text-xs text-red-600 mt-1">Invalid email format</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`w-full pl-10 pr-12 py-2.5 border rounded-lg text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 hover:border-slate-400 transition-all duration-150 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
                    validation.passwordLength
                      ? "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      : "border-red-500 focus:border-red-500 focus:ring-red-500"
                  }`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700 transition-colors"
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <Eye size={20} />
                  ) : (
                    <EyeOff size={20} />
                  )}
                </button>
              </div>
              {!validation.passwordLength && formData.password && (
                <p className="text-xs text-red-600 mt-1">Password must be at least 8 characters</p>
              )}
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className={`w-full pl-10 pr-12 py-2.5 border rounded-lg text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 hover:border-slate-400 transition-all duration-150 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
                    validation.passwordMatch
                      ? "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      : "border-red-500 focus:border-red-500 focus:ring-red-500"
                  }`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700 transition-colors"
                  tabIndex="-1"
                >
                  {showConfirmPassword ? (
                    <Eye size={20} />
                  ) : (
                    <EyeOff size={20} />
                  )}
                </button>
              </div>
              {!validation.passwordMatch && formData.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Password requirements */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs font-medium text-slate-700 mb-2">Password requirements:</p>
              <ul className="space-y-1 text-xs text-slate-600">
                <li className={validation.passwordLength ? "text-green-600" : "text-slate-600"}>
                  {validation.passwordLength ? "✓" : "○"} At least 8 characters
                </li>
                <li className={validation.passwordMatch && formData.confirmPassword ? "text-green-600" : "text-slate-600"}>
                  {validation.passwordMatch && formData.confirmPassword ? "✓" : "○"} Passwords match
                </li>
              </ul>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-all duration-150"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Already have an account?</span>
            </div>
          </div>

          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-slate-600">
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </div>

          {/* Footer note */}
          <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
            <p>
              Passwords are securely hashed with bcrypt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
