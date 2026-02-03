// src/pages/AdminRegisterUser.jsx
import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { UserPlus, CheckCircle, AlertCircle, ClipboardList } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { adminRegisterUser, getAllUsers } from "../services/authService";
import { getAllDepartments } from "../services/departmentService";
import { fetchBatchesByDepartment, fetchSectionsByDepartment, fetchCoursesByDepartment } from '../services/teacherAllocationService.jsx';
import { getAllCourses, fetchDepartementsByCousresData, fetchSemsterByDepartment } from '../services/feeCreateService.jsx';

const AdminRegisterUser = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    course: "",
    batch: "",
    section: "",
    semester: "",
    phone: "",
    enrollmentId: "",
    employeeId: "",
    canRegisterStudents: false,
    joiningYear: '',
    designation: '',
    dob: '',
    photoFile: null,
    photo: '',
    bloodGroup: '',
    officialDetails: '',
    panNumber: '',
    aadhaarNumber: '',
    salary: '',
    address: '',
    remarks: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [recentUsers, setRecentUsers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
const [courseDepartments, setCourseDepartments] = useState([]);

  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [photoPreview, setPhotoPreview] = useState(null);

  // 🕐 Initial Load
  useEffect(() => {
    fetchRecentUsers();
    fetchAllCoursesList();
    fetchAllDepartmentsList();
    if (location && location.state && location.state.prefill) {
      const p = location.state.prefill;
      setFormData((prev) => ({ ...prev, ...p }));
      if (p.department) {
        fetchBatches(p.department);
        fetchSections(p.department);
        fetchSemesters(p.department);
      }
      try { window.history.replaceState({}, document.title); } catch (e) {}
    }
  }, [location]);

  const fetchRecentUsers = async () => {
    try {
      const response = await getAllUsers({ limit: 10 });
      if (response.success) setRecentUsers(response.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAllDepartmentsList = async () => {
    try {
      const response = await getAllDepartments();
      console.log('Departments fetched:', response);
      if (response.success) {
        setAllDepartments(response.data);
      } else {
        console.warn('Failed to fetch departments:', response);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchAllCoursesList = async () => {
    try {
      const response = await getAllCourses();
      if (response.success) {
        setAllCourses(response.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchSemesters = async (departmentId) => {
    try {
      const response = await fetchSemsterByDepartment(departmentId);
      if (response.success) {
        setSemesters(response.data);
      } else {
        setSemesters([]);
      }
    } catch (err) {
      setSemesters([]);
    }
  };

  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    console.log('Selected course ID:', courseId);
    
    if (!courseId) {
      setFormData({
        ...formData,
        course: courseId,
        department: "",
        batch: "",
        section: "",
        semester: "",
      });
     setCourseDepartments([]);
      setBatches([]);
      setSections([]);
      setSemesters([]);
      return;
    }

    try {
      const response = await fetchDepartementsByCousresData(courseId);
      
      if (response.success && response.data && response.data.length > 0) {
        setCourseDepartments(response.data);
        
        setFormData({
          ...formData,
          course: courseId,
          department: "",
          batch: "",
          section: "",
          semester: "",
        });
        
        setBatches([]);
        setSections([]);
        setSemesters([]);
      } else {
        setMessage({ type: "error", text: "No departments found for this course" });
        setCourseDepartments([]);
      }
    } catch (error) {
      console.error("Failed to fetch department:", error);
      setMessage({ type: "error", text: "Failed to fetch department for this course" });
      setCourseDepartments([]);
    }
  };

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setFormData({
      ...formData,
      batch: batchId,
      section: "",
    });
  };

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    setFormData({
      ...formData,
      department: departmentId,
      batch: "",
      section: "",
      semester: "",
    });
    setBatches([]);
    setSections([]);
    setSemesters([]);
    if (departmentId) {
      fetchBatches(departmentId);
      fetchSections(departmentId);
      fetchSemesters(departmentId);
    }
  };

  const isFormComplete = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.role) return false;
    if (!formData.phone) return false;

    if (formData.role === 'student') {
      if (!formData.course || !formData.department || !formData.batch || !formData.section || !formData.enrollmentId) return false;
    }

    if (formData.role === 'teacher') {
      if (!formData.department || !formData.employeeId) return false;
      if (!formData.joiningYear || !formData.designation || !formData.dob) return false;
      if (!formData.photoFile) return false;
      if (!formData.bloodGroup || !formData.officialDetails || !formData.panNumber || !formData.aadhaarNumber) return false;
      if (!formData.salary && formData.salary !== 0) return false;
      if (!formData.address || !formData.remarks) return false;
    }

    return true;
  };

  const fetchBatches = async (departmentId) => {
    try {
      const response = await fetchBatchesByDepartment(departmentId);
      if (response.success) {
        setBatches(response.data);
      } else {
        setBatches([]);
      }
    } catch (err) {
      setBatches([]);
    }
  };

  const fetchSections = async (departmentId) => {
    try {
      const response = await fetchSectionsByDepartment(departmentId);
      if (response && response.success) {
        setSections(response.data);
      } else if (Array.isArray(response)) {
        setSections(response);
      } else {
        setSections([]);
      }
    } catch (err) {
      console.error('Failed to fetch sections:', err);
      setSections([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'file') {
      const file = e.target.files[0];
      setFormData({ ...formData, [name]: file, photoFile: file });
      if (file) setPhotoPreview(URL.createObjectURL(file));
      return;
    }
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!isFormComplete()) {
      setMessage({ type: "error", text: "Please fill in all required fields before registering." });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      
      // Add all string and basic fields
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('password', formData.password);
      payload.append('role', formData.role);
      payload.append('phone', formData.phone);
      payload.append('department', formData.department);
      
      if (formData.role === 'student') {
        payload.append('course', formData.course);
        payload.append('batch', formData.batch);
        payload.append('section', formData.section);
        payload.append('semester', formData.semester);
        payload.append('enrollmentId', formData.enrollmentId);
      }
      
      if (formData.role === 'teacher') {
        payload.append('employeeId', formData.employeeId);
        payload.append('joiningYear', formData.joiningYear);
        payload.append('designation', formData.designation);
        payload.append('dob', formData.dob);
        payload.append('bloodGroup', formData.bloodGroup);
        payload.append('officialDetails', formData.officialDetails);
        payload.append('panNumber', formData.panNumber);
        payload.append('aadhaarNumber', formData.aadhaarNumber);
        payload.append('salary', formData.salary);
        payload.append('address', formData.address);
        payload.append('remarks', formData.remarks);
        payload.append('canRegisterStudents', formData.canRegisterStudents);
        
        // Add photo file directly
        if (formData.photoFile) {
          payload.append('photo', formData.photoFile);
        }
      }

      const response = await adminRegisterUser(payload);
      if (response.success) {
        setMessage({ type: "success", text: "User registered successfully!" });
        setFormData({
          name: '', email: '', password: '', role: 'student', department: '',
          course: '', batch: '', section: '', phone: '', enrollmentId: '', employeeId: '',
          canRegisterStudents: false, joiningYear: "", designation: '', dob: '',
          photoFile: null, photo: '', bloodGroup: '', officialDetails: '',
          panNumber: '', aadhaarNumber: '', salary: '', address: '', remarks: '',
        });
        fetchRecentUsers();
        setPhotoPreview(null);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to register user.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --primary: #ad8ff8;
          --primary-dark: #8b6fe6;
          --soft: #f5f1ff;
          --text: #1e293b;
          --muted: #64748b;
          --success: #10b981;
          --danger: #ef4444;
        }

        body {
          background: linear-gradient(135deg,#f7f4ff,#eef2ff);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .admin-layout {
          display: flex;
          min-height: 100vh;
          overflow: hidden;
        }

        .main-content {
          flex: 1;
          padding: clamp(14px, 2vw, 32px);
          transition: margin-left .35s ease;
          overflow-y: auto;
        }

        .page-title {
          font-size: clamp(20px, 2.5vw, 28px);
          font-weight: 700;
          color: var(--primary-dark);
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .page-subtitle {
          color: var(--muted);
          font-size: 14px;
        }

        .header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
        }

        .card-ui {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 10px 28px rgba(0,0,0,.08);
          margin-bottom: 24px;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .form-grid-full {
          grid-template-columns: 1fr;
        }

        .form-label-strong {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 14px;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-input, .form-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 15px;
          transition: all 0.3s ease;
          background: #fff;
          font-family: inherit;
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: var(--primary-dark);
          box-shadow: 0 0 0 3px rgba(139,111,230,0.1);
        }

        .form-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .btn-main {
          background: linear-gradient(135deg,var(--primary-dark),var(--primary));
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 16px 32px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          grid-column: 1 / -1;
        }

        .btn-main:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(139,111,230,0.3);
        }

        .btn-main:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .message {
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
        }

        .message.success {
          background: rgba(16,185,129,0.1);
          color: var(--success);
          border: 1px solid rgba(16,185,129,0.2);
        }

        .message.error {
          background: rgba(239,68,68,0.1);
          color: var(--danger);
          border: 1px solid rgba(239,68,68,0.2);
        }

        .section-title {
          color: var(--text);
          font-weight: 600;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
        }

        .photo-preview {
          margin-top: 12px;
          text-align: center;
        }

        .photo-preview img {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 12px;
          border: 3px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .users-table-container {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.06);
          overflow: hidden;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table thead th {
          position: sticky;
          top: 0;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #fff;
          padding: 16px 12px;
          font-weight: 600;
          font-size: 14px;
          white-space: nowrap;
          z-index: 10;
        }

        .users-table tbody td {
          padding: 16px 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        .users-table tbody tr:hover {
          background: #fdf2ff;
        }

        .role-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
        }

        .role-badge.student { background: #10b981; }
        .role-badge.teacher { background: var(--primary-dark); }

        .checkbox-group {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 10px;
          border: 2px solid #e2e8f0;
        }

        .checkbox-group input[type="checkbox"] {
          width: 20px;
          height: 20px;
          margin: 0;
          accent-color: var(--primary-dark);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--muted);
        }

        @media (max-width: 992px) {
          .main-content { margin-left: 80px !important; }
          .form-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .main-content { 
            padding: 20px 16px; 
            margin-left: 0 !important;
          }
          .header-flex { 
            justify-content: center; 
            text-align: center; 
            flex-direction: column;
          }
          .form-grid { 
            grid-template-columns: 1fr; 
            gap: 16px;
          }
          .card-ui { padding: 20px 16px; }
          .users-table thead { display: none; }
          .users-table tbody tr { 
            display: block; 
            margin-bottom: 16px; 
            padding: 16px;
            border-radius: 12px;
            background: #fafafa;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          .users-table tbody td { 
            display: block; 
            padding: 8px 0;
            border: none;
            position: relative;
            padding-left: 40%;
          }
          .users-table tbody td:before {
            content: attr(data-label);
            position: absolute;
            left: 12px;
            font-weight: 600;
            color: var(--text);
            width: 35%;
          }
        }

        @media (max-width: 480px) {
          .card-ui { padding: 16px 12px; }
          .photo-preview img { width: 100px; height: 100px; }
        }
      `}</style>

      <div className="admin-layout">
        <Sidebar onToggle={setSidebarOpen} />

        <main
          className="main-content"
          style={{
            marginLeft: sidebarOpen ? "250px" : "80px",
          }}
        >
          <div className="header-flex">
            <div>
              <h1 className="page-title">
                <UserPlus size={24} />
                Register New User
              </h1>
              <small className="page-subtitle">
                Create new student or teacher accounts with complete profile details
              </small>
            </div>
          </div>

          <section className="card-ui">
            <h3 className="section-title">User Registration</h3>
            
            {message.text && (
              <div className={`message ${message.type}`}>
                {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label className="form-label-strong">Full Name <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="form-label-strong">Email Address <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="form-label-strong">Password <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password (min 6 chars)"
                    required
                  />
                </div>

                <div>
                  <label className="form-label-strong">Role <span style={{ color: "#ef4444" }}>*</span></label>
                  <select
                    name="role"
                    className="form-select form-input"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>

                {formData.role === 'student' && (
                  <>
                    <div>
                      <label className="form-label-strong">Course <span style={{ color: "#ef4444" }}>*</span></label>
                      <select
                        name="course"
                        className="form-select form-input"
                        value={formData.course}
                        onChange={handleCourseChange}
                        required
                      >
                        <option value="">Select Course</option>
                        {allCourses && allCourses.length > 0 ? (
                          allCourses.map((course) => (
                            <option key={course._id || Math.random()} value={course._id}>
                              {course.courseName}
                            </option>
                          ))
                        ) : (
                          <option disabled>No courses available</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="form-label-strong">Department <span style={{ color: "#ef4444" }}>*</span></label>
                      <select
                        name="department"
                        className="form-select form-input"
                        value={formData.department}
                        onChange={handleDepartmentChange}
                        disabled={!formData.course}
                        required
                      >
                        <option value="">Auto-populated from Course</option>
                       {courseDepartments.length > 0 ? (
  courseDepartments.map((dep) => (
    <option key={dep._id} value={dep._id}>
      {dep.departmentName}
    </option>
  ))
) : (
  <option disabled>No departments available</option>
)}

                      </select>
                    </div>
                  </>
                )}

                {formData.role === 'teacher' && (
                  <div>
                    <label className="form-label-strong">Department <span style={{ color: "#ef4444" }}>*</span></label>
                    <select
                      name="department"
                      className="form-select form-input"
                      value={formData.department}
                      onChange={handleDepartmentChange}
                      required
                    >
                      <option value="">Select Department</option>
                    {allDepartments.length > 0 ? (
  allDepartments.map((dep) => (
    <option key={dep._id} value={dep._id}>
      {dep.departmentName}
    </option>
  ))
) : (
  <option disabled>No departments available</option>
)}

                    </select>
                  </div>
                )}

                <div>
                  <label className="form-label-strong">Phone Number <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {formData.role === 'student' && (
                <div className="form-grid">
                  <div>
                    <label className="form-label-strong">Batch <span style={{ color: "#ef4444" }}>*</span></label>
                    <select
                      name="batch"
                      className="form-select form-input"
                      value={formData.batch}
                      onChange={handleBatchChange}
                      disabled={!formData.department}
                      required
                    >
                      <option value="">Select Batch</option>
                      {batches && batches.length > 0 ? (
                        batches.map((batch) => (
                          <option key={batch._id || Math.random()} value={batch._id}>
                            {batch.batchName}
                          </option>
                        ))
                      ) : (
                        <option disabled>No batches available</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="form-label-strong">Semester <span style={{ color: "#ef4444" }}>*</span></label>
                    <select
                      name="semester"
                      className="form-select form-input"
                      value={formData.semester}
                      onChange={handleChange}
                      disabled={!formData.department}
                      required
                    >
                      <option value="">Select Semester</option>
                      {semesters && semesters.length > 0 ? (
                        semesters.map((sem) => (
                          <option key={sem._id || Math.random()} value={sem._id}>
                            Semester {sem.semesterName}
                          </option>
                        ))
                      ) : (
                        <option disabled>No semesters available</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="form-label-strong">Section <span style={{ color: "#ef4444" }}>*</span></label>
                    <select
                      name="section"
                      className="form-select form-input"
                      value={formData.section}
                      onChange={handleChange}
                      disabled={!formData.department}
                      required
                    >
                      <option value="">Select Section</option>
                      {sections && sections.length > 0 ? (
                        sections.map((sec, idx) => (
                          <option key={sec._id || `section-${idx}`} value={sec.sectionName || sec._id}>
                            {sec.sectionName || sec.section}
                          </option>
                        ))
                      ) : (
                        <option disabled>No sections available</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="form-label-strong">Enrollment ID <span style={{ color: "#ef4444" }}>*</span></label>
                    <input
                      type="text"
                      name="enrollmentId"
                      className="form-input"
                      placeholder="Enter enrollment ID"
                      value={formData.enrollmentId}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              {formData.role === 'teacher' && (
                <>
                  <div className="form-grid">
                    <div>
                      <label className="form-label-strong">Employee ID <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        type="text"
                        name="employeeId"
                        className="form-input"
                        placeholder="Enter employee ID"
                        value={formData.employeeId}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="form-label-strong">Joining Year <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        type="number"
                        name="joiningYear"
                        className="form-input"
                        placeholder="Enter joining year"
                        value={formData.joiningYear}
                        onChange={handleChange}
                        min="1990"
                        max={new Date().getFullYear()}
                      />
                    </div>

                    <div>
                      <label className="form-label-strong">Designation <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        type="text"
                        name="designation"
                        className="form-input"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="Enter designation"
                      />
                    </div>

                    <div>
                      <label className="form-label-strong">Date of Birth <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        type="date"
                        name="dob"
                        className="form-input"
                        value={formData.dob}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="form-label-strong">Blood Group <span style={{ color: "#ef4444" }}>*</span></label>
                      <select name="bloodGroup" className="form-select form-input" value={formData.bloodGroup} onChange={handleChange}>
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label-strong">Salary <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        type="number"
                        name="salary"
                        className="form-input"
                        value={formData.salary}
                        onChange={handleChange}
                        placeholder="Enter salary"
                      />
                    </div>

                    <div>
                      <label className="form-label-strong">PAN Number <span style={{ color: "#ef4444" }}>*</span></label>
                      <input type="text" name="panNumber" className="form-input" value={formData.panNumber} onChange={handleChange} />
                    </div>

                    <div>
                      <label className="form-label-strong">Aadhaar Number <span style={{ color: "#ef4444" }}>*</span></label>
                      <input type="text" name="aadhaarNumber" className="form-input" value={formData.aadhaarNumber} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-grid-full">
                      <label className="form-label-strong">Official / Employment Details <span style={{ color: "#ef4444" }}>*</span></label>
                      <textarea 
                        name="officialDetails" 
                        className="form-input form-textarea" 
                        value={formData.officialDetails} 
                        onChange={handleChange} 
                        placeholder="Add official/employment details" 
                      />
                    </div>

                    <div className="form-grid-full">
                      <label className="form-label-strong">Address <span style={{ color: "#ef4444" }}>*</span></label>
                      <textarea 
                        name="address" 
                        className="form-input form-textarea" 
                        value={formData.address} 
                        onChange={handleChange} 
                        placeholder="Enter complete address" 
                      />
                    </div>

                    <div className="form-grid-full">
                      <label className="form-label-strong">Remarks / Notes <span style={{ color: "#ef4444" }}>*</span></label>
                      <textarea 
                        name="remarks" 
                        className="form-input form-textarea" 
                        value={formData.remarks} 
                        onChange={handleChange} 
                        placeholder="Any additional remarks" 
                      />
                    </div>
                  </div>

                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      name="canRegisterStudents"
                      checked={formData.canRegisterStudents}
                      onChange={handleChange}
                    />
                    <span style={{ fontWeight: 500, color: '#1e293b' }}>Allow teacher to register students</span>
                  </div>

                  <div>
                    <label className="form-label-strong">Photo <span style={{ color: "#ef4444" }}>*</span></label>
                    <input type="file" name="photoFile" accept="image/*" onChange={handleChange} className="form-input" />
                    {photoPreview && (
                      <div className="photo-preview">
                        <img src={photoPreview} alt="Preview" />
                        <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0 0 0' }}>Photo preview</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              <button 
                type="submit" 
                className="btn-main" 
                disabled={submitting || !isFormComplete()}
              >
                {submitting ? "Registering User..." : "Register User"}
              </button>
            </form>
          </section>

          <section className="card-ui">
            <h3 className="section-title">
              <ClipboardList size={20} />
              Recently Created Users
            </h3>
            <div className="users-table-container">
              {recentUsers.length > 0 ? (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Section/Batch</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user._id}>
                        <td data-label="Name">{user.name}</td>
                        <td data-label="Email">{user.email}</td>
                        <td data-label="Role">
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td data-label="Department">{user.department || "-"}</td>
                        <td data-label="Section/Batch">{user.section || user.batch || "-"}</td>
                        <td data-label="Created">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>👥</div>
                  No users created yet
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default AdminRegisterUser;
