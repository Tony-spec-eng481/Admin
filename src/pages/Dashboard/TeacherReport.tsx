import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance as api } from "../../shared/index";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  Mail,
  BookOpen,
  Users,
  Star,
  Activity,
  Award,
  Calendar,
  Clock,
} from "lucide-react";
import "../styles/TeacherReport.css";

interface TeacherReportType {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  teacherReport?: {
    details?: {
      teacher_id: string;
      department?: { name: string; short_code?: string };
      subjects?: string[];
    };
    totalCourses?: number;
    totalStudents?: number;
  };
}

const TeacherReport = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState<TeacherReportType | null>(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
   if (id) fetchTeacher();
 }, [id]);

  const fetchTeacher = async () => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setTeacher(res.data);
    } catch (err) {
      toast.error("Failed to load teacher report");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="teacher-report-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading teacher report...</p>
        </div>
      </div>
    );

  if (!teacher)
    return (
      <div className="teacher-report-container">
        <div className="error-state">
          <p>No teacher found</p>
          <button onClick={() => navigate(-1)} className="back-button">
            Go Back   
          </button>
        </div>
      </div>
    );

  const details = teacher.teacherReport?.details;
  const subjects = details?.subjects ?? [];

  return (
    <div className="teacher-report-container">
      {/* Header */}
      <div className="report-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ChevronLeft size={20} /> Back to Teachers
        </button>
      </div>

      {/* Report Card */}
      <div className="report-card">
        {/* Profile */}
        <div className="profile-section">
          <div className="profile-header">
            <div className="avatar">{teacher.name.charAt(0).toUpperCase()}</div>
            <div className="profile-info">
              <h1 className="teacher-name">{teacher.name}</h1>
              <div className="teacher-meta">
                <span className="meta-item">
                  <Mail size={16} /> {teacher.email}
                </span>
                {teacher.created_at && (
                  <span className="meta-item">
                    <Calendar size={16} /> Joined{" "}
                    {new Date(teacher.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="teacher-details">
            <div className="detail-item">
              <span className="detail-label">Teacher ID</span>
              <span className="detail-value">
                {details?.teacher_id || "Not assigned"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Department</span>
              <span className="detail-value department-badge">
                {details?.department?.name || "Not specified"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon courses">
              <BookOpen size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Courses</h3>
              <p className="stat-number">
                {teacher.teacherReport?.totalCourses || 0}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon students">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Students</h3>
              <p className="stat-number">
                {teacher.teacherReport?.totalStudents || 0}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rating">
              <Star size={24} />
            </div>
            <div className="stat-content">
              <h3>Average Rating</h3>
              <p className="stat-number">4.8</p>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={star <= 4.8 ? "star-filled" : "star-empty"}
                  />
                ))}
                <span className="rating-count">(156 reviews)</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon activity">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <h3>Activity Rate</h3>
              <p className="stat-number">92%</p>
              <div className="activity-bar">
                <div
                  className="activity-progress"
                  style={{ width: "92%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects */}
        {subjects.length > 0 && (
          <div className="subjects-section">
            <h3>
              <Award size={20} /> Subjects Taught
            </h3>
            <div className="subjects-list">
              {subjects.map((subject, idx) => (
                <span key={idx} className="subject-tag">
                  {subject}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity (optional: can be fetched dynamically later) */}
        <div className="recent-activity">
          <h3>
            <Clock size={20} /> Recent Activity
          </h3>
          <div className="activity-timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <p className="timeline-title">
                  Completed grading for Advanced Mathematics
                </p>
                <span className="timeline-time">2 hours ago</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <p className="timeline-title">Uploaded new course materials</p>
                <span className="timeline-time">Yesterday</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherReport;
