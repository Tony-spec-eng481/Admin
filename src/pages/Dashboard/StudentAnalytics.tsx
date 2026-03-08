import { useEffect, useState } from "react";
import { axiosInstance as api } from "../../shared/index";
import {
  Users,
  BookOpen,
  CheckCircle,
  FileText,
  Video,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "../styles/StudentAnalytics.css";

interface CourseAnalytics {
  id: string;
  title: string;
  totalStudents: number;
  completedUnits: number;
  assignmentsGiven: number;
  assignmentsSubmitted: number;
  assignmentsNotSubmitted: number;
  successfulLiveClasses: number;
  failedLiveClasses: number;
  studentAttendance: number;
}

interface StudentAnalyticsData {
  totalStudents: number;
  totalCoursesEnrolled: number;
  courseAnalytics: CourseAnalytics[];
}

const StudentAnalytics = ({ onBack }: { onBack?: () => void }) => {
  const [data, setData] = useState<StudentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/admin/analytics/students");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching student analytics:", error);
        toast.error("Failed to load student analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading-container">
        <div className="analytics-spinner"></div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-wrapper">
        <button onClick={handleGoBack} className="analytics-back-button">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <h2 className="analytics-title">Student Analytics</h2>

        <div className="analytics-stats-grid">
          <div className="analytics-stat-card">
            <div className="analytics-stat-icon">
              <Users size={32} />
            </div>
            <div className="analytics-stat-content">
              <p className="analytics-stat-label">Total Students</p>
              <h3 className="analytics-stat-value">
                {data?.totalStudents || 0}
              </h3>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-icon">
              <BookOpen size={32} />
            </div>
            <div className="analytics-stat-content">
              <p className="analytics-stat-label">Total Course Enrollments</p>
              <h3 className="analytics-stat-value">
                {data?.totalCoursesEnrolled || 0}
              </h3>
            </div>
          </div>
        </div>

        <h3 className="analytics-section-title">Course Breakdown</h3>
        <div className="analytics-course-grid">
          {data?.courseAnalytics?.map((course) => (
            <div key={course.id} className="analytics-course-card">
              <div className="analytics-course-header">
                <h4 className="analytics-course-title">{course.title}</h4>
                <span className="analytics-course-badge">
                  {course.totalStudents} Students
                </span>
              </div>

              <div className="analytics-metrics-grid">
                <div className="analytics-metric-card">
                  <span className="analytics-metric-label">
                    <CheckCircle size={16} /> Completed Units
                  </span>
                  <span className="analytics-metric-value">
                    {course.completedUnits}
                  </span>
                </div>

                <div className="analytics-metric-card">
                  <span className="analytics-metric-label">
                    <FileText size={16} /> Assignments
                  </span>
                  <div className="analytics-metric-row">
                    <span className="analytics-metric-value">
                      {course.assignmentsGiven}{" "}
                      <span className="analytics-metric-unit">given</span>
                    </span>
                  </div>
                  <div className="analytics-progress-bar">
                    {course.assignmentsGiven > 0 && (
                      <div
                        className="analytics-progress-fill"
                        style={{
                          width: `${(course.assignmentsSubmitted / (course.assignmentsGiven * course.totalStudents || 1)) * 100}%`,
                        }}
                        title={`${course.assignmentsSubmitted} submitted`}
                      ></div>
                    )}
                  </div>
                  <div className="analytics-metric-footer">
                    <span>
                      {course.assignmentsSubmitted} received,{" "}
                      {course.assignmentsNotSubmitted} missing
                    </span>
                  </div>
                </div>

                <div className="analytics-metric-card">
                  <span className="analytics-metric-label">
                    <Video size={16} /> Live Classes
                  </span>
                  <div className="analytics-live-classes">
                    <div className="analytics-live-class-item">
                      <span className="analytics-live-class-value">
                        {course.successfulLiveClasses}
                      </span>
                      <span className="analytics-live-class-label">
                        Success
                      </span>
                    </div>
                    <div className="analytics-live-class-item">
                      <span className="analytics-live-class-value analytics-failed">
                        {course.failedLiveClasses}
                      </span>
                      <span className="analytics-live-class-label">Failed</span>
                    </div>
                  </div>
                </div>

                <div className="analytics-metric-card">
                  <span className="analytics-metric-label">
                    <Calendar size={16} /> Total Attendance
                  </span>
                  <span className="analytics-metric-value">
                    {course.studentAttendance}
                  </span>
                  <span className="analytics-metric-note">
                    presences recorded
                  </span>
                </div>
              </div>
            </div>
          ))}

          {(!data?.courseAnalytics || data.courseAnalytics.length === 0) && (
            <div className="analytics-empty-state">
              No course analytics available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
