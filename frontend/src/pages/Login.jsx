import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { loginCustomer } from "../services/api";

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessNotice(location.state.successMessage);
      if (location.state.registeredEmail) {
        setEmail(location.state.registeredEmail);
      }
    }
  }, [location.state]);

  const validate = () => {
    const errors = {};
    if (!email.trim()) errors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Enter a valid email";
    if (!password) errors.password = "Password is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!validate()) return;
    setIsLoading(true);

    try {
      const response = await loginCustomer({
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.success) {
        setSuccessNotice("");
        navigate("/home");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setErrorMessage("Invalid credentials. Please verify your details.");
      } else if (err.request) {
        setErrorMessage("No connection. Please check your network.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
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
          <div className="editorial-number">02 — Sign In</div>

          <div>
            <h2 className="editorial-headline">
              Welcome<br /><em>back.</em>
            </h2>
            <p className="editorial-subtext">
              Your selections are reserved. Continue where you left off.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          <div className="form-header">
            <span className="form-collection-label">Member Access</span>
            <h1 className="form-title">Sign in</h1>
            <p className="form-subtitle">Enter your credentials to access your account.</p>
          </div>

          {successNotice && (
            <div className="alert-banner alert-success" role="status">
              <CheckCircle2 size={15} className="alert-icon" />
              <span>{successNotice}</span>
            </div>
          )}

          {errorMessage && (
            <div className="alert-banner alert-error" role="alert" id="login-error-banner">
              <AlertCircle size={15} className="alert-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email Address</label>
              <div className={`input-wrapper ${fieldErrors.email ? "has-error" : ""}`}>
                <Mail size={15} className="input-icon" />
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  placeholder="your@address.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                    if (errorMessage) setErrorMessage("");
                  }}
                  className="form-input"
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && <p className="field-error-text">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <div className={`input-wrapper ${fieldErrors.password ? "has-error" : ""}`}>
                <Lock size={15} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  name="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
                    if (errorMessage) setErrorMessage("");
                  }}
                  className="form-input"
                  autoComplete="current-password"
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
              {fieldErrors.password && <p className="field-error-text">{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              id="login-submit-button"
              className="btn-primary-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="btn-loading-content">
                  <span className="spinner-border" />
                  Signing in
                </span>
              ) : (
                <span className="btn-content">
                  <span>Sign in</span>
                  <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>

          <div className="form-footer">
            <p className="switch-auth-text">
              Not yet a member?{" "}
              <Link to="/register" className="switch-auth-link">Create an account</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
