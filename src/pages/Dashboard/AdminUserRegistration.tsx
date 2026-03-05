import { useState } from "react";
import { axiosInstance as api } from '../../shared/index';
import {
  UserPlus,
  User,
  Shield,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import "../../shared/styles/AdminDashboard/UserRegistration.css";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const AdminUserRegistration = ({ onClose, onSuccess }: Props) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong" | null
  >(null);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    if (password.length < 6) return "weak";
    if (password.length < 10) return "medium";
    return "strong";
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    setPasswordStrength(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!formData.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register-staff", formData);
      toast.success(
        <div>
          <strong>
            {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}{" "}
            registered successfully!
          </strong>
          <br />
          <small>An email has been sent with login instructions.</small>
        </div>,
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.error || "Failed to register user");
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true });
  };

  const isEmailValid = validateEmail(formData.email);
  const isPasswordValid = formData.password.length >= 6;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <UserPlus className="header-icon" size={24} />
            <h2 className="header-title">Register New Staff</h2>
          </div>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              {/* <User className="input-icon" size={18} /> */}
              <input
                type="text"
                required
                className="form-input"
                placeholder="John Doe"
                value={formData.name}
                onBlur={() => handleBlur("name")}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                style={{ color: "white" }}
              />
            </div>
            {touched.name && !formData.name.trim() && (
              <div className="validation-message validation-error">
                <AlertCircle size={12} />
                Name is required
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              {/* <Mail className="input-icon" size={18} /> */}
              <input
                type="email"
                required
                className="form-input"
                placeholder="john@example.com"
                value={formData.email}
                onBlur={() => handleBlur("email")}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                style={{ color: "white" }}
              />
            </div>
            {touched.email && formData.email && !isEmailValid && (
              <div className="validation-message validation-error">
                <AlertCircle size={12} />
                Please enter a valid email
              </div>
            )}
            {touched.email && isEmailValid && (
              <div className="validation-message validation-success">
                <CheckCircle size={12} />
                Valid email format
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Initial Password</label>
            <div className="input-wrapper">
              {/* <Lock className="input-icon" size={18} /> */}
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onBlur={() => handleBlur("password")}
                onChange={handlePasswordChange}
                style={{ color: "white" }}
              />
            </div>

            {passwordStrength && (
              <div className="password-strength">
                <div
                  className={`password-strength-bar strength-${passwordStrength}`}
                ></div>
              </div>
            )}

            {touched.password && formData.password && !isPasswordValid && (
              <div className="validation-message validation-error">
                <AlertCircle size={12} />
                Password must be at least 6 characters
              </div>
            )}

            {touched.password && isPasswordValid && (
              <div className="validation-message validation-success">
                <CheckCircle size={12} />
                Password strength: {passwordStrength}
              </div>
            )}

            <div className="helper-text">
              <AlertCircle size={12} />
              The user can change this after first login
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <div className="role-grid">
              <button
                type="button"
                className="role-button selected"
                disabled
              >
                <Shield className="role-icon" size={24} />
                <span className="role-label">Admin</span>
              </button>
            </div>
          </div>

          <div className="form-divider">
            <span>Account Details</span>
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Registering...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Create Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminUserRegistration;
