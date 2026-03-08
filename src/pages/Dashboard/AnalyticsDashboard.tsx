import { useEffect, useState } from "react";
import { axiosInstance as api } from "../../shared/index";
import StudentAnalytics from "./StudentAnalytics";
import TeacherAnalytics from "./TeacherAnalytics";
import {
  PieChart,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import "../styles/AnalyticsDashboard.css";

interface MonthlyEnrollment {
  month: string;
  count: number;
}

interface AnalyticsData {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  completedLessons: number;
  engagementRate: number;
  monthlyEnrollments: MonthlyEnrollment[];
  growth?: number;
}

const AnalyticsDashboard = ({
  onNavigate,
}: {
  onNavigate: (tab: string) => void;
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [activeSubview, setActiveSubview] = useState<"overview" | "student" | "teacher">("overview");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/admin/analytics");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const getMaxEnrollment = () => {
    if (!data?.monthlyEnrollments) return 150;
    return Math.max(...data.monthlyEnrollments.map((e) => e.count), 150);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const handleGoBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="analytics-loading-container">
        <div className="analytics-spinner"></div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard-container">
      <div className="analytics-dashboard-wrapper">
        {/* <button onClick={handleGoBack} className="analytics-back-button">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button> */}

        {/* Analytics Sub-nav */}
        <div className="analytics-sub-nav">
          <button
            onClick={() => setActiveSubview("student")}
            className={`analytics-nav-button analytics-nav-button-primary ${activeSubview === "student" ? "active" : ""}`}
          >
            <Users size={18} /> Student Analytics
          </button>
          <button
            onClick={() => setActiveSubview("teacher")}
            className={`analytics-nav-button analytics-nav-button-secondary ${activeSubview === "teacher" ? "active" : ""}`}
          >
            <Users size={18} /> Teacher Analytics
          </button>
        </div>

        {activeSubview === "student" && (
          <StudentAnalytics onBack={() => setActiveSubview("overview")} />
        )}
        {activeSubview === "teacher" && (
          <TeacherAnalytics onBack={() => setActiveSubview("overview")} />
        )}

        {activeSubview === "overview" && (
          <>

        {/* Stats Grid */}
        <div className="analytics-stats-grid">
          <div className="analytics-stat-card">
            <div className="analytics-stat-header">
              <div className="analytics-stat-icon">
                <Users size={24} />
              </div>
              <div className="analytics-stat-info">
                <p className="analytics-stat-label">Total Users</p>
                <h3 className="analytics-stat-value">
                  {formatNumber(data?.totalUsers || 0)}
                </h3>
              </div>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-header">
              <div className="analytics-stat-icon">
                <BookOpen size={24} />
              </div>
              <div className="analytics-stat-info">
                <p className="analytics-stat-label">Total Courses</p>
                <h3 className="analytics-stat-value">
                  {formatNumber(data?.totalCourses || 0)}
                </h3>
              </div>
            </div>
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-header">
              <div className="analytics-stat-icon">
                <Users size={24} />
              </div>
              <div className="analytics-stat-info">
                <p className="analytics-stat-label">Total Enrollments</p>
                <h3 className="analytics-stat-value">
                  {formatNumber(data?.totalEnrollments || 0)}
                </h3>
              </div>
            </div>
            <div className="analytics-stat-trend">
              <TrendingUp size={16} />
              Real-time synchronization
            </div>
          </div>

          <div className="analytics-stat-card analytics-stat-card-engagement">
            <div className="analytics-stat-header">
              <div className="analytics-stat-icon">
                <PieChart size={24} />
              </div>
              <div className="analytics-stat-info">
                <p className="analytics-stat-label">Engagement</p>
                <h3 className="analytics-stat-value">
                  {Math.round((data?.engagementRate || 0) * 100)}%
                </h3>
              </div>
            </div>
            <div className="analytics-progress-container">
              <div className="analytics-progress-track">
                <div
                  className="analytics-progress-fill"
                  style={{
                    width: `${Math.min((data?.engagementRate || 0) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="analytics-chart-card">
          <div className="analytics-chart-header">
            <h2 className="analytics-chart-title">Monthly Enrollment Trends</h2>
            <div className="analytics-chart-legend">
              <span className="analytics-legend-item">
                <span className="analytics-legend-dot"></span>
                Current Enrollments
              </span>
              {selectedMonth && (
                <span className="analytics-selected-month">
                  <Calendar size={14} /> Selected: {selectedMonth}
                </span>
              )}
            </div>
          </div>

          <div className="analytics-chart-container">
            {data?.monthlyEnrollments?.map((entry) => {
              const maxValue = getMaxEnrollment();
              const height = (entry.count / maxValue) * 100;

              return (
                <div
                  key={entry.month}
                  className="analytics-chart-bar-wrapper"
                  onMouseEnter={() => setSelectedMonth(entry.month)}
                  onMouseLeave={() => setSelectedMonth(null)}
                >
                  <div className="analytics-chart-bar-container">
                    <div
                      className="analytics-chart-bar"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    >
                      <div className="analytics-chart-tooltip">
                        {entry.count} enrollments
                      </div>
                    </div>
                  </div>
                  <span className="analytics-chart-label">
                    {entry.month.substring(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
