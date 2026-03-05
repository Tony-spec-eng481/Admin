import { useEffect, useState } from "react";
import { axiosInstance as api } from '../../shared/index';
import { Bell, Plus, Trash2, Calendar, Target, X, Send, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import "../../shared/styles/AdminDashboard/Announcements.css";

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_role: "all" | "student" | "teacher";
  created_at: string;
  expires_at?: string;
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    target_role: "all" as "all" | "student" | "teacher",
    expires_at: "",
  });

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get("/admin/announcements");
      setAnnouncements(response.data);
    } catch (error) {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/announcements", newAnnouncement);
      toast.success("Announcement posted successfully");
      setShowModal(false);
      setNewAnnouncement({
        title: "",
        content: "",
        target_role: "all",
        expires_at: "",
      });
      fetchAnnouncements();
    } catch (error) {
      toast.error("Failed to post announcement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?"))
      return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      toast.success("Announcement deleted");
      fetchAnnouncements();
    } catch (error) {
      toast.error("Failed to delete announcement");
    }
  };

  const getTargetClass = (role: string) => {
    switch (role) {
      case "all":
        return "all";
      case "teacher":
        return "teacher";
      case "student":
        return "student";
      default:
        return "all";
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
        <p className="loading-text">Loading Announcements...</p>
      </div>
    );
  }

  return (
    <div className="announcements-container">
      <div className="announcements-space">
        <div className="announcements-header">
          <div className="header-title">
            <h2>Announcements</h2>
            <p className="header-subtitle">
              Broadcast news and updates to specific user groups.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <a 
              href="https://chat.whatsapp.com/YOUR_INVITE_LINK_HERE" 
              target="_blank" 
              rel="noopener noreferrer"
              className="new-announcement-btn"
              style={{ background: '#25D366', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <MessageCircle size={18} /> Join WhatsApp Group
            </a>
            <button
              onClick={() => setShowModal(true)}
              className="new-announcement-btn"
            >
              <Plus size={18} /> New Announcement
            </button>
          </div>
        </div>

        <div className="announcements-grid">
          {announcements.length === 0 ? (
            <div className="empty-state">
              <Bell className="empty-state-icon" size={48} />
              <p>No active announcements</p>
            </div>
          ) : (
            announcements.map((item) => (
              <div key={item.id} className="announcement-card">
                <div className="card-header">
                  <span
                    className={`target-badge ${getTargetClass(item.target_role)}`}
                  >
                    <Target size={10} />
                    {item.target_role === "all" ? "Everyone" : item.target_role}
                  </span>
                  <span className="card-date">
                    <Calendar size={10} /> {formatDate(item.created_at)}
                  </span>
                </div>

                <h3 className="announcement-title">{item.title}</h3>
                <p className="announcement-content">{item.content}</p>

                <div className="card-footer">
                  <span className="expiry-text">
                    {item.expires_at
                      ? `Expires: ${formatDate(item.expires_at)}`
                      : "Never expires"}
                  </span>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(item.id)}
                    title="Delete announcement"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <Bell className="modal-header-icon" size={24} />
                <h2 className="modal-header-title">New Announcement</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Platform Update..."
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      title: e.target.value,
                    })
                  }
                  style={{ color: "white" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <select
                  className="form-select"
                  value={newAnnouncement.target_role}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      target_role: e.target.value as any,
                    })
                  }
                  style={{ color: "white" }}
                >
                  <option value="all">All Users</option>
                  <option value="student">Students Only</option>
                  <option value="teacher">Teachers Only</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea
                  required
                  rows={5}
                  className="form-textarea"
                  placeholder="Write your announcement message here..."
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      content: e.target.value,
                    })
                  }
                  style={{ color: "white" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date (Optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={newAnnouncement.expires_at}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      expires_at: e.target.value,
                    })
                  }
                  style={{ color: "white" }}
                />
              </div>

              <button type="submit" className="submit-button">
                <Send size={18} /> Post Announcement
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
