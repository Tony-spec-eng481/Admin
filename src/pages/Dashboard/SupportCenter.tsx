import { useEffect, useState } from "react";
import { axiosInstance as api } from '../../shared/index';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import "../../shared/styles/AdminDashboard/SupportCenter.css";

  interface Ticket {
  id: string;
  subject: string;
  message: string;
  priority: "urgent" | "high" | "normal";
  status: "open" | "in_progress" | "resolved" | "pending";
  created_at: string;
  users?: {
    name: string;
    email: string;
  };
}

const SupportCenter = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const response = await api.get("/admin/tickets");
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/tickets/${id}`, { status: newStatus });
      toast.success(`Ticket marked as ${newStatus}`);
      setTickets(
        tickets.map((t) =>
          t.id === id ? { ...t, status: newStatus as any } : t,
        ),
      );
    } catch (error) {
      toast.error("Failed to update ticket status");
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "priority-urgent";
      case "high":
        return "priority-high";
      default:
        return "priority-normal";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "resolved":
        return "status-resolved";
      case "open":
        return "status-open";
      default:
        return "status-pending";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle size={16} />;
      case "open":
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Support Tickets...</p>
      </div>
    );
  }

  const openTicketsCount = tickets.filter(
    (t) => t.status !== "resolved",
  ).length;

  return (
    <div className="support-center">
      <div className="support-space">
        <div className="support-header">
          <h2 className="header-title">Support Center</h2>
          <div className="stats-badge">
            <MessageSquare size={16} />
            {openTicketsCount} Open{" "}
            {openTicketsCount === 1 ? "Ticket" : "Tickets"}
          </div>
        </div>

        <div className="tickets-grid">
          {tickets.length === 0 ? (
            <div className="empty-state">
              <MessageSquare className="empty-state-icon" size={48} />
              <p>No support tickets found.</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-content">
                  <div className="ticket-header">
                    <span
                      className={`priority-badge ${getPriorityClass(ticket.priority)}`}
                    >
                      {ticket.priority}
                    </span>
                    <h3 className="ticket-subject">{ticket.subject}</h3>
                  </div>

                  <p className="ticket-message">{ticket.message}</p>

                  <div className="ticket-meta">
                    <span className="meta-item user">
                      <User size={12} /> {ticket.users?.name || "Unknown"}
                    </span>
                    <span className="meta-item email">
                      <Mail size={12} /> {ticket.users?.email || "No email"}
                    </span>
                    <span className="meta-item time">
                      <Calendar size={12} /> {formatDate(ticket.created_at)}
                    </span>
                  </div>
                </div>

                <div className="ticket-actions">
                  <span
                    className={`status-badge ${getStatusClass(ticket.status)}`}
                  >
                    {getStatusIcon(ticket.status)}
                    <span className="capitalize">
                      {ticket.status.replace("_", " ")}
                    </span>
                  </span>

                  {ticket.status !== "resolved" && (
                    <button
                      onClick={() => handleStatusChange(ticket.id, "resolved")}
                      className="resolve-button"
                    >
                      <CheckCircle size={16} />
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Optional: Summary Stats */}
        {tickets.length > 0 && (
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Total Tickets</span>
              <span className="stat-value">{tickets.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Resolved</span>
              <span className="stat-value">
                {tickets.filter((t) => t.status === "resolved").length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Urgent</span>
              <span className="stat-value">
                {tickets.filter((t) => t.priority === "urgent").length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Response</span>
              <span className="stat-value">&lt; 2h</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportCenter;
