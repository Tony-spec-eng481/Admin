import { useEffect, useState } from "react";
import { axiosInstance as api } from '../../shared/index';
import {
  Save,
  Settings,
  Shield,
  Layout,
  Globe,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";    
import "../../shared/styles/AdminDashboard/SystemSettings.css";

interface Setting {
  key: string;
  value: any;
}

const SystemSettings = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [platformName, setPlatformName] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/admin/settings");
        setSettings(response.data);
        const platformSetting = response.data.find(
          (s: Setting) => s.key === "platform_name",
        );
        if (platformSetting) {
          setPlatformName(platformSetting.value);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdate = async (key: string, value: any) => {
    setSaving(true);
    try {
      await api.post("/admin/settings", { key, value });
      setSettings(settings.map((s) => (s.key === key ? { ...s, value } : s)));
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle size={16} />
          <span>Setting updated successfully</span>
        </div>,
      );
    } catch (error) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle size={16} />
          <span>Failed to update setting</span>
        </div>,
      );
    } finally {
      setSaving(false);
    }
  };

  const getSettingValue = (key: string, defaultValue: any = null) => {
    const setting = settings.find((s) => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="system-settings">
      <div className="settings-space">
        <div className="settings-header">
          <h2 className="header-title">
            <Settings size={28} />
            System Configuration
          </h2>
          <p className="header-subtitle">
            Manage platform-wide policies and visual preferences.
          </p>
        </div>

        <div className="settings-grid">
          {/* Security Section */}
          <div className="settings-card">
            <div className="card-header">
              <div className="card-icon security">
                <Shield size={20} />
              </div>
              <h3 className="card-title">Authentication & Security</h3>
            </div>

            <div className="settings-content">
              <div className="setting-item row">
                <div className="setting-info">
                  <p className="setting-label">Maintenance Mode</p>
                  <p className="setting-description">
                    Disable platform access for all non-admin users.
                  </p>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="maintenance-mode"
                    className="toggle-input"
                    checked={getSettingValue("maintenance_mode", false)}
                    onChange={(e) =>
                      handleUpdate("maintenance_mode", e.target.checked)
                    }
                  />
                  <label
                    htmlFor="maintenance-mode"
                    className="toggle-label"
                  ></label>
                </div>
              </div>

              <div className="setting-item row">
                <div className="setting-info">
                  <p className="setting-label">Two-Factor Authentication</p>
                  <p className="setting-description">
                    Require 2FA for all administrative accounts.
                  </p>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="2fa-mode"
                    className="toggle-input"
                    checked={getSettingValue("two_factor_auth", false)}
                    onChange={(e) =>
                      handleUpdate("two_factor_auth", e.target.checked)
                    }
                  />
                  <label
                    htmlFor="2fa-mode"
                    className="toggle-label security-mode"
                  ></label>
                </div>
              </div>

              <div className="setting-item row">
                <div className="setting-info">
                  <p className="setting-label">Session Timeout (minutes)</p>
                  <p className="setting-description">
                    Automatically log out inactive users.
                  </p>
                </div>
                <input
                  type="number"
                  className="setting-input"
                  style={{ width: "100px" }}
                  value={getSettingValue("session_timeout", 60)}
                  onChange={(e) =>
                    handleUpdate("session_timeout", parseInt(e.target.value))
                  }
                  min="5"
                  max="480"
                />
              </div>
            </div>
          </div>

          {/* Branding Section */}
          <div className="settings-card">
            <div className="card-header">
              <div className="card-icon branding">
                <Layout size={20} />
              </div>
              <h3 className="card-title">Branding & UI</h3>
            </div>

            <div className="settings-content">
              <div className="setting-item">
                <div className="setting-info">
                  <p className="setting-label">Platform Name</p>
                  <p className="setting-description">
                    The name displayed throughout the platform.
                  </p>
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    className="setting-input"
                    placeholder="Enter platform name"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                  />
                  <button
                    onClick={() => handleUpdate("platform_name", platformName)}
                    disabled={saving}
                    className="save-button"
                  >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              <div className="setting-item row">
                <div className="setting-info">
                  <p className="setting-label">Dark Mode Default</p>
                  <p className="setting-description">
                    Set dark mode as the default theme for new users.
                  </p>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="dark-mode"
                    className="toggle-input"
                    checked={getSettingValue("dark_mode_default", false)}
                    onChange={(e) =>
                      handleUpdate("dark_mode_default", e.target.checked)
                    }
                  />
                  <label htmlFor="dark-mode" className="toggle-label"></label>
                </div>
              </div>
            </div>
          </div>

          {/* Policies Section */}
          <div className="settings-card">
            <div className="card-header">
              <div className="card-icon policies">
                <Globe size={20} />
              </div>
              <h3 className="card-title">Platform Policies</h3>
            </div>

            <div className="settings-content">
              <div className="setting-item">
                <div className="setting-info">
                  <p className="setting-label">Default Enrollment Policy</p>
                  <p className="setting-description">
                    Control how students can enroll in courses.
                  </p>
                </div>
                <select
                  className="setting-select"
                  value={getSettingValue("enrollment_policy", "open")}
                  onChange={(e) =>
                    handleUpdate("enrollment_policy", e.target.value)
                  }
                >
                  <option value="open">Open (Anyone can join)</option>
                  <option value="moderated">
                    Moderated (Requires teacher approval)
                  </option>
                  <option value="closed">
                    Closed (Manual invitation only)
                  </option>
                </select>
              </div>

              <div className="setting-item row">
                <div className="setting-info">
                  <p className="setting-label">Allow Guest Access</p>
                  <p className="setting-description">
                    Let non-registered users browse course content.
                  </p>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="guest-access"
                    className="toggle-input"
                    checked={getSettingValue("guest_access", true)}
                    onChange={(e) =>
                      handleUpdate("guest_access", e.target.checked)
                    }
                  />
                  <label
                    htmlFor="guest-access"
                    className="toggle-label"
                  ></label>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <p className="setting-label">Max Courses Per Student</p>
                  <p className="setting-description">
                    Limit the number of courses a student can enroll in.
                  </p>
                </div>
                <input
                  type="number"
                  className="setting-input"
                  style={{ width: "100px" }}
                  value={getSettingValue("max_courses_per_student", 10)}
                  onChange={(e) =>
                    handleUpdate(
                      "max_courses_per_student",
                      parseInt(e.target.value),
                    )
                  }
                  min="1"
                  max="50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
