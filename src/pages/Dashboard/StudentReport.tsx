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
  Calendar,
  Clock,
} from "lucide-react";
import "../styles/StudentReport.css";

interface StudentReportType {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  studentReport?: {
    details?: {
      student_id: string;
      program_id?: { title: string; short_code?: string };
      year?: number;
    };
    totalCourses?: number;
    completedLessons?: number;
  };
}

const StudentReport = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<StudentReportType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setStudent(res.data);
    } catch (err) {
      toast.error("Failed to load student report");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="student-report-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading student report...</p>
        </div>
      </div>
    );

  if (!student)
    return (
      <div className="student-report-container">
        <div className="error-state">
          <p>No student found</p>
          <button onClick={() => navigate(-1)} className="back-button">
            Go Back
          </button>
        </div>
      </div>
    );

  const details = student.studentReport?.details;
  const completedLessons = student.studentReport?.completedLessons || 0;
  const totalCourses = student.studentReport?.totalCourses || 0;
  const progressPercentage =
    totalCourses > 0 ? ((completedLessons / totalCourses) * 100).toFixed(0) : 0;

  return (
    <div className="student-report-container">
      {/* Header */}
      <div className="report-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ChevronLeft size={20} /> Back to Students
        </button>
      </div>

      {/* Report Card */}
      <div className="report-card">
        {/* Profile */}
        <div className="profile-section">
          <div className="profile-header">
            <div className="avatar">{student.name.charAt(0).toUpperCase()}</div>
            <div className="profile-info">
              <h1 className="student-name">{student.name}</h1>
              <div className="student-meta">
                <span className="meta-item">
                  <Mail size={16} /> {student.email}
                </span>
                {student.created_at && (
                  <span className="meta-item">
                    <Calendar size={16} /> Joined{" "}
                    {new Date(student.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="student-details">
            <div className="detail-item">
              <span className="detail-label">Student ID</span>
              <span className="detail-value">
                {details?.student_id || "Not assigned"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Program</span>
              <span className="detail-value program-badge">
                {details?.program_id?.title || "Not specified"}
              </span>
            </div>
            {details?.year && (
              <div className="detail-item">
                <span className="detail-label">Year</span>
                <span className="detail-value">{details.year}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon courses">
              <BookOpen size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Enrolled Courses</h3>
              <p className="stat-number">{totalCourses}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed">
              <Star size={24} />
            </div>
            <div className="stat-content">
              <h3>Completed Lessons</h3>
              <p className="stat-number">{completedLessons}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon progress">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <h3>Progress</h3>
              <p className="stat-number">{progressPercentage}%</p>
              <div className="progress-bar">
                <div
                  className="progress-filled"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section (optional) */}
        <div className="recent-activity">
          <h3>
            <Clock size={20} /> Recent Activity
          </h3>
          <div className="activity-timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <p className="timeline-title">
                  Completed "Introduction to Biology"
                </p>
                <span className="timeline-time">2 hours ago</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <p className="timeline-title">
                  Submitted assignment: "Basic Chemistry Lab"
                </p>
                <span className="timeline-time">Yesterday</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReport;
