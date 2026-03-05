import { useEffect, useState } from "react";
import { axiosInstance as api } from "../../shared/index";
import {
  Save,
  X,   
  BookOpen,
} from "lucide-react";   
import toast from "react-hot-toast";
import "../styles/CourseAddModal.css"

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}
   
const CourseAddModal = ({ onClose, onSuccess }: Props) => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    short_code: "",
    description: "",
    duration_weeks: 0,
    difficulty: "beginner",
    department_id: "",
    tags: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/admin/departments");
        setDepartments(res.data);  
      } catch (error: any) {
        toast.error("Failed to load departments");
      } finally {
        setFetching(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return toast.error("Title required");
    if (!formData.short_code.trim()) return toast.error("Short code required");

    setLoading(true);
    try {
      await api.post("/courses", {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });

      toast.success("Course created");
      onSuccess();   
      onClose();
    } catch {
      toast.error("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title">
            <BookOpen size={24} />
            <span>Add Course</span>
          </div>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {fetching ? (
            <p>Loading…</p>
          ) : (
            <>
              <input
                className="form-input"
                placeholder="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />

              <input
                className="form-input"
                placeholder="Short code"
                value={formData.short_code}
                onChange={(e) =>
                  setFormData({ ...formData, short_code: e.target.value })
                }
              />

              <textarea
                className="form-textarea"
                style={{ color: "white" }}
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
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
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <input
                className="form-input"
                placeholder="Duration (weeks)"
                value={formData.duration_weeks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_weeks: parseInt(e.target.value) || 0,
                  })
                }
              />

              <input
                className="form-input"
                placeholder="Difficulty (e.g. beginner)"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value,

                  })
                }
              />

              <input
                className="form-input"
                placeholder="tags: react, frontend"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />

              <button className="save-button" disabled={loading}>
                <Save size={18} /> Create
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default CourseAddModal;
