import { useEffect, useState } from "react";
import { axiosInstance as api } from "../../shared/index";
import { Save, X, Layers, BookOpen, Tag, Archive } from "lucide-react";
import toast from "react-hot-toast";
import "../../shared/styles/AdminDashboard/CourseEditModal.css";
interface Department {
  id: string;
  name: string;
  short_code?: string;
  description?: string;
}
interface Course {
  id: string;
  title: string;
  department_id?: string;
  status?: string;
  tags?: string[];
}
interface Props {
  course: Course;
  onClose: () => void;
  onSuccess: () => void;
}

const CourseEditModal = ({ course, onClose, onSuccess }: Props) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    title: course.title || "",
    department_id: course.department_id || "",
    status: course.status || "pending",
    tags: course.tags?.join(", ") || "",
  });

  useEffect(() => {
    api.get("/admin/departments").then((res) => setDepartments(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.patch(`/admin/courses/${course.id}/status`, {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean),
      });

      toast.success("Updated");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            className="form-input"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <select
            className="form-select"
            style={{ color: "white" }}
            value={formData.department_id}
            onChange={(e) =>
              setFormData({ ...formData, department_id: e.target.value })
            }
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ color: "white" }}
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          <input
            className="form-input"
            style={{ color: "white" }}
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />

          <button className="save-button">
            <Save size={18} /> Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default CourseEditModal;
