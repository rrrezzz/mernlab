import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { registerCustomer } from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    else if (formData.fullName.trim().length < 2) newErrors.fullName = "Minimum 2 characters";

    if (!formData.email.trim()) newErrors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) newErrors.email = "Enter a valid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Minimum 6 characters";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\+?[0-9\s\-()]{7,15}$/.test(formData.phone.trim())) newErrors.phone = "Enter a valid phone number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await registerCustomer({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
      });

      if (response.success) {
        navigate("/login", {
          state: {
            successMessage: "Your account has been created. You may now sign in.",
            registeredEmail: formData.email.trim().toLowerCase(),
          },
        });
      }
    } catch (err) {
      if (err.response) {
        const msg = err.response.data?.message || "Registration failed.";
        // Translate server messages to customer-facing language
        if (msg.toLowerCase().includes("already exists")) {
          setServerError("An account with this email address already exists.");
        } else if (msg.toLowerCase().includes("required")) {
          setServerError("Please complete all fields before continuing.");
        } else {
          setServerError("We were unable to create your account. Please try again.");
        }
      } else if (err.request) {
        setServerError("No connection. Please check your network and try again.");
      } else {
        setServerError("Something went wrong. Please try again shortly.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-split">

        {/* Left editorial panel */}
        <div className="auth-editorial">
          <div className="editorial-rule" />
          <div className="editorial-number">01 — Register</div>

          <div>
            <h2 className="editorial-headline">
              A considered<br /><em>beginning.</em>
            </h2>
            <p className="editorial-subtext">
              Access a curated world of objects selected for those who value permanence over trend.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          <div className="form-header">
            <span className="form-collection-label">New Account</span>
            <h1 className="form-title">Create your profile</h1>
            <p className="form-subtitle">Complete the form to begin your membership.</p>
          </div>

          {serverError && (
            <div className="alert-banner alert-error" role="alert">
              <AlertCircle size={15} className="alert-icon" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>

            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full Name <span className="required-star">*</span>
              </label>
              <div className={`input-wrapper ${errors.fullName ? "has-error" : ""}`}>
                <User size={15} className="input-icon" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="As it appears on official documents"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-input"
                  autoComplete="name"
                />
              </div>
              {errors.fullName && <p className="field-error-text">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address <span className="required-star">*</span>
              </label>
              <div className={`input-wrapper ${errors.email ? "has-error" : ""}`}>
                <Mail size={15} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your@address.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="field-error-text">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number <span className="required-star">*</span>
              </label>
              <div className={`input-wrapper ${errors.phone ? "has-error" : ""}`}>
                <Phone size={15} className="input-icon" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+1 555 0199"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  autoComplete="tel"
                />
              </div>
              {errors.phone && <p className="field-error-text">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password <span className="required-star">*</span>
              </label>
              <div className={`input-wrapper ${errors.password ? "has-error" : ""}`}>
                <Lock size={15} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn-toggle-password"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password
                ? <p className="field-error-text">{errors.password}</p>
                : <p className="field-hint-text">Choose a secure password of at least 6 characters.</p>
              }
            </div>

            <button
              type="submit"
              id="register-submit-button"
              className="btn-primary-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="btn-loading-content">
                  <span className="spinner-border" />
                  Creating account
                </span>
              ) : (
                <span className="btn-content">
                  <span>Create account</span>
                  <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>

          <div className="form-footer">
            <p className="switch-auth-text">
              Already a member?{" "}
              <Link to="/login" className="switch-auth-link">Sign in</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
