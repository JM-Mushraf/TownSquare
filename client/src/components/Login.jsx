import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"; // Added
import { login } from "../Slices/AuthSlice.js"; // Added
import toast from "react-hot-toast"; // Added
import "./Login.css";

export default function AuthPage() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    county: "",
    postcode: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Added
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Added

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({
      ...registerData,
      [name]: value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Added

    try {
      const result = await dispatch(login(loginData)).unwrap(); // Added
      console.log(result)
      if (result) {
        toast.success("Login successful!"); // Added
        navigate("/");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      toast.error("Login failed. Please check your credentials."); // Added
    } finally {
      setIsSubmitting(false); // Added
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    console.log("Register data:", registerData);
    navigate("/");
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="auth-container">
      <div className={`auth-card ${isFlipped ? "flipped" : ""}`}>
        {/* Login Side */}
        <div className="card-side front">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Sign in to continue to TownSquare</p>
          </div>

          <form className="auth-form login-form" onSubmit={handleLoginSubmit}>
            <div className="form-group login-form-group">
              <label htmlFor="login-email">Email</label>
              <div className="input-with-icon login-input-with-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z"></path>
                  <path d="m22 6-10 7L2 6"></path>
                </svg>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group login-form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-with-icon login-input-with-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="form-options login-form-options">
              <div className="remember-me login-remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#" className="forgot-password login-forgot-password">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="auth-button login-auth-button"
              disabled={isSubmitting} 
            >
              {isSubmitting ? "Logging in..." : "Sign In"} {/* Added */}
            </button>

            <div className="auth-divider login-auth-divider">
              <span>OR</span>
            </div>

            <div className="social-login login-social-login">
              <button type="button" className="social-button google login-social-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>

            <div className="auth-footer login-auth-footer">
              <p>
                Don't have an account?{" "}
                <button type="button" onClick={flipCard} className="flip-button login-flip-button">
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Register Side */}
        <div className="card-side back">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Join the TownSquare community</p>
          </div>

          <form className="auth-form register-form" onSubmit={handleRegisterSubmit}>
            <div className="register-form-grid">
              <div className="form-group register-form-group">
                <label htmlFor="username">Username</label>
                <div className="input-with-icon register-input-with-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>

              <div className="form-group register-form-group">
                <label htmlFor="register-email">Email</label>
                <div className="input-with-icon register-input-with-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z"></path>
                    <path d="m22 6-10 7L2 6"></path>
                  </svg>
                  <input
                    type="email"
                    id="register-email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group register-form-group">
                <label htmlFor="register-password">Password</label>
                <div className="input-with-icon register-input-with-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    type="password"
                    id="register-password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>

              <div className="form-group register-form-group">
                <label htmlFor="role">Role</label>
                <div className="input-with-icon register-input-with-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <select id="role" name="role" value={registerData.role} onChange={handleRegisterChange} required>
                    <option value="">Select your role</option>
                    <option value="resident">Resident</option>
                    <option value="business">Business Owner</option>
                    <option value="government">Government Official</option>
                    <option value="visitor">Visitor</option>
                  </select>
                </div>
              </div>

              <div className="form-group register-form-group">
                <label htmlFor="phone">Phone</label>
                <div className="input-with-icon register-input-with-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={registerData.phone}
                    onChange={handleRegisterChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              <div className="form-group register-form-group full-width">
                <label htmlFor="address">Address</label>
                <div className="input-with-icon register-input-with-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={registerData.address}
                    onChange={handleRegisterChange}
                    placeholder="Enter your street address"
                    required
                  />
                </div>
              </div>

              <div className="form-group register-form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={registerData.city}
                  onChange={handleRegisterChange}
                  placeholder="City"
                  required
                />
              </div>

              <div className="form-group register-form-group">
                <label htmlFor="district">District</label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={registerData.district}
                  onChange={handleRegisterChange}
                  placeholder="District"
                  required
                />
              </div>

              <div className="form-group register-form-group">
                <label htmlFor="county">County</label>
                <input
                  type="text"
                  id="county"
                  name="county"
                  value={registerData.county}
                  onChange={handleRegisterChange}
                  placeholder="County"
                  required
                />
              </div>

              <div className="form-group register-form-group">
                <label htmlFor="postcode">Postcode</label>
                <input
                  type="text"
                  id="postcode"
                  name="postcode"
                  value={registerData.postcode}
                  onChange={handleRegisterChange}
                  placeholder="Postcode"
                  required
                />
              </div>
            </div>

            <div className="terms-checkbox register-terms-checkbox">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" className="auth-button register-auth-button">
              Create Account
            </button>

            <div className="auth-footer register-auth-footer">
              <p>
                Already have an account?{" "}
                <button type="button" onClick={flipCard} className="flip-button register-flip-button">
                  Sign In
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}