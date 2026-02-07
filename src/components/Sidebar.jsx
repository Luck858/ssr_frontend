import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Home,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Settings,
  UserPlus,
  PlusSquare,
  Image,
  CopySlash,
  BadgeDollarSign,
  Menu,
  X,
  Code,
  Images,
  ChevronDown,
  ChevronRight,
  CheckCheckIcon,
  LogOut,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = ({ onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [openSections, setOpenSections] = useState({}); // for grouped items

  const toggleSidebar = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (onToggle) onToggle(next);
  };

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    logout();
    navigate("/login");
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // make active match also nested paths like /admin/attendance/123
  const isPathActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(path + "/");

  const isSectionActive = (section) =>
    section.children?.some((child) => isPathActive(child.path));

  // navItems: array of items
  // item: { name, icon, path } OR { name, icon, children: [ ... ] }
  const getNavigationItems = () => {
    const commonDashboard = {
      name: "Dashboard",
      icon: Home,
      path: `/${user?.role}/dashboard`,
    };

    switch (user?.role) {
      case "principal":
        return [
          commonDashboard,
          {
            name: "Overview",
            icon: FileText,
            path: "#",
          },
          {
            name: "Staff Management",
            icon: Users,
            path: "#",
          },
          {
            name: "Reports",
            icon: FileText,
            path: "#",
          },
          {
            name: "Settings",
            icon: Settings,
            path: "#",
          },
        ];

        return [
          commonDashboard, 
                    {
            name: "Academic Setup",
            icon: BookOpen,
            children: [
              {
                name: "Register Course",
                icon: PlusSquare,
                path:"/admin/courses"
              },
              {
                name: "Register Department",
                icon: PlusSquare,
                path: "/admin/register-department",
              },
              {
                name: "Register Batches",
                icon: BookOpen,
                path: "/admin/batches",
              },
              {
                name: "Subject Creation",
                icon: BookOpen,
                path: "/admin/subject-creation",
              },
              {
                name: "Semester Creation",
                icon: BookOpen,
                path: "/admin/semester-creation",
              },
              {
                name: "Teacher Allocation",
                icon: Users,
                path: "/admin/teacher-allocation",
              },
              {
                name: "Timetable Preparation",
                icon: Calendar,
                path: "/admin/timetable-preparation",
              },
              {
                name: "Section Creation",
                icon: PlusSquare,
                path: "/admin/section-creation",
              },
              
            ],
          },
                    {
            name:"Application",
            icon:CheckCheckIcon,
            path:"/teacher/multi-step-form",
          },
          {
            name: "Classes & Students",
            icon: BookOpen,
            children: [
              {
                name: "My Classes",
                icon: BookOpen,
                path: "/teacher/classes",
              },
              {
                name: "Students",
                icon: Users,
                path: "/teacher/students",
              },
              {
                name: "Register Student",
                icon: UserPlus,
                path: "/teacher/register-student",
              },
            ],
          },
          {
            name: "Attendance",
            icon: Calendar,
            children: [
              {
                name: "Attendance",
                icon: Calendar,
                path: "/teacher/attendance",
              },
              {
                name: "Attendance Reports",
                icon: Calendar,
                path: "/teacher/reports",
              },
            ],
          },
          {
            name:"Admission Forms",
            icon:CheckCheckIcon,
            children:[
              {
                name:"New Admission",
                icon:PlusSquare,
                path:'/multi-step-form',
              },
              {
                name:"Application Listing",
                icon:CheckCheckIcon,
                path:"/applications",
              }]
          }, 
          
        ];

      case "student":
        return [
          commonDashboard,
          {
            name: "Academics",
            icon: BookOpen,
            children: [
              {
                name: "Attendance",
                icon: FileText,
                path: "/student/attendance",
              },
              {
                name: "Coding Problems",
                icon: Code,
                path: "/student/coding-problems",
              },
            ],
          },
          {
            name: "Career",
            icon: Image,
            children: [
              {
                name: "Resume Upload",
                icon: Image,
                path: "/student/resume-upload",
              },
            ],
          },
          {
            name: "Profile",
            icon: GraduationCap,
            path: "/student/profile",
          },
        ];

      case "admin":
        return [
          commonDashboard,
           {
              name: "Admission Forms",
              icon: CheckCheckIcon,
              children: [
                {
                  name: "New Admission",
                  icon: PlusSquare,
                  path: "/multi-step-form",
                },
                {
                  name: "Application Listing",
                  icon: CheckCheckIcon,
                  path: "/applications",
                },
              ],
            },
          {
            name: "User Management",
            icon: Users,
            children: [
              {
                name: "Register User",
                icon: UserPlus,
                path: "/admin/register-user",
              },
              {
                name: "Manage Users",
                icon: Users,
                path: "/admin/manage-users",
              },
            ],
          },
          {
            name:"Co-ordinator Management",
            icon:Users,
            path:"/admin/coordinator-management",
          },
          
          {
            name: "Academic Setup",
            icon: BookOpen,
            children: [
              {
                name: "Register Course",
                icon: PlusSquare,
                path:"/admin/courses"
              },
              {
                name: "Register Department",
                icon: PlusSquare,
                path: "/admin/register-department",
              },
              {
                name: "Register Batches",
                icon: BookOpen,
                path: "/admin/batches",
              },
              {
                name: "Subject Creation",
                icon: BookOpen,
                path: "/admin/subject-creation",
              },
              {
                name: "Semester Creation",
                icon: BookOpen,
                path: "/admin/semester-creation",
              },
              {
                name: "Teacher Allocation",
                icon: Users,
                path: "/admin/teacher-allocation",
              },
              {
                name: "Timetable Preparation",
                icon: Calendar,
                path: "/admin/timetable-preparation",
              },
              {
                name: "Section Creation",
                icon: PlusSquare,
                path: "/admin/section-creation",
              },
              
            ],
          },
          {
            name: "Attendance",
            icon: Calendar,
            children: [
              {
                name: "Attendance Reports",
                icon: FileText,
                path: "/admin/reports",
              },
            ],
          },
          {
            name: "Finance",
            icon: BadgeDollarSign,
            children: [
              {
                name: "Fees",
                icon: CopySlash,
                path: "/admin/fees",
              },
              {
                name: "Assign Fees",
                icon: CopySlash,
                path: "/admin/assign-fees",
              },
            ],
          },
          {
            name: "Website & Media",
            icon: Image,
            children: [
              {
                name: "Home Carousel",
                icon: Image,
                path: "/admin/hero-carousel",
              },
              {
                name: "Recruiters",
                icon: Image,
                path: "/admin/recruiters",
              },
              
            ],
          },
          
        ];

      case "teacher":
        {
          const isCoord = user?.isCoordinator === true || user?.isCoordinator;

          const items = [
            commonDashboard,
             {
              name: "Admission Forms",
              icon: CheckCheckIcon,
              children: [
                {
                  name: "New Admission",
                  icon: PlusSquare,
                  path: "/multi-step-form",
                },
                {
                  name: "Application Listing",
                  icon: CheckCheckIcon,
                  path: "/applications",
                },
              ],
            },
            {
              name: "Classes & Students",
              icon: BookOpen,
              children: [
                {
                  name: "My Classes",
                  icon: BookOpen,
                  path: "/teacher/classes",
                },
                {
                  name: "Students",
                  icon: Users,
                  path: "/teacher/students",
                },
                {
                  name: "Register Student",
                  icon: UserPlus,
                  path: "/teacher/register-student",
                },
              ],
            },
            {
              name: "Attendance",
              icon: Calendar,
              children: [
                {
                  name: "Attendance",
                  icon: Calendar,
                  path: "/teacher/attendance",
                },
                {
                  name: "Attendance Reports",
                  icon: Calendar,
                  path: "/teacher/reports",
                },
              ],
            },
          ];

          if (isCoord) {
            // Add coordinator-specific items for teacher who is also a coordinator
            items.push({
              name: "Academic Setup",
              icon: BookOpen,
              children: [
                {
                  name: "Register Course",
                  icon: PlusSquare,
                  path: "/admin/courses",
                },
                {
                  name: "Register Department",
                  icon: PlusSquare,
                  path: "/admin/register-department",
                },
                {
                  name: "Register Batches",
                  icon: BookOpen,
                  path: "/admin/batches",
                },
                {
                  name: "Subject Creation",
                  icon: BookOpen,
                  path: "/admin/subject-creation",
                },
                {
                  name: "Semester Creation",
                  icon: BookOpen,
                  path: "/admin/semester-creation",
                },
                {
                  name: "Teacher Allocation",
                  icon: Users,
                  path: "/admin/teacher-allocation",
                },
                {
                  name: "Timetable Preparation",
                  icon: Calendar,
                  path: "/admin/timetable-preparation",
                },
                {
                  name: "Section Creation",
                  icon: PlusSquare,
                  path: "/admin/section-creation",
                },
              ],
            });
          }

          items.push(
            {
              name: "Profile",
              icon: GraduationCap,
              path: "/teacher/profile",
            }
          );

          return items;
        }

      default:
        return [commonDashboard];
    }
  };

  const navItems = getNavigationItems();

  // auto-open the section that contains the current active route
  useEffect(() => {
    const initial = {};
    navItems.forEach((item, index) => {
      if (item.children && isSectionActive(item)) {
        const key = `${item.name}-${index}`;
        initial[key] = true;
      }
    });
    setOpenSections((prev) => ({ ...prev, ...initial }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      <style>{`
        :root {
          --sidebar-width: 250px;
          --sidebar-collapsed: 80px;

          /* Material 3 Colors */
          --bg-main: #f1f5f9;
          --card-bg: #ffffff;
          --text-dark: #334155;
          --accent: #ad8ff8;
          --accent-light: #edfdfd;
        }

        .sidebar-container {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: var(--sidebar-width);
          background: var(--bg-main);
          color: var(--text-dark);
          display: flex;
          flex-direction: column;
          transition: width 0.35s ease-in-out;
          z-index: 1050;
          box-shadow: 5px 0 25px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .sidebar-container.closed {
          width: var(--sidebar-collapsed);
        }

        /* HEADER */
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: var(--card-bg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .sidebar-header.closed {
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-logo {
          color: var(--accent);
        }

        .sidebar-title {
          font-weight: 600;
          font-size: 1.25rem;
          margin: 0;
        }

        .toggle-btn {
          background: var(--accent);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius:12px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
         
        }

        .toggle-btn:hover {
          transform: scale(1.06);
          background: #7a54b1;
        }

        /* NAVIGATION */
        .sidebar-scrollable {
          flex-grow: 1;
          padding: 10px;
          overflow-y: auto;
          scrollbar-width: none;
        }

        .sidebar-scrollable::-webkit-scrollbar {
          display: none;
        }

        .sidebar-nav {
          padding: 0;
          margin: 0;
          list-style: none;
        }

        .nav-item,
        .nav-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 14px;
          background: var(--card-bg);
          border-radius: 14px;
          font-weight: 500;
          text-decoration: none;
          color: var(--text-dark);
          cursor: pointer;
        }

        .nav-item:hover,
        .nav-section-header:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 18px rgba(0,0,0,0.10);
        }

        .nav-item.active,
        .nav-section-header.active {
          background: var(--accent-light);
          color: var(--accent);
          box-shadow: 0 8px 20px rgba(14,165,233,0.18);
        }

        .nav-icon {
          min-width: 22px;
          color: var(--accent);
        }

        .nav-label {
          flex-grow: 1;
          text-align: left;
        }

        .nav-chevron {
          margin-left: auto;
          flex-shrink: 0;
        }

        .nav-section {
          margin-bottom: 6px;
        }

        .nav-subitems {
          margin-left: 12px;
          margin-top: 6px;
        }

        .nav-subitem {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          margin-bottom: 6px;
          background: #f8fafc;
          border-radius: 12px;
          text-decoration: none;
          color: var(--text-dark);
          font-weight: 500;
          
          transition: all 0.2s ease;
        }

        .nav-subitem:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 14px rgba(0,0,0,0.08);
        }

        .nav-subitem.active {
          background: var(--accent-light);
          color: var(--accent);
        }

        .nav-subicon {
          min-width: 18px;
        }

        /* LOGOUT BUTTON */
        .sidebar-footer {
          padding: 10px;
          border-top: 1px solid #e0e0e0;
          background: var(--card-bg);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--accent), #8b6fe6);
          color: white;
          border: none;
          border-radius: 14px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 18px rgba(173, 143, 248, 0.3);
        }

        .logout-btn:active {
          transform: translateY(-2px);
        }

        .logout-btn svg {
          width: 20px;
          height: 20px;
        }

        .logout-btn-text {
          flex: 1;
          text-align: center;
        }
      `}</style>

      <div className={`sidebar-container ${!isOpen ? "closed" : ""}`}>
        {/* HEADER */}
        <div className={`sidebar-header ${!isOpen ? "closed" : ""}`}>
          {isOpen ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <GraduationCap className="sidebar-logo" size={34} />
                <h2 className="sidebar-title">SSR</h2>
              </div>
              <button className="toggle-btn" onClick={toggleSidebar}>
                <X size={20} />
              </button>
            </>
          ) : (
            <>
              <button className="toggle-btn" onClick={toggleSidebar}>
                <Menu size={22} />
              </button>
              <GraduationCap className="sidebar-logo" size={32} />
            </>
          )}
        </div>

        {/* NAVIGATION */}
        <div className="sidebar-scrollable">
          <nav className="sidebar-nav">
            {navItems.map((item, index) => {
              const hasChildren =
                Array.isArray(item.children) && item.children.length > 0;

              // Simple single item
              if (!hasChildren) {
                const active = isPathActive(item.path);
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className={`nav-item ${active ? "active" : ""}`}
                  >
                    <item.icon className="nav-icon" size={20} />
                    {isOpen && (
                      <span className="nav-label">{item.name}</span>
                    )}
                  </Link>
                );
              }

              // Section with children
              const sectionKey = `${item.name}-${index}`;
              const open = !!openSections[sectionKey];
              const sectionActive = isSectionActive(item);

              return (
                <div className="nav-section" key={sectionKey}>
                  <div
                    className={`nav-section-header ${
                      sectionActive ? "active" : ""
                    }`}
                    onClick={() => toggleSection(sectionKey)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <item.icon className="nav-icon" size={20} />
                      {isOpen && (
                        <span className="nav-label">{item.name}</span>
                      )}
                    </div>
                    {isOpen && (
                      <span className="nav-chevron">
                        {open ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )}
                      </span>
                    )}
                  </div>

                  {isOpen && open && (
                    <div className="nav-subitems">
                      {item.children.map((child, idx) => {
                        const active = isPathActive(child.path);
                        return (
                          <Link
                            key={idx}
                            to={child.path}
                            className={`nav-subitem ${
                              active ? "active" : ""
                            }`}
                          >
                            <child.icon
                              className="nav-subicon"
                              size={18}
                            />
                            <span>{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* FOOTER WITH LOGOUT */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            {isOpen && <span className="logout-btn-text">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
