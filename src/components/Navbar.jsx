import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAllDepartments } from "../services/departmentService";
import { Phone, Mail, X, ChevronDown, Menu } from "lucide-react";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();

  /* ================= SCROLL EFFECT ================= */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ================= LOAD DEPARTMENTS ================= */
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllDepartments();
        setDepartments(res.data || []);
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

  const toggleMobileDropdown = (i) =>
    setMobileDropdown(mobileDropdown === i ? null : i);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { title: "Home", link: "/" },
    { title: "About", dropdown: ["About Us", "Vision & Mission", "Chairman Message", "Faculty"] },
    { title: "Departments", dynamic: true },
    { title: "Admissions", dropdown: ["How to Apply", "Eligibility", "Fee Structure", "Scholarships"] },
    { title: "Placements", dropdown: ["Placement Cell", "Training", "Recruiters", "Records"] },
    { title: "Contact Us", link: "/contact" },
  ];

  const getRouteForDropdown = (main, sub) => {
    if (main === "About") {
      if (sub === "About Us") return "/about";
      if (sub === "Vision & Mission") return "/about/vision-mission";
      if (sub === "Chairman Message") return "/about/chairman-message";
      if (sub === "Faculty") return "/faculty";
    }
    return "#";
  };

  return (
    <>
      <style>{`
        body { overflow-x: hidden; }

        /* ================= HEADER ================= */
        .ssr-header {
          position: sticky;
          top: 0;
          z-index: 999;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          transition: box-shadow .3s ease;
        }

        .ssr-header.scrolled {
          box-shadow: 0 6px 24px rgba(0,0,0,0.08);
        }

        /* ================= TOP BAR ================= */
        .top-bar {
          font-size: 12px;
          padding: 8px 18px;
          background: #7A54B1;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .top-info {
          display: flex;
          gap: 18px;
          align-items: center;
        }

        .top-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .top-bar a {
          background: white;
          color: #7A54B1;
          padding: 4px 14px;
          border-radius: 6px;
          font-weight: 600;
          text-decoration: none;
        }

        /* ================= NAVBAR ================= */
        .navbar-ssr {
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo-wrap {
          display: flex;
          gap: 10px;
          align-items: center;
          text-decoration: none;
        }

        .logo-circle {
          width: 44px;
          height: 44px;
          background: #7A54B1;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
        }

        .logo-text p {
          margin: 0;
          font-weight: 800;
          color: #7A54B1;
          font-size: 18px;
        }

        .logo-text span {
          font-size: 11px;
          color: #555;
        }

        /* ================= DESKTOP MENU ================= */
        .nav-menu {
          display: flex;
          gap: 24px;
          list-style: none;
        }

        .nav-link {
          position: relative;
          font-weight: 600;
          font-size: 15px;
          color: #333;
          text-decoration: none;
          padding: 6px 0;
        }

        .nav-link.active {
          color: #ff7b29;
        }

        .nav-link.active::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -6px;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg,#ff7b29,#ff3b3b);
          border-radius: 999px;
        }

        /* ================= DROPDOWN ================= */
        .dropdown {
          position: absolute;
          top: 120%;
          width: 220px;
          background: white;
          border-radius: 10px;
          padding: 8px 0;
          border-top: 3px solid #7A54B1;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: .25s ease;
        }

        .dropdown.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown a {
          padding: 10px 16px;
          display: block;
          color: #333;
          text-decoration: none;
        }

        .dropdown a:hover {
          background: #f3f1ff;
          color: #7A54B1;
        }

        /* ================= MOBILE ================= */
        .mobile-toggle {
          display: none;
          cursor: pointer;
          color: #7A54B1;
        }

        @media (max-width: 992px) {
          .nav-menu { display: none; }
          .mobile-toggle { display: block; }
          .top-bar { display: none; }
        }

        /* ================= MOBILE DRAWER ================= */
        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          opacity: ${mobileOpen ? 1 : 0};
          pointer-events: ${mobileOpen ? "all" : "none"};
          transition: .3s;
          z-index: 2000;
        }

        .mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          width: 82%;
          max-width: 360px;
          height: 100vh;
          background: white;
          padding: 20px;
          transform: translateX(${mobileOpen ? "0" : "-100%"});
          transition: .3s;
          z-index: 2100;
          overflow-y: auto;
        }

        .mobile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .mobile-item {
          padding: 14px 0;
          border-bottom: 1px solid #eee;
          font-weight: 600;
        }

        .mobile-drop-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .mobile-drop-head svg {
          transition: transform .25s ease;
        }

        .mobile-drop-head.open svg {
          transform: rotate(180deg);
        }

        .mobile-sub {
          padding-left: 14px;
          background: #fafafa;
        }

        .mobile-sub a {
          display: block;
          padding: 10px 0;
          font-size: 14px;
          color: #444;
          text-decoration: none;
        }

        .mobile-active {
          color: #ff7b29;
        }
      `}</style>

      {/* ================= HEADER ================= */}
      <header className={`ssr-header ${scrolled ? "scrolled" : ""}`}>
        <div className="top-bar">
          <div className="top-info">
            <div className="top-item"><Phone size={14} /> +91 98765 43210</div>
            <div className="top-item"><Mail size={14} /> info@ssrcollege.edu</div>
          </div>
          <Link to="/login">Login</Link>
        </div>

        <div className="navbar-ssr">
          <Link to="/" className="logo-wrap">
            <div className="logo-circle">S</div>
            <div className="logo-text">
              <p>SSR</p>
              <span>Degree College</span>
            </div>
          </Link>

          <div className="mobile-toggle" onClick={() => setMobileOpen(true)}>
            <Menu size={26} />
          </div>

          <ul className="nav-menu">
            {menuItems.map((item, i) => (
              <li
                key={i}
                onMouseEnter={() => setDropdownOpen(i)}
                onMouseLeave={() => setDropdownOpen(null)}
                style={{ position: "relative" }}
              >
                {item.link ? (
                  <Link
                    to={item.link}
                    className={`nav-link ${isActive(item.link) ? "active" : ""}`}
                  >
                    {item.title}
                  </Link>
                ) : (
                  <span className="nav-link">{item.title} ▾</span>
                )}

                {(item.dropdown || item.dynamic) && (
                  <div className={`dropdown ${dropdownOpen === i ? "show" : ""}`}>
                    {item.dropdown &&
                      item.dropdown.map((sub) => (
                        <Link key={sub} to={getRouteForDropdown(item.title, sub)}>
                          {sub}
                        </Link>
                      ))}
                    {item.dynamic &&
                      departments.map((d) => (
                        <Link key={d._id} to={`/departments/${d._id}`}>
                          {d.departmentName}
                        </Link>
                      ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* ================= MOBILE ================= */}
      <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />

      <div className="mobile-menu">
        <div className="mobile-header">
          <strong style={{ color: "#7A54B1" }}>SSR Menu</strong>
          <X onClick={() => setMobileOpen(false)} />
        </div>

        {menuItems.map((item, i) => (
          <div key={i} className="mobile-item">
            {item.link ? (
              <Link
                to={item.link}
                onClick={() => setMobileOpen(false)}
                className={isActive(item.link) ? "mobile-active" : ""}
              >
                {item.title}
              </Link>
            ) : (
              <div
                className={`mobile-drop-head ${mobileDropdown === i ? "open" : ""}`}
                onClick={() => toggleMobileDropdown(i)}
              >
                <span>{item.title}</span>
                <ChevronDown size={18} />
              </div>
            )}

            {(item.dropdown || item.dynamic) && mobileDropdown === i && (
              <div className="mobile-sub">
                {item.dropdown &&
                  item.dropdown.map((sub) => (
                    <Link
                      key={sub}
                      to={getRouteForDropdown(item.title, sub)}
                      onClick={() => setMobileOpen(false)}
                    >
                      {sub}
                    </Link>
                  ))}
                {item.dynamic &&
                  departments.map((d) => (
                    <Link
                      key={d._id}
                      to={`/departments/${d._id}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {d.departmentName}
                    </Link>
                  ))}
              </div>
            )}
          </div>
        ))}

        <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "block",
              background: "#7A54B1",
              color: "white",
              padding: "12px",
              borderRadius: "8px",
              textAlign: "center",
              fontWeight: "600",
              textDecoration: "none",
              width: "100%"
            }}
          >
            Login
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
