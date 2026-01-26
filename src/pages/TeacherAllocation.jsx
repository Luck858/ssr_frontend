// src/pages/TeacherAllocation.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  fetchTeachersByDepartment,
  fetchBatchesByDepartment,
  fetchSectionsByDepartment,
  createTeacherAllocation,
  fetchTeacherAllocations,
  fetchSubjectsByDepartmentAndYear,
  deleteTeacherAllocation
} from "../services/teacherAllocationService.jsx";
import { fetchDepartment } from "../services/attendanceService.jsx";

const TeacherAllocation = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    teacher: "",
    subject: "",
    department: "",
    batch: "",
    section: "A",
    year: 1,
    academicYear: "2025-2026",
  });

  useEffect(() => {
    fetchDepartments();
    fetchAllocations();
  }, []);

  // ✅ FIXED: Same department fix as SubjectManagement
  const fetchDepartments = async () => {
    try {
      const response = await fetchDepartment();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllocations = async () => {
    try {
      const data = await fetchTeacherAllocations();
      if (data.success) {
        setAllocations(data.data);
      }
    } catch (error) {
      console.error("Error fetching allocations:", error);
    }
  };

  const fetchTeachers = async (departmentId) => {
    try {
      const response = await fetchTeachersByDepartment(departmentId);
      if (response.success) {
        setTeachers(response.users || response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  };

  const fetchSubjectsByDepartment = async (departmentId, year) => {
    try {
      const data = await fetchSubjectsByDepartmentAndYear(departmentId, year);
      if (data.success) setSubjects(data.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchBatches = async (departmentId) => {
    try {
      const response = await fetchBatchesByDepartment(departmentId);
      console.log(response);
      if (response.success) {
        setBatches(response.data || response.data?.batches || []);
      }
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    }
  };

  const fetchSections = async (departmentId) => {
    try {
      const response = await fetchSectionsByDepartment(departmentId);
      if (response?.success && response.data) setSections(response.data);
      else if (Array.isArray(response)) setSections(response);
      else setSections([]);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
      setSections([]);
    }
  };

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    setFormData({ ...formData, department: departmentId, batch: "", section: "A" });
    if (departmentId) {
      fetchTeachers(departmentId);
      fetchBatches(departmentId);
      fetchSections(departmentId);
      if (formData.year) fetchSubjectsByDepartment(departmentId, formData.year);
    } else {
      setTeachers([]);
      setBatches([]);
      setSections([]);
      setSubjects([]);
    }
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setFormData({ ...formData, year: parseInt(year) });
    if (formData.department && year) fetchSubjectsByDepartment(formData.department, year);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await createTeacherAllocation(formData);
      if (data.success) {
        alert("Teacher allocated successfully!");
        fetchAllocations();
        setFormData({
          teacher: "",
          subject: "",
          department: "",
          batch: "",
          section: "A",
          year: 1,
          academicYear: "2025-2026",
        });
        setTeachers([]);
        setSubjects([]);
        setBatches([]);
        setSections([]);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this allocation?")) return;
    try {
      const data = await deleteTeacherAllocation(id);
      if (data.success) {
        alert("Allocation removed successfully");
        fetchAllocations();
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <>
      {/* ================= STYLES (EXACT SAME AS SUBJECT MANAGEMENT) ================= */}
      <style>{`
        :root {
          --primary: #ad8ff8;
          --primary-dark: #8b6fe6;
          --soft: #f5f1ff;
          --text: #1e293b;
          --muted: #64748b;
        }

        body {
          background: linear-gradient(135deg,#f7f4ff,#eef2ff);
        }

        .admin-layout {
          display: flex;
          height: 100vh;
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
        }

        .card-ui {
          background: #fff;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 10px 28px rgba(0,0,0,.08);
          margin-bottom: 22px;
        }

        .btn-main {
          background: linear-gradient(135deg,var(--primary-dark),var(--primary));
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 10px 18px;
          font-weight: 600;
        }

        .btn-danger-soft {
          background: #dc3545;
          color: #fff;
          border-radius: 12px;
          border: none;
          padding: 10px 18px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
          gap: 16px;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(200px,1fr));
          gap: 16px;
        }

        .table-wrapper {
          max-height: 420px;
          overflow: auto;
        }

        .table thead th {
          position: sticky;
          top: 0;
          background: linear-gradient(135deg,var(--primary),var(--primary-dark));
          color: #fff;
          white-space: nowrap;
          z-index: 2;
        }

        .status-pill {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          color: #fff;
          font-weight: 600;
        }

        .form-label-strong {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          font-size: 14px;
          color: var(--text);
        }

        @media (max-width: 768px) {
          .page-title { text-align: center; }
          .header-flex { justify-content: center; }
          .form-grid, .filter-grid { grid-template-columns: 1fr; }
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
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-3 header-flex flex-wrap gap-2">
            <div>
              <h1 className="page-title">Teacher Allocation</h1>
              <small className="text-muted">
                Allocate teachers to subjects for specific batches and sections
              </small>
            </div>
          </div>

          {/* ALLOCATION FORM */}
          <section className="card-ui">
            <h5 className="mb-3">Create Teacher Allocation</h5>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div>
                  <label className="form-label-strong">
                    Department <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={handleDepartmentChange}
                    required
                    className="form-control"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label-strong">
                    Year <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    value={formData.year}
                    onChange={handleYearChange}
                    required
                    className="form-control"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="form-label-strong">
                    Teacher <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    required
                    className="form-control"
                    disabled={!formData.department}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label-strong">
                    Subject <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="form-control"
                    disabled={!formData.department || !formData.year}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.subjectName} ({subject.subjectCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label-strong">
                    Batch <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    required
                    className="form-control"
                    disabled={!formData.department}
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.batchName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label-strong">
                    Section <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    required
                    className="form-control"
                    disabled={!formData.department}
                  >
                    <option value="">Select Section</option>
                    {sections.map((sec) => (
                      <option key={sec._id || sec.sectionName} value={sec.sectionName || sec._id}>
                        {sec.sectionName || sec.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1", alignSelf: "end" }}>
                  <button
                    type="submit"
                    className="btn-main"
                    style={{ 
                      padding: "12px 32px", 
                      width: "100%",
                      fontSize: "16px"
                    }}
                    disabled={!formData.department || !formData.teacher || !formData.subject || !formData.batch || !formData.section}
                  >
                    Allocate Teacher
                  </button>
                </div>
              </div>
            </form>
          </section>

          {/* TABLE */}
          <section className="card-ui">
            <h5 className="mb-3">
              Current Allocations ({allocations.length})
            </h5>

            <div className="table-wrapper">
              <table className="table table-hover table-bordered mb-0">
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Subject</th>
                    <th>Department</th>
                    <th className="text-center">Year</th>
                    <th className="text-center">Batch</th>
                    <th className="text-center">Section</th>
                    <th className="text-center">Academic Year</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-3 text-muted">
                        No allocations found
                      </td>
                    </tr>
                  ) : (
                    allocations.map((allocation) => (
                      <tr key={allocation._id}>
                        <td>
                          <strong>{allocation.teacher?.name}</strong>
                        </td>
                        <td>{allocation.subject?.subjectName}</td>
                        <td>{allocation.department?.departmentName}</td>
                        <td className="text-center">{allocation.year}</td>
                        <td className="text-center">{allocation.batch?.batchName}</td>
                        <td className="text-center">
                          <span className="status-pill" style={{ background: "#3b82f6" }}>
                            {allocation.section}
                          </span>
                        </td>
                        <td className="text-center">{allocation.academicYear}</td>
                        <td className="text-center">
                          <button
                            onClick={() => handleDelete(allocation._id)}
                            className="btn btn-sm btn-danger"
                            style={{ borderRadius: "6px" }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default TeacherAllocation;
