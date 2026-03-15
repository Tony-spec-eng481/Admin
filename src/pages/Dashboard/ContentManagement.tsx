import { useEffect, useState } from "react";
import { axiosInstance as api } from '../../shared/index';
import {
  Check,
  X,
  Film,
  FileText,
  HelpCircle,
  BookOpen,
  Clock,
  User,
  ChevronRight,
  ChevronLeft,
  Settings,
  Edit,
  Mic,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import "../styles/ContentManagement.css";

const ViewState = {
  COURSES: 'COURSES',
  UNITS: 'UNITS',
  TOPICS: 'TOPICS',
} as const;

type ViewStateType = typeof ViewState[keyof typeof ViewState];

interface Course {
  id: string;
  title: string;
  short_code: string;
  description: string;
  thumbnail_url?: string;
  department?: {
    name: string;
    short_code: string;
  };
  users?: {
    name: string;
    email: string;
  };
  created_at: string;
}

interface Unit {
  id: string;
  title: string;
  description: string;
  short_code: string;
  semester: number;
  year: number;
}

interface Topic {
  id: string;
  title: string;
  notes: string;
  video_url: string;
  notes_url: string;
  audio_intro_url: string;
  content_type: string;
  sequence_number: number;
}

const ContentManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [viewState, setViewState] = useState<ViewStateType>(ViewState.COURSES);
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Topic>>({});

  const fetchCourses = async () => {
    try {
      setInitialLoading(true);
      const response = await api.get("/admin/courses/all");
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchUnits = async (courseId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/courses/${courseId}/units`);
      setUnits(response.data);
      setViewState(ViewState.UNITS);
    } catch (error) {
      console.error("Error fetching units:", error);
      toast.error("Failed to load units");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (unitId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/units/${unitId}/topics`);
      setTopics(response.data);
      setViewState(ViewState.TOPICS);
    } catch (error) {
      console.error("Error fetching topics:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    fetchUnits(course.id);
  };

  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(unit);
    fetchTopics(unit.id);
  };

  const handleBackToCourses = () => {
    setViewState(ViewState.COURSES);
    setSelectedCourse(null);
    setSelectedUnit(null);
  };

  const handleBackToUnits = () => {
    setViewState(ViewState.UNITS);
    setSelectedUnit(null);
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setEditFormData(topic);
  };

  const handleSaveTopic = async () => {
    if (!editingTopic) return;
    try {
      const response = await api.patch(`/admin/topics/${editingTopic.id}`, editFormData);
      setTopics(topics.map(t => t.id === editingTopic.id ? response.data : t));
      setEditingTopic(null);
      toast.success("Content updated successfully");
    } catch (error) {
      toast.error("Failed to update content");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTopicIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'video': return <Film size={20} />;
      case 'notes': return <FileText size={20} />;
      case 'audio': return <Mic size={20} />;
      default: return <BookOpen size={20} />;
    }
  };

  if (initialLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="content-management">
      <div className="content-space">
        <div className="content-header">
          <h2 className="header-title">
            {viewState === ViewState.COURSES && "Course Management"}
            {viewState === ViewState.UNITS && "Course Units"}
            {viewState === ViewState.TOPICS && "Unit Contents"}
          </h2>
          {viewState === ViewState.COURSES && (
            <div className="pending-badge">
              <BookOpen size={16} />
              Total Courses
              <span>{courses.length}</span>
            </div>
          )}
        </div>

        {/* Breadcrumbs */}
        <div className="breadcrumb">
          <span onClick={handleBackToCourses}>Courses</span>
          {selectedCourse && (
            <>
              <ChevronRight size={14} />
              <span onClick={viewState === ViewState.TOPICS ? handleBackToUnits : undefined} className={viewState === ViewState.UNITS ? "current" : ""}>
                {selectedCourse.short_code}
              </span>
            </>
          )}
          {selectedUnit && (
            <>
              <ChevronRight size={14} />
              <span className="current">{selectedUnit.title}</span>
            </>
          )}
        </div>

        {/* Courses View */}
        {viewState === ViewState.COURSES && (
          <div className="content-grid">
            {courses.length === 0 ? (
              <div className="empty-state">
                <BookOpen className="empty-state-icon" size={48} />
                <p>No courses found.</p>
              </div>
            ) : (
              courses.map((course) => (
                <div key={course.id} className="course-card" onClick={() => handleCourseClick(course)}>
                  {/* ... same content ... */}
                  <div className="thumbnail-container">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="thumbnail-image" />
                    ) : (
                      <div className="thumbnail-placeholder">
                        <BookOpen size={40} />
                      </div>
                    )}
                    <div className="course-badge">{course.short_code}</div>
                  </div>

                  <div className="course-content">
                    <div>
                      <h3 className="course-title">{course.title}</h3>
                      <p className="submitter-info">
                        <User size={14} />
                        Dept: <span className="submitter-name">{course.department?.name || "General"}</span>
                        <span className="text-xs ml-2">{formatDate(course.created_at)}</span>
                      </p>
                    </div>
                    <p className="course-description">{course.description}</p>
                    <div className="content-tags">
                       <span className="content-tag video"><Film size={14} /> View Units</span>
                    </div>
                  </div>
                  <div className="action-buttons">
                    <button className="approve-button">
                       Browse Units <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Units View */}
        {viewState === ViewState.UNITS && (
          <div className="units-grid">
            <button className="back-button" onClick={handleBackToCourses}>
              <ChevronLeft size={20} /> Back to Courses
            </button>
            <div className="w-full"></div>
            {loading ? (
               <div className="loading-state w-full"><div className="loading-spinner"></div></div>
            ) : units.length === 0 ? (
              <div className="empty-state w-full">
                <BookOpen className="empty-state-icon" size={48} />
                <p>No units found for this course.</p>
              </div>
            ) : (
              units.map((unit) => (
                <div key={unit.id} className="unit-card" onClick={() => handleUnitClick(unit)}>
                  <div className="unit-title">{unit.title}</div>
                  <div className="submitter-info">
                    <Settings size={14} />
                    <span>Year {unit.year} • Semester {unit.semester}</span>
                  </div>
                  <div className="course-description mt-2">{unit.short_code}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Topics View */}
        {viewState === ViewState.TOPICS && (
          <div className="topics-list">
            <button className="back-button" onClick={handleBackToUnits}>
              <ChevronLeft size={20} /> Back to Units
            </button>
            {loading ? (
               <div className="loading-state"><div className="loading-spinner"></div></div>
            ) : topics.length === 0 ? (
              <div className="empty-state">
                <BookOpen className="empty-state-icon" size={48} />
                <p>No contents found for this unit.</p>
              </div>
            ) : (
              topics.map((topic) => (
                <div key={topic.id} className="topic-item">
                  <div className="topic-info">
                    <div className="topic-icon">
                      {getTopicIcon(topic.content_type)}
                    </div>
                    <div className="topic-details">
                      <h4>{topic.title}</h4>
                      <p>{topic.content_type} • Sequence {topic.sequence_number}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button className="edit-btn" onClick={() => handleEditTopic(topic)}>
                        <Edit size={18} /> Edit
                     </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Edit Topic Modal */}
        {editingTopic && (
          <div className="edit-form-overlay">
            <div className="edit-form-content">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Edit Content</h3>
                <button className="text-muted hover:text-danger" onClick={() => setEditingTopic(null)}>
                  <X size={24} />
                </button>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  value={editFormData.title || ""} 
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Video URL</label>
                <input 
                  type="text" 
                  value={editFormData.video_url || ""} 
                  onChange={(e) => setEditFormData({...editFormData, video_url: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Notes (Text)</label>
                <textarea 
                  rows={4}
                  value={editFormData.notes || ""} 
                  onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Sequence Number</label>
                <input 
                  type="number" 
                  value={editFormData.sequence_number || 0} 
                  onChange={(e) => setEditFormData({...editFormData, sequence_number: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-actions">
                <button className="cancel-btn" onClick={() => setEditingTopic(null)}>Cancel</button>
                <button className="save-btn" onClick={handleSaveTopic}>Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManagement;
