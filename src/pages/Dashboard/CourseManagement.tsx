// CourseManagement.tsx (with proper class usage)

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance as api } from "../../shared/index";
import toast from "react-hot-toast";
import { Search, Plus, BookOpen } from "lucide-react";
import CourseEditModal from "./CourseEditModal";
import CourseAddModal from "./CourseAddModal";
import { CourseCard } from "../../shared/index";
import "../../shared/styles/AdminDashboard/CourseManagement.css";

interface Course {
  id: string;
  title: string;
  short_code: string;
  description: string;
  department_id: string;
  created_at: string;
}

const CourseManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this course? This action cannot be undone.",
      )
    )
      return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success("Course deleted successfully");
      setCourses(courses.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    }
  };

  const handleEdit = (id: string) => {
    const course = courses.find((c) => c.id === id);
    if (course) setSelectedCourse(course);
  };

  const handleManage = (id: string) => {
    navigate(`/dashboard/courses/${id}/units`);
  };

  const handleAddCourse = () => {
    setShowAddModal(true);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="course-management">
      <div className="course-header">
        <div className="course-title-section">
          <h2>Course Management</h2>
          <p>Manage your system's educational courses</p>
        </div>

        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search courses by title, code, or description..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="action-bar">
          <button className="add-course-btn" onClick={handleAddCourse}>
            <Plus size={18} />
            <span>New Course</span>
          </button>
        </div>
      </div>

      <div className="course-grid">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <p>No courses found</p>
            {searchTerm && (
              <p className="text-sm">Try adjusting your search term</p>
            )}
            {!searchTerm && (
              <button className="add-course-btn" onClick={handleAddCourse}>
                <Plus size={18} /> Create your first course
              </button>
            )}
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} className="course-card-wrapper">
              <CourseCard
                course={course}
                viewMode="teacher"
                onManage={handleManage}
              />
              <div className="local-card-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(course.id)}
                  data-tooltip="Edit course"
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(course.id)}
                  data-tooltip="Delete course"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedCourse && (
        <CourseEditModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onSuccess={fetchCourses}
        />
      )}
      {showAddModal && (
        <CourseAddModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchCourses}
        />
      )}
    </div>
  );
};

export default CourseManagement;
