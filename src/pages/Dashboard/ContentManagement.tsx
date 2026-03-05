import { useEffect, useState } from "react";
import { axiosInstance as api } from '../../shared/index';
import {
  Check,
  X,
  Film,
  FileText,
  HelpCircle,
  BookOpen,
  Clock,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import "../../shared/styles/AdminDashboard/ContentManagement.css";

interface PendingCourse {
  id: string;
  title: string;
  short_code: string;
  description: string;
  thumbnail_url?: string;
  users?: {
    name: string;
    email: string;
  };
  created_at: string;
}

const ContentManagement = () => {
  const [pendingCourses, setPendingCourses] = useState<PendingCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const response = await api.get("/admin/courses/pending");
      setPendingCourses(response.data);
    } catch (error) {
      console.error("Error fetching pending content:", error);
      toast.error("Failed to load pending content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleStatusUpdate = async (
    id: string,
    status: "published" | "rejected",
  ) => {
    try {
      await api.patch(`/admin/courses/${id}/status`, { status });
      toast.success(
        `Course ${status === "published" ? "approved" : "rejected"} successfully`,
      );
      setPendingCourses(pendingCourses.filter((c) => c.id !== id));
    } catch (error) {
      toast.error("Failed to update course status");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Content for Approval...</p>
      </div>
    );
  }

  return (
    <div className="content-management">
      <div className="content-space">
        <div className="content-header">
          <h2 className="header-title">Content Approvals</h2>
          <div className="pending-badge">
            <Clock size={16} />
            Pending Review
            <span>{pendingCourses.length}</span>
          </div>
        </div>

        <div className="content-grid">
          {pendingCourses.length === 0 ? (
            <div className="empty-state">
              <BookOpen className="empty-state-icon" size={48} />
              <p>No content pending approval at the moment.</p>
            </div>
          ) : (
            pendingCourses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="thumbnail-container">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="thumbnail-image"
                    />
                  ) : (
                    <div className="thumbnail-placeholder">
                      <BookOpen size={40} />
                    </div>
                  )}
                  <div className="course-badge">{course.short_code}</div>
                </div>

                <div className="course-content">
                  <div>
                    <h3 className="course-title">{course.title}</h3>
                    <p className="submitter-info">
                      <User size={14} />
                      Submitted by:
                      <span className="submitter-name">
                        {course.users?.name || "Unknown"}
                      </span>
                      <span className="text-xs ml-2">
                        {formatDate(course.created_at)}
                      </span>
                    </p>
                  </div>

                  <p className="course-description">{course.description}</p>

                  <div className="content-tags">
                    <span className="content-tag video">
                      <Film size={14} /> Video Lessons
                    </span>
                    <span className="content-tag pdf">
                      <FileText size={14} /> PDFs/Notes
                    </span>
                    <span className="content-tag quiz">
                      <HelpCircle size={14} /> Quizzes
                    </span>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    onClick={() => handleStatusUpdate(course.id, "published")}
                    className="approve-button"
                    title="Approve this course"
                  >
                    <Check size={18} /> Approve Course
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(course.id, "rejected")}
                    className="reject-button"
                    title="Reject this course"
                  >
                    <X size={18} /> Reject Content
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
