import { useEffect, useState } from "react";
import { axiosInstance as api } from '../../shared/index';
import { TrendingUp, CheckCircle, Search, Filter, Mail } from "lucide-react";
import toast from "react-hot-toast";
import "../../shared/styles/AdminDashboard/StudentManagement.css";

interface StudentStats {
  progress: number;
  courses: number;
  completed: number;
  score: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  student_details?: {
    student_id: string;
  };
  stats: StudentStats;
}

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get("/admin/users?role=student");
        // Mocking progress data - replace with actual API data
        const studentsWithStats = response.data.map((s: any) => ({
          ...s,
          stats: {
            progress: Math.floor(Math.random() * 100),
            courses: Math.floor(Math.random() * 8) + 1,
            completed: Math.floor(Math.random() * 5),
            score: Math.floor(Math.random() * 20) + 80,
          },
        }));
        setStudents(studentsWithStats);
      } catch (error) {
        toast.error("Failed to load student data");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "active") return matchesSearch && s.stats.progress < 100;
    if (filter === "completed") return matchesSearch && s.stats.progress >= 100;

    return matchesSearch;
  });

  const getStatusBadge = (progress: number) => {
    if (progress >= 90) {
      return (
        <span className="status-badge ontrack">
          <CheckCircle size={10} /> On Track
        </span>
      );
    }
    return (
      <span className="status-badge learning">
        <CheckCircle size={10} /> Learning
      </span>
    );
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Student Management...</p>
      </div>
    );
  }

  return (
    <div className="student-management">
      <div className="student-space">
        <div className="student-header">
          <div>
            <h2 className="header-title">Student Progress & Enrollment</h2>
            <p className="header-subtitle">
              Track learning activity and performance across all courses.
            </p>
          </div>
          <div className="search-section">
            <div className="search-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search students by name or email..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="filter-button"
              onClick={() =>
                setFilter(
                  filter === "all"
                    ? "active"
                    : filter === "active"
                      ? "completed"
                      : "all",
                )
              }
              title={`Current filter: ${filter}`}
            >  
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="student-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Courses</th>
                <th>Course Progress</th>
                <th>Avg Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    <Search size={48} className="empty-state-icon" />
                    <p>No students found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-info">
                        <div className="student-avatar">{student.name[0]}</div>
                        <div className="student-details">
                          <span className="student-name">{student.name}</span>
                          <span className="student-email">
                            <Mail size={10} />
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="courses-cell">
                        {student.stats.courses}
                        <span className="courses-count">enrolled</span>
                      </span>
                    </td>
                    <td>
                      <div className="progress-container">
                        <div className="progress-header">
                          <span className="progress-percentage">
                            {student.stats.progress}%
                          </span>
                          <span className="completed-count">
                            {student.stats.completed} finished
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${student.stats.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="score-cell">
                        <TrendingUp className="score-icon" size={14} />
                        {student.stats.score}%
                      </div>
                    </td>
                    <td>{getStatusBadge(student.stats.progress)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{students.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active Learners</span>
            <span className="stat-value">
              {students.filter((s) => s.stats.progress < 100).length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed Courses</span>
            <span className="stat-value">
              {students.reduce((acc, s) => acc + s.stats.completed, 0)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg. Score</span>
            <span className="stat-value">
              {Math.round(
                students.reduce((acc, s) => acc + s.stats.score, 0) /
                  students.length,
              )}
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
