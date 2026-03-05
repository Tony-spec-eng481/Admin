// UserManagement.tsx (updated with correct class names)

import { useEffect, useState } from "react";
import { axiosInstance as api } from "../../shared/index";
import toast from "react-hot-toast";
import {
  Check,
  X,
  Shield,
  User,
  Users as UsersIcon,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import AdminUserRegistration from "./AdminUserRegistration";
import { useNavigate } from "react-router-dom";
import "../../shared/styles/AdminDashboard/UserManagement.css";

interface UserData {
  id: string;
  name: string;
  email: string;
  user_id?: string;
  role: "student" | "teacher" | "admin";
  is_verified: boolean;
  student_details?: { student_id: string };
  teacher_details?: { teacher_id: string };
  admin_details?: { admin_id: string };
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "student" | "teacher"
  >("all");
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const navigate = useNavigate();
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerify = async (id: string) => {
    try {
      await api.patch(`/admin/users/${id}/verify`);
      toast.success("User verified successfully");
      setUsers(
        users.map((u) => (u.id === id ? { ...u, is_verified: true } : u)),
      );
    } catch (error) {
      toast.error("Failed to verify user");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to reject this user? This will delete their account.",
      )
    )
      return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User rejected and removed");
      setUsers(users.filter((u) => u.id !== id));
    } catch (error) {
      toast.error("Failed to remove user");
    }
  };

  const handleViewReport = (user: { id: string; role: string }) => {
    if (user.role === "teacher") {
      navigate(`/reports/teacher/${user.id}`);
    } else if (user.role === "student") {
      navigate(`/reports/student/${user.id}`);
    } else {
      console.warn("No report available for this role");
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === "pending") return !user.is_verified;
    if (filter === "student") return user.role === "student";
    if (filter === "teacher") return user.role === "teacher";
    return true;
  });

  const getCustomId = (user: UserData) => {
    if (user.role === "student") return user.student_details?.student_id;
    if (user.role === "teacher") return user.teacher_details?.teacher_id;
    if (user.role === "admin") return user.admin_details?.admin_id;
    return "N/A";
  };

  const getRoleClass = (role: string) => {
    switch (role) {
      case "student":
        return "student";
      case "teacher":
        return "teacher";
      case "admin":
        return "admin";
      default:
        return "";
    }
  };

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2 className="user-management-title">
          <UsersIcon size={24} />
          User Management
        </h2>
        <div className="filter-container">
          {["all", "pending", "student", "teacher"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`filter-button ${filter === f ? "active" : ""}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="register-button"
        >
          <UserPlus size={18} />
          Register Staff
        </button>
      </div>

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>User</th>
              <th>ID</th>
              <th>User_ID</th>
              <th>Role</th>
              <th>Status</th>
              <th>Registered</th>
              <th className="text-right">Actions</th>
              <th>Report</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="loading-state">
                  <div className="loading-spinner"></div>
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-state">
                  <UsersIcon className="empty-icon" size={48} />
                  <p>No users found</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="user-id">{getCustomId(user)}</span>
                  </td>
                  <td>
                    <span className="text-xs font-mono">{user.id}</span>
                  </td>
                  <td>
                    <span className={`role-badge ${getRoleClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.is_verified ? (
                      <span className="status-badge verified">
                        <Shield size={14} className="status-icon" />
                        Verified
                      </span>
                    ) : (
                      <span className="status-badge pending">
                        <AlertCircle size={14} className="status-icon" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="user-date">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {!user.is_verified && (
                        <>
                          <button
                            onClick={() => handleVerify(user.id)}
                            className="action-button verify"
                            title="Verify User"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="action-button reject"
                            title="Reject User"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    {(user.role === "teacher" || user.role === "student") && (
                      <button
                        onClick={() => handleViewReport(user)}
                        className="report-button"
                      >
                        View Report
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showRegisterModal && (
        <AdminUserRegistration
          onClose={() => setShowRegisterModal(false)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
};

export default UserManagement;
