import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Users, BookOpen, Building, FileText } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  getAllUsers,
  getDashboardStats,
} from "../services/adminDashboardService";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDepartments: 0,
    totalCourses: 0,
    pendingReports: 0,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch statistics
        const statsData = await getDashboardStats();
        setStats(statsData);

        // Fetch users with limit for table display
        const usersData = await getAllUsers({ limit: 10 });
        setUsers(usersData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <style>{`
        :root {
          --sidebar-width: 250px;
          --sidebar-collapsed: 80px;

          --primary: #ad8ff8;
          --primary-dark: #8b6fe6;
          --primary-soft: #f5f1ff;

          --text-dark: #1e293b;
          --text-muted: #64748b;
          --border: #e5e7eb;
        }

        body {
          margin: 0;
          height: 100vh;
          font-family: 'Inter', 'Poppins', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #f7f4ff, #eef2ff);
          color: var(--text-dark);
          overflow: hidden;
        }

        .dashboard-container {
          display: flex;
          height: 100vh;
          width: 100%;
        }

        .main-content {
          flex-grow: 1;
          padding: clamp(16px, 3vw, 36px);
          transition: margin-left 0.36s cubic-bezier(.2,.9,.2,1);
          overflow-y: auto;
          height: 100vh;
        }

        /* Scrollbar */
        .main-content::-webkit-scrollbar {
          width: 8px;
        }

        .main-content::-webkit-scrollbar-thumb {
          background: var(--primary);
          border-radius: 8px;
        }

        .main-content::-webkit-scrollbar-thumb:hover {
          background: var(--primary-dark);
        }

        /* Header */
        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .page-title {
          font-size: clamp(20px, 2.5vw, 28px);
          font-weight: 700; /* ⬅ reduced from 800 */
          letter-spacing: -0.2px;
          color: var(--primary-dark);
        }

        .section-title {
          font-size: clamp(18px, 2vw, 22px);
          font-weight: 700;
          color: var(--primary-dark);
          margin-bottom: 1rem;
        }

        /* Cards */
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .dashboard-card {
          background: linear-gradient(135deg, #ffffff, var(--primary-soft));
          border-radius: 16px;
          padding: 22px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(173,143,248,0.18);
          transition: all 0.3s ease;
        }

        .dashboard-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(173,143,248,0.28);
        }

        .dashboard-card h5 {
          font-weight: 600;
          margin-bottom: 6px;
        }

        .card-icon {
          color: var(--primary-dark);
          margin-bottom: 10px;
        }

        /* Table */
        .data-table {
          background: #fff;
          border-radius: 16px;
          overflow-x: auto;
          box-shadow: 0 10px 28px rgba(0,0,0,0.05);
          margin-bottom: 24px;
        }

        .data-table table {
          width: 100%;
          min-width: 720px;
          border-collapse: collapse;
        }

        .data-table th {
          background: linear-gradient(
            135deg,
            var(--primary),
            var(--primary-dark)
          );
          color: #fff;
          padding: 14px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
        }

        .data-table td {
          padding: 14px;
          font-size: 14px;
          border-bottom: 1px solid #f1effa;
          color: var(--text-dark);
          white-space: nowrap;
        }

        .data-table tr:hover td {
          background: var(--primary-soft);
        }

        /* Mobile */
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="dashboard-container">
        <Sidebar onToggle={setSidebarOpen} />

        <div
          className="main-content"
          style={{
            marginLeft: sidebarOpen
              ? "var(--sidebar-width)"
              : "var(--sidebar-collapsed)",
          }}
        >
          <div className="dashboard-header">
            <h1 className="page-title">Admin Dashboard</h1>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <Users className="card-icon" size={40} />
              <h5>Total Users</h5>
              <p style={{ color: "#666", fontSize: "20px", fontWeight: "600" }}>
                {loading ? "Loading..." : stats.totalUsers}
              </p>
            </div>

            <div className="dashboard-card">
              <Building className="card-icon" size={40} />
              <h5>Departments</h5>
              <p style={{ color: "#666", fontSize: "20px", fontWeight: "600" }}>
                {loading ? "Loading..." : stats.totalDepartments}
              </p>
            </div>

            <div className="dashboard-card">
              <BookOpen className="card-icon" size={40} />
              <h5>Courses</h5>
              <p style={{ color: "#666", fontSize: "20px", fontWeight: "600" }}>
                {loading ? "Loading..." : stats.totalCourses}
              </p>
            </div>

            <div className="dashboard-card">
              <FileText className="card-icon" size={40} />
              <h5>Reports</h5>
              <p style={{ color: "#666", fontSize: "20px", fontWeight: "600" }}>
                {loading ? "Loading..." : stats.pendingReports}
              </p>
            </div>
          </div>

          <h2 className="section-title">User Management Overview</h2>

          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                      Loading users...
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user._id || index}>
                      <td>{user.name || "N/A"}</td>
                      <td>{user.email || "N/A"}</td>
                      <td style={{ textTransform: "capitalize" }}>
                        {user.role || "N/A"}
                      </td>
                      <td>{user.department?.name || user.department || "N/A"}</td>
                      <td>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor:
                              user.status === "active" ? "#d4edda" : "#f8d7da",
                            color:
                              user.status === "active" ? "#155724" : "#721c24",
                          }}
                        >
                          {user.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
