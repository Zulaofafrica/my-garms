"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, Scissors, Briefcase } from "lucide-react";
import { authApi } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import styles from "../auth.module.css";

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer" as "customer" | "designer",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRoleChange = (role: "customer" | "designer") => {
    setFormData({ ...formData, role });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      });

      // Redirect to profile or designer dashboard based on role
      if (formData.role === "designer") {
        router.push("/designer");
      } else {
        router.push("/profile");
      }
      // router.refresh(); // Context signup already refreshes? No, check provider... Provider calls refresh.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.authContent}
        >
          {/* Header */}
          <div className={styles.authHeader}>
            <div className={styles.authBadge}>
              <Sparkles size={16} />
              <span>Join MyGarms</span>
            </div>
            <h1 className={styles.authTitle}>Create your account</h1>
            <p className={styles.authSubtitle}>Start designing your perfect wardrobe today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.authForm}>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.errorBanner}
              >
                {error}
              </motion.div>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>I am a...</label>
              <div className={styles.roleSelector}>
                <div className={styles.roleOption} onClick={() => handleRoleChange("customer")}>
                  <input
                    type="radio"
                    name="role"
                    className={styles.roleRadio}
                    checked={formData.role === "customer"}
                    readOnly
                  />
                  <div className={styles.roleLabel}>
                    <User className={styles.roleIcon} size={24} />
                    <span className={styles.roleName}>Customer</span>
                    <span className={styles.roleDesc}>Designing outfits</span>
                  </div>
                </div>

                <div className={styles.roleOption} onClick={() => handleRoleChange("designer")}>
                  <input
                    type="radio"
                    name="role"
                    className={styles.roleRadio}
                    checked={formData.role === "designer"}
                    readOnly
                  />
                  <div className={styles.roleLabel}>
                    <Scissors className={styles.roleIcon} size={24} />
                    <span className={styles.roleName}>Designer</span>
                    <span className={styles.roleDesc}>Reviewing requests</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.nameRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="firstName" className={styles.inputLabel}>First Name</label>
                <div className={styles.inputWrapper}>
                  <User className={styles.inputIcon} size={18} />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="lastName" className={styles.inputLabel}>Last Name</label>
                <div className={styles.inputWrapper}>
                  <User className={styles.inputIcon} size={18} />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.inputLabel}>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.inputLabel}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.inputLabel}>Confirm Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className={styles.spinner} />
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className={styles.authFooter}>
            <p className={styles.authFooterText}>
              Already have an account?{" "}
              <Link href="/auth/login" className={styles.authLink}>
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
