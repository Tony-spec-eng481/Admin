import { useEffect, useState } from "react";
import { axiosInstance as api } from "../../shared/index";
import {
  Users,
  BookOpen,
  Presentation,
  FileText,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import "../styles/TeacherAnalytics.css";

interface UnitActivity {
  id: string;
  title: string;
  assignmentsAdministered: number;
  liveClassesHosted: number;
}

interface TeacherInteraction {
  name: string;
  unitsTaught: number;
  assignmentsCreated: number;
  liveClassesHosted: number;
}

interface TeacherAnalyticsData {
  totalTeachers: number;
  coursesOverview: {
    withUnits: number;
    withoutUnits: number;
  };
  unitsActivity: UnitActivity[];
  teacherInteractions: TeacherInteraction[];
}

const TeacherAnalytics = ({ onBack }: { onBack?: () => void }) => {
  const [data, setData] = useState<TeacherAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/admin/analytics/teachers");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching teacher analytics:", error);
        toast.error("Failed to load teacher analytics");
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
      <div className="teacher-analytics-loading-container">
        <div className="teacher-analytics-spinner"></div>
      </div>
    );
  }

  return (
    <div className="teacher-analytics-container">
      <div className="teacher-analytics-wrapper">
        {/* <button
          onClick={handleGoBack}
          className="teacher-analytics-back-button"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button> */}

        <h2 className="teacher-analytics-title">Teacher Analytics</h2>

        <div className="teacher-analytics-stats-grid">
          <div className="teacher-analytics-stat-card">
            <div className="teacher-analytics-stat-icon">
              <Users size={32} />
            </div>
            <div className="teacher-analytics-stat-content">
              <p className="teacher-analytics-stat-label">Total Teachers</p>
              <h3 className="teacher-analytics-stat-value">
                {data?.totalTeachers || 0}
              </h3>
            </div>
          </div>

          <div className="teacher-analytics-stat-card">
            <div className="teacher-analytics-stat-icon teacher-analytics-icon-success">
              <CheckCircle size={32} />
            </div>
            <div className="teacher-analytics-stat-content">
              <p className="teacher-analytics-stat-label">Courses w/ Units</p>
              <h3 className="teacher-analytics-stat-value">
                {data?.coursesOverview?.withUnits || 0}
              </h3>
            </div>
          </div>

          <div className="teacher-analytics-stat-card">
            <div className="teacher-analytics-stat-icon teacher-analytics-icon-warning">
              <XCircle size={32} />
            </div>
            <div className="teacher-analytics-stat-content">
              <p className="teacher-analytics-stat-label">Courses w/o Units</p>
              <h3 className="teacher-analytics-stat-value">
                {data?.coursesOverview?.withoutUnits || 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="teacher-analytics-sections-grid">
          {/* Active Units */}
          <div className="teacher-analytics-section-card">
            <div className="teacher-analytics-section-header">
              <h3 className="teacher-analytics-section-title">
                <BookOpen
                  size={20}
                  className="teacher-analytics-section-icon"
                />{" "}
                Active Units Managed
              </h3>
            </div>
            <div className="teacher-analytics-section-content">
              <div className="teacher-analytics-units-list">
                {data?.unitsActivity?.map((unit, idx) => (
                  <div key={idx} className="teacher-analytics-unit-item">
                    <span className="teacher-analytics-unit-title">
                      {unit.title}
                    </span>
                    <div className="teacher-analytics-unit-metrics">
                      <div className="teacher-analytics-unit-metric">
                        <FileText size={14} /> {unit.assignmentsAdministered}{" "}
                        <span className="teacher-analytics-metric-label">
                          Assignments
                        </span>
                      </div>
                      <div className="teacher-analytics-unit-metric">
                        <Presentation size={14} /> {unit.liveClassesHosted}{" "}
                        <span className="teacher-analytics-metric-label">
                          Live Classes
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {(!data?.unitsActivity || data.unitsActivity.length === 0) && (
                  <div className="teacher-analytics-empty-state">
                    No active units found.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Teacher Interactions */}
          <div className="teacher-analytics-section-card">
            <div className="teacher-analytics-section-header">
              <h3 className="teacher-analytics-section-title">
                <Users size={20} className="teacher-analytics-section-icon" />{" "}
                Teacher Interactions
              </h3>
            </div>
            <div className="teacher-analytics-section-content">
              <div className="teacher-analytics-teachers-list">
                {data?.teacherInteractions?.map((teacher, idx) => (
                  <div key={idx} className="teacher-analytics-teacher-item">
                    <div className="teacher-analytics-teacher-info">
                      <div className="teacher-analytics-avatar">
                        {teacher.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="teacher-analytics-teacher-details">
                        <span className="teacher-analytics-teacher-name">
                          {teacher.name}
                        </span>
                        <span className="teacher-analytics-teacher-units">
                          Taught {teacher.unitsTaught} unit(s)
                        </span>
                      </div>
                    </div>
                    <div className="teacher-analytics-teacher-stats">
                      <span className="teacher-analytics-teacher-stat">
                        <FileText size={12} /> {teacher.assignmentsCreated}
                      </span>
                      <span className="teacher-analytics-teacher-stat">
                        <Presentation size={12} /> {teacher.liveClassesHosted}
                      </span>
                    </div>
                  </div>
                ))}

                {(!data?.teacherInteractions ||
                  data.teacherInteractions.length === 0) && (
                  <div className="teacher-analytics-empty-state">
                    No teacher interactions recorded.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalytics;
