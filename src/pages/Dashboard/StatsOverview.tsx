import React, { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";  
import { axiosInstance as api } from '../../shared/index';
import toast from "react-hot-toast";
import "../../shared/styles/AdminDashboard/StatsOverview.css"; // Import the CSS file

interface Stats {
  students: number;
  teachers: number;
  courses: number;
  pendingVerifications: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  badge?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  badge,
}) => {     
  const getIconColor = () => {
    switch (color) {
      case "blue":
        return "icon-blue";
      case "purple":
        return "icon-purple";
      case "green":
        return "icon-green";
      case "orange":
        return "icon-orange";
      case "red":
        return "icon-red";
      default:
        return "icon-blue";
    }
  };

  const getBadgeColor = () => {
    switch (color) {
      case "blue":
        return "badge-blue";
      case "purple":
        return "badge-purple";
      case "green":
        return "badge-green";
      case "orange":
        return "badge-orange";
      default:
        return "badge-blue";
    }
  };

  return (
    <div className="stat-card">
      <div className={`stat-icon ${getIconColor()}`}>
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<any>, {
              className: "w-6 h-6",
            })
          : icon}
      </div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value.toLocaleString()}</h3>

        {trend && (
          <div
            className={`stat-trend ${trend.isUp ? "trend-up" : "trend-down"}`}
          >
            {trend.isUp ? (
              <TrendingUp className="trend-icon" />
            ) : (
              <TrendingDown className="trend-icon" />
            )}
            <span>{trend.value}% from last month</span>
          </div>
        )}

        {badge && (
          <span className={`stat-badge ${getBadgeColor()}`}>{badge}</span>
        )}
      </div>
    </div>
  );
};

const StatsOverview = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsResponse, trendsResponse] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/stats/trends").catch(() => null), // Optional trends endpoint
        ]);

        setStats(statsResponse.data);
        if (trendsResponse) {
          setTrends(trendsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="stats-loading">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="stats-grid">
      <StatCard
        title="Total Students"
        value={stats?.students || 0}
        icon={<Users />}
        color="blue"
        trend={trends?.students}
        badge="Active Users"
      />
      <StatCard
        title="Total Teachers"
        value={stats?.teachers || 0}
        icon={<GraduationCap />}
        color="purple"
        trend={trends?.teachers}
        badge="Verified"
      />
      <StatCard
        title="Total Courses"
        value={stats?.courses || 0}
        icon={<BookOpen />}
        color="green"
        trend={trends?.courses}
        badge="Published"
      />
      <StatCard
        title="Pending Verifications"
        value={stats?.pendingVerifications || 0}
        icon={<AlertCircle />}
        color="orange"
        badge="Needs Review"
      />
    </div>
  );
};

export default StatsOverview;
