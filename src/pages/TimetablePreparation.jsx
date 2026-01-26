// src/pages/TimetablePreparation.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  fetchBatchesByDepartment,
  fetchTeacherandSubjectAllocations,
  createTimetable,
  fetchTimetablebyBatchandSection,
} from "../services/timetableService.jsx";
import { fetchDepartment } from "../services/attendanceService.jsx";

const TimetablePreparation = () => {
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSection, setSelectedSection] = useState("A");

  const [formData, setFormData] = useState({
    dayOfWeek: "Monday",
    periodNumber: 1,
    startTime: "09:00",
    endTime: "10:00",
    teacherAllocation: "",
    roomNumber: "",
    academicYear: "2025-2026",
  });

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [filteredAllocations, setFilteredAllocations] = useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periods = [
    { number: 1, start: "09:00", end: "10:00" },
    { number: 2, start: "10:00", end: "11:00" },
    { number: 3, start: "11:00", end: "12:00" },
    { number: 4, start: "12:00", end: "13:00" },
    { number: 5, start: "14:00", end: "15:00" },
    { number: 6, start: "15:00", end: "16:00" },
    { number: 7, start: "16:00", end: "17:00" },
    { number: 8, start: "17:00", end: "18:00" },
  ];

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedBatch && selectedSection) {
      fetchTimetable();
    }
  }, [selectedBatch, selectedSection]);

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

  const fetchBatches = async (departmentId) => {
    try {
      const response = await fetchBatchesByDepartment(departmentId);
      console.log(batches);
      if (response.success) {
        setBatches(response.data.batches || response.data);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const fetchAllocations = async (departmentId, batchId, section) => {
    
    try {
      const response = await fetchTeacherandSubjectAllocations(departmentId, batchId, section);
      console.log(response)
      if (response.success) {
        console.log("Allocations fetched:", response.data);
        setAllocations(response.data);
        setSelectedTeacher("");
        setFilteredAllocations(response.data);
        setFormData((prev) => ({ ...prev, teacherAllocation: "" }));
      }
    } catch (error) {
      console.error("Error fetching allocations:", error);
    }
  };

  const fetchTimetable = async () => {
    try {
      const data = await fetchTimetablebyBatchandSection(selectedBatch, selectedSection);
      if (data.success) {
        setTimetables(data.data);
      }
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    setSelectedDepartment(departmentId);
    setSelectedBatch("");
    setAllocations([]);
    if (departmentId) {
      fetchBatches(departmentId);
    }
  };

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setSelectedBatch(batchId);
    if (batchId && selectedDepartment && selectedSection) {
      fetchAllocations(selectedDepartment, batchId, selectedSection);
    }
  };

  const handleSectionChange = (e) => {
    const section = e.target.value;
    setSelectedSection(section);
    if (selectedBatch && selectedDepartment && section) {
      fetchAllocations(selectedDepartment, selectedBatch, section);
    }
  };

  const handleTeacherChange = (e) => {
    const teacherId = e.target.value;
    setSelectedTeacher(teacherId);
    if (teacherId) {
      const teacherAllocations = allocations.filter((a) => a.teacher._id === teacherId);
      setFilteredAllocations(teacherAllocations);
    } else {
      setFilteredAllocations(allocations);
    }
    setFormData((prev) => ({ ...prev, teacherAllocation: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedAllocation = allocations.find((a) => a._id === formData.teacherAllocation);
    if (!selectedAllocation) {
      alert("Please select a teacher allocation");
      return;
    }

    const timetableData = {
      department: selectedDepartment,
      batch: selectedBatch,
      section: selectedSection,
      year: selectedAllocation.year,
      dayOfWeek: formData.dayOfWeek,
      periodNumber: formData.periodNumber,
      startTime: formData.startTime,
      endTime: formData.endTime,
      subject: selectedAllocation.subject._id,
      teacher: selectedAllocation.teacher._id,
      teacherAllocation: formData.teacherAllocation,
      roomNumber: formData.roomNumber,
      academicYear: formData.academicYear,
    };

    try {
      const response = await createTimetable(timetableData);
      if (response.success || response.data?.success) {
        alert("Timetable entry added successfully!");
        fetchTimetable();
        setFormData({
          dayOfWeek: "Monday",
          periodNumber: 1,
          startTime: "09:00",
          endTime: "10:00",
          teacherAllocation: "",
          roomNumber: "",
          academicYear: "2025-2026",
        });
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this timetable entry?")) return;

    try {
      // Use service method instead of direct API call
      const response = await fetch(`/api/timetable/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        alert("Timetable entry removed successfully");
        fetchTimetable();
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const getTimetableCell = (day, periodNum) => {
    const dayTimetable = timetables[day] || [];
    return dayTimetable.find((t) => t.periodNumber === periodNum);
  };

  return (
    <>
      {/* ================= STYLES (EXACT SAME AS SUBJECT MANAGEMENT + TIMETABLE GRID) ================= */}
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

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
          gap: 16px;
        }

        .select-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(200px,1fr));
          gap: 16px;
        }

        .timetable-grid {
          display: grid;
          grid-template-columns: 120px repeat(6, 1fr);
          gap: 1px;
          background: #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          max-height: 500px;
          overflow-y: auto;
        }

        .period-header {
          background: linear-gradient(135deg,var(--primary),var(--primary-dark));
          color: white;
          padding: 12px;
          font-weight: 700;
          text-align: center;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .day-header {
          background: linear-gradient(135deg,#10b981,#059669);
          color: white;
          padding: 12px;
          font-weight: 600;
          text-align: center;
          position: sticky;
          left: 0;
          z-index: 5;
        }

        .timetable-cell {
          min-height: 80px;
          padding: 12px;
          background: white;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: all 0.2s;
        }

        .timetable-cell:hover {
          background: #f8fafc;
          transform: translateY(-2px);
        }

        .timetable-cell.filled {
          background: linear-gradient(135deg,#dbeafe,#bfdbfe);
          border-left: 4px solid var(--primary-dark);
        }

        .subject-name {
          font-weight: 700;
          font-size: 14px;
          color: var(--text);
        }

        .teacher-name, .room-number {
          font-size: 12px;
          color: var(--muted);
        }

        .form-label-strong {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          font-size: 14px;
          color: var(--text);
        }

        @media (max-width: 992px) {
          .timetable-grid {
            grid-template-columns: 100px repeat(6, 1fr);
          }
          .timetable-cell { min-height: 70px; padding: 8px; }
        }

        @media (max-width: 768px) {
          .page-title { text-align: center; }
          .form-grid, .select-grid { grid-template-columns: 1fr; }
          .timetable-grid {
            grid-template-columns: 90px repeat(6, minmax(70px, 1fr));
            font-size: 12px;
          }
          .period-header, .day-header { padding: 8px; font-size: 13px; }
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
              <h1 className="page-title">Timetable Preparation</h1>
              <small className="text-muted">
                Create weekly timetables for departments, batches, and sections
              </small>
            </div>
          </div>

          {/* SELECT CLASS */}
          <section className="card-ui">
            <h5 className="mb-3">Select Class</h5>
            <div className="select-grid">
              <div>
                <label className="form-label-strong">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
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
                <label className="form-label-strong">Batch</label>
                <select
                  value={selectedBatch}
                  onChange={handleBatchChange}
                  className="form-control"
                  disabled={!selectedDepartment}
                >
                  <option value="">Select Batch</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch.batchId}>
                      {batch.batchName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label-strong">Section</label>
                <select
                  value={selectedSection}
                  onChange={handleSectionChange}
                  className="form-control"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>
            </div>
          </section>

          {/* ADD TIMETABLE ENTRY */}
          {selectedBatch && (
            <section className="card-ui">
              <h5 className="mb-3">Add Timetable Entry</h5>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div>
                    <label className="form-label-strong">Teacher</label>
                    <select
                      value={selectedTeacher}
                      onChange={handleTeacherChange}
                      className="form-control"
                    >
                      <option value="">Select Teacher (Optional)</option>
                      {[...new Set(allocations
                        .filter((a) => a.teacher && a.teacher._id)
                        .map((a) => a.teacher._id)
                      )].map((teacherId) => {
                        const teacher = allocations.find((a) => a.teacher?._id === teacherId)?.teacher;
                        return teacher ? (
                          <option key={teacherId} value={teacherId}>
                            {teacher.name}
                          </option>
                        ) : null;
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="form-label-strong">Day of Week</label>
                    <select
                      value={formData.dayOfWeek}
                      onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                      required
                      className="form-control"
                    >
                      {days.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label-strong">Period</label>
                    <select
                      value={formData.periodNumber}
                      onChange={(e) => {
                        const period = periods.find((p) => p.number === parseInt(e.target.value));
                        setFormData({
                          ...formData,
                          periodNumber: period.number,
                          startTime: period.start,
                          endTime: period.end,
                        });
                      }}
                      required
                      className="form-control"
                    >
                      {periods.map((period) => (
                        <option key={period.number} value={period.number}>
                          P{period.number} ({period.start} - {period.end})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label-strong">Subject</label>
                    <select
                      value={formData.teacherAllocation}
                      onChange={(e) => {
                        const allocationId = e.target.value;
                        const alloc = filteredAllocations.find((a) => a._id === allocationId);
                        if (alloc && alloc.teacher) setSelectedTeacher(alloc.teacher._id);
                        setFormData({ ...formData, teacherAllocation: allocationId });
                      }}
                      required
                      className="form-control"
                    >
                      <option value="">Select Subject</option>
                      {filteredAllocations.map((allocation) => (
                        <option key={allocation._id} value={allocation._id}>
                          {allocation.subject?.subjectName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label-strong">Room Number</label>
                    <input
                      type="text"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      placeholder="e.g., Room 101"
                      className="form-control"
                    />
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
                      disabled={!formData.teacherAllocation}
                    >
                      Add to Timetable
                    </button>
                  </div>
                </div>
              </form>
            </section>
          )}

          {/* WEEKLY TIMETABLE */}
          {selectedBatch && (
            <section className="card-ui">
              <h5 className="mb-3">
                Weekly Timetable - {selectedSection} 
                <span className="ms-2" style={{ fontSize: "14px", color: "#64748b" }}>
                  ({days.join(", ")})
                </span>
              </h5>
              
              <div className="timetable-grid">
                {/* Period Headers */}
                <div></div>
                {days.map((day) => (
                  <div key={day} className="period-header">{day}</div>
                ))}
                
                {/* Timetable Rows */}
                {periods.map((period) => (
                  <React.Fragment key={`period-${period.number}`}>
                    <div className="day-header">
                      <div>P{period.number}</div>
                      <small style={{ fontSize: "11px", opacity: 0.9 }}>
                        {period.start}-{period.end}
                      </small>
                    </div>
                    {days.map((day) => {
                      const entry = getTimetableCell(day, period.number);
                      return (
                        <div
                          key={`${day}-${period.number}`}
                          className={`timetable-cell ${entry ? "filled" : ""}`}
                        >
                          {entry ? (
                            <>
                              <div className="subject-name">
                                {entry.subject?.subjectName}
                              </div>
                              <div className="teacher-name">
                                {entry.teacher?.name}
                              </div>
                              {entry.roomNumber && (
                                <div className="room-number">{entry.roomNumber}</div>
                              )}
                              <button
                                onClick={() => handleDelete(entry._id)}
                                className="btn btn-sm btn-danger mt-1"
                                style={{ 
                                  padding: "2px 8px", 
                                  fontSize: "11px",
                                  width: "100%"
                                }}
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            <div className="text-muted" style={{ opacity: 0.5 }}>
                              -
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
};

export default TimetablePreparation;
