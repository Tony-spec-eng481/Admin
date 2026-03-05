import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance as api } from "../../shared/index";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Edit, Trash2, BookOpen } from "lucide-react";
import "../styles/CourseUnits.css"; // Import the external CSS file

interface Unit {
  id: string;
  program_unit_id: string;
  title: string;
  description: string;
  short_code: string;
  semester: number;
  year: number;
  topics: any[];
  assigned_teacher?: {
    id: string;
    name: string;
  } | null;
}

const CourseUnits = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    short_code: "",
    semester: 1,
    year: 1,
    teacher_id: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseRes, unitsRes, teachersRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/units/course/${courseId}`),
        api.get(`/admin/users?role=teacher`)
      ]);
      setCourse(courseRes.data);
      setUnits(unitsRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load course data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const handleOpenModal = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        title: unit.title || "",
        description: unit.description || "",
        short_code: unit.short_code || "",
        semester: unit.semester || 1,
        year: unit.year || 1,
        teacher_id: unit.assigned_teacher?.id || "",
      });
    } else {
      setEditingUnit(null);
      setFormData({
        title: "",
        description: "",
        short_code: "",
        semester: 1,
        year: 1,
        teacher_id: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUnit(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUnit) {
        await api.put(`/units/${editingUnit.id}`, {
          ...formData,
          program_unit_id: editingUnit.program_unit_id,
        });
        toast.success("Unit updated successfully");
      } else {
        await api.post("/units", {
          ...formData,
          program_id: courseId,
        });
        toast.success("Unit added successfully");
      }
      handleCloseModal();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save unit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (unitId: string) => {
    if (!window.confirm("Are you sure you want to delete this unit?")) return;
    try {
      await api.delete(`/units/${unitId}`);
      toast.success("Unit deleted successfully");
      setUnits(units.filter((u) => u.id !== unitId));
    } catch (error) {
      toast.error("Failed to delete unit");
    }
  };

  // const handleBack = () => { 
  //   navigate("/dashboard/courses");
  // };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span className="loading-text">Loading units...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="course-units-container">
      <div className="header-section">
        <button onClick={() => navigate("/dashboard/courses")} className="back-button" style={{color:"white"}}>
          <ArrowLeft size={20} />
        </button>
        <div className="header-content">
          <h1>{course?.title} - Units</h1>
          <p>Manage units for this program</p>
        </div>
      </div>

      <div className="add-button-container">
        <button onClick={() => handleOpenModal()} className="add-button">
          <Plus size={20} />
          <span>Add Unit</span>
        </button>
      </div>

      {units.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} className="empty-state-icon" />
          <h3>No units found</h3>
          <p>Get started by adding a new unit to this course.</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-responsive">
            <table className="units-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Code</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id}>
                    <td>
                      <div className="unit-title">{unit.title}</div>
                      <div className="unit-description">{unit.description}</div>
                    </td>
                    <td>
                      <span className="unit-code">{unit.short_code}</span>
                    </td>
                    <td>
                      <div className="unit-details">
                        Year {unit.year}, Sem {unit.semester}
                      </div>
                      <div className="text-sm mt-1 text-gray-600">
                        Teacher:{" "}
                        {unit.assigned_teacher?.name || (
                          <span className="text-gray-400 italic">
                            Unassigned
                          </span>
                        )}
                      </div>
                      <span className="topics-badge mt-2 inline-block">
                        {unit.topics?.length || 0} Topics
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleOpenModal(unit)}
                          className="edit-button"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(unit.id)}
                          className="delete-button"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingUnit ? "Edit Unit" : "Add Unit"}</h3>
              <button onClick={handleCloseModal} className="modal-close">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Short Code</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.short_code}
                  onChange={(e) =>
                    setFormData({ ...formData, short_code: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Teacher</label>
                <select
                  className="form-input"
                  value={formData.teacher_id}
                  onChange={(e) =>
                    setFormData({ ...formData, teacher_id: e.target.value })
                  }
                >
                  <option value="">-- Unassigned --</option>
                  {teachers.map((teacher: any) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="form-number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="form-number"
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        semester: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {submitting ? "Updating Topic…" : "Create Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseUnits;
