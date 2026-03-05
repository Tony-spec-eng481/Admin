// Departments.tsx (with proper class usage)

import { useEffect, useState } from "react";
import "../styles/Department.css";
import { axiosInstance as api } from "../../shared/index";

interface Department {
  id: string;
  name: string;
  description?: string;
  short_code?: string;
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all departments
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/admin/departments");
      setDepartments(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Create / Update department
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setError(null);

      if (editingId) {
        await api.put(`/admin/departments/${editingId}`, {
          name: name.trim(),
          description: description.trim(),
          short_code: shortCode.trim(),     
        });
      } else {
        await api.post("/admin/departments", {
          name: name.trim(),
          description: description.trim(),
          short_code: shortCode.trim(),
        });
      }

      setName("");
      setDescription("");
      setShortCode("");
      setEditingId(null);
      fetchDepartments();
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message);
      console.error(err);
    }
  };

  // Edit department
  const handleEdit = (dept: Department) => {
    setName(dept.name);
    setDescription(dept.description || "");
    setShortCode(dept.short_code || "");
    setEditingId(dept.id);
  };

  // Delete department
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;

    try {
      setError(null);
      await api.delete(`/admin/departments/${id}`);
      fetchDepartments();
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message);
      console.error(err);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setShortCode("");
  };

  // Filter departments based on search
  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="departments-page">
      <div className="departments-header">
        <h1>Departments</h1>
        <p className="subtitle">Manage your organization departments</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button className="error-close" onClick={() => setError(null)}>
            ×
          </button>
        </div>
      )}

      <div className="departments-content">
        {/* Form Section */}
        <div className="form-section">
          <h2>{editingId ? "Edit Department" : "Add New Department"}</h2>
          <form onSubmit={handleSubmit} className="department-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter department name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                placeholder="Enter short code"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <textarea
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
                rows={4}
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <span className="btn-icon">{editingId ? "✏️" : "➕"}</span>
                {editingId ? "Update Department" : "Add Department"}
              </button>   

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  <span className="btn-icon">✖️</span>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Search and List Section */}
        <div className="list-section">
          <div className="list-header">
            <div className="list-header-main">
              <h2>All Departments ({filteredDepartments.length})</h2>
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading departments...</p>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? (
                <>
                  <span className="empty-icon">🔍</span>
                  <p>No departments match your search</p>
                  <button
                    className="btn btn-link"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <span className="empty-icon">🏢</span>
                  <p>No departments yet</p>
                  <p className="empty-subtext">
                    Create your first department above
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="departments-grid">
              {filteredDepartments.map((dept) => (
                <div key={dept.id} className="department-card">
                  <div className="card-header">
                    <div className="card-info">
                      <h3>{dept.name}</h3>
                      {dept.short_code && <p>{dept.short_code}</p>}
                    </div>
                    {dept.description && <p>{dept.description}</p>}
                    <div className="card-actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(dept)}
                        title="Edit department"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(dept.id)}
                        title="Delete department"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
