import { useEffect, useState } from "react";
import { axiosInstance as api } from '../../shared/index';
import {
  PieChart,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import "../../shared/styles/AdminDashboard/AnalyticsDashboard.css";

interface MonthlyEnrollment {
  month: string;
  count: number;
}

interface AnalyticsData {
  totalEnrollments: number;
  completedLessons: number;
  engagementRate: number;
  monthlyEnrollments: MonthlyEnrollment[];
  growth?: number;
}

const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner-large"></div>
        <p className="loading-text">Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-space">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card enrollment">
            <div className="stat-header">
              <div className="stat-icon icon-blue">
                <Users size={24} />
              </div>
              <div>
                <p className="stat-label">Total Enrollments</p>
                <h3 className="stat-value">
                  {formatNumber(data?.totalEnrollments || 0)}
                </h3>
              </div>
            </div>
            <div className="stat-footer">
              <span className="trend-up">
                <TrendingUp size={16} />
                +12% from last month
              </span>
            </div>
          </div>

          <div className="stat-card lessons">
            <div className="stat-header">
              <div className="stat-icon icon-green">
                <Award size={24} />
              </div>
              <div>
                <p className="stat-label">Completed Lessons</p>
                <h3 className="stat-value">
                  {formatNumber(data?.completedLessons || 0)}
                </h3>
              </div>
            </div>
            <div className="stat-footer">
              <span className="info-text">
                <BookOpen size={16} />
                Across all courses
              </span>
            </div>
          </div>

          <div className="stat-card engagement">
            <div className="stat-header">
              <div className="stat-icon icon-purple">
                <PieChart size={24} />
              </div>
              <div>
                <p className="stat-label">Engagement Rate</p>
                <h3 className="stat-value">
                  {Math.round((data?.engagementRate || 0) * 100)}%
                </h3>
              </div>
            </div>
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill fill-purple"
                  style={{
                    width: `${Math.min((data?.engagementRate || 0) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Chart Card */}
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">Monthly Enrollment Trends</h2>
            <div className="chart-legend">
              <span className="legend-item">
                <span
                  className="legend-color"
                  style={{ background: "#2563eb" }}
                ></span>
                <span>2026 Enrollments</span>
              </span>
              {selectedMonth && (
                <span className="legend-item">
                  <Calendar size={14} />
                  <span>Selected: {selectedMonth}</span>
                </span>
              )}
            </div>
          </div>

          <div className="chart-container">
            {data?.monthlyEnrollments.map((entry) => {
              const maxValue = getMaxEnrollment();
              const height = (entry.count / maxValue) * 100;

              return (
                <div
                  key={entry.month}
                  className="chart-bar-wrapper"
                  onMouseEnter={() => setSelectedMonth(entry.month)}
                  onMouseLeave={() => setSelectedMonth(null)}
                >
                  <div className="bar-container">
                    <div
                      className="chart-bar"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    >
                      <span className="bar-tooltip">
                        {entry.count} enrollments
                      </span>
                    </div>
                  </div>
                  <span className="month-label">{entry.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
