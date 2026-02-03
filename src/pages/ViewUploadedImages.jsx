import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Users } from "lucide-react";
import { getPublicFaculty } from "../services/authService";

const ViewUploadedImages = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await getPublicFaculty({ limit: 500 });
      if (response.success) {
        setTeachers(response.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const groupedTeachers = teachers.reduce((acc, t) => {
    const dept = t.department?.departmentName || "Other";
    acc[dept] = acc[dept] || [];
    acc[dept].push(t);
    return acc;
  }, {});

  return (
    <>
      <Navbar />

      <style>{`
        :root {
          --primary: #1b4f72;
          --secondary: #2e86c1;
          --gold: #d4ac0d;
          --bg-soft: #f4f8fb;
        }

        /* ================= HERO ================= */
        .faculty-header {
          min-height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          background: linear-gradient(
            rgba(27,79,114,.75),
            rgba(46,134,193,.55)
          ),
          url("https://images.unsplash.com/photo-1524995997946-a1c2e315a42f")
          center/cover;
        }

        .faculty-title {
          font-size: 36px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* ================= WRAPPER ================= */
        .faculty-wrapper {
          max-width: 1250px;
          margin: 60px auto;
          padding: 20px;
        }

        /* ================= DEPARTMENT ================= */
        .dept-block {
          margin-bottom: 60px;
        }

        .dept-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 22px;
          background: var(--bg-soft);
          border-left: 5px solid var(--gold);
          border-radius: 10px;
          margin-bottom: 22px;
        }

        .dept-name {
          font-size: 22px;
          font-weight: 700;
          color: var(--primary);
        }

        .dept-count {
          background: var(--secondary);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        /* ================= GRID ================= */
        .faculty-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 32px;
        }

        /* ================= CARD ================= */
        .faculty-card {
          position: relative;
          height: 360px;
          border-radius: 20px;
          overflow: hidden;
          background: #ddd;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(0,0,0,.12);
          transition: transform .45s ease, box-shadow .45s ease;
        }

        .faculty-card:hover {
          transform: translateY(-14px);
          box-shadow: 0 22px 45px rgba(27,79,114,.35);
        }

        .faculty-img {
          width: 100%;
          height: 100%;
        }

        .faculty-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .6s ease;
        }

        .faculty-card:hover img {
          transform: scale(1.1);
        }

        /* Overlay */
        .faculty-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,.7),
            rgba(0,0,0,.25),
            transparent
          );
        }

        /* ================= INFO SLIDE ================= */
        .faculty-info {
          position: absolute;
          bottom: -65px;
          width: 100%;
          padding: 22px;
          color: white;
          transition: bottom .45s ease;
        }

        .faculty-card:hover .faculty-info {
          bottom: 0;
        }

        .faculty-name {
          font-size: 19px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .faculty-meta {
          font-size: 14px;
          opacity: .9;
        }

        .faculty-email {
          font-size: 12px;
          opacity: .8;
          margin-top: 6px;
          word-break: break-word;
        }

        /* ================= SKELETON ================= */
        .skeleton {
          background: linear-gradient(90deg,#eee,#f5f5f5,#eee);
          background-size: 200% 100%;
          animation: sk 1.2s infinite linear;
          border-radius: 20px;
        }

        @keyframes sk {
          0% { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }

        .sk-card {
          height: 360px;
        }

        /* ================= RESPONSIVE ================= */
        @media (max-width: 768px) {
          .faculty-title {
            font-size: 26px;
          }

          .faculty-card {
            height: 320px;
          }
        }

        @media (max-width: 480px) {
          .faculty-grid {
            grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          }
        }
      `}</style>

      {/* ================= HERO ================= */}
      <div className="faculty-header">
        <h1 className="faculty-title">
          <Users size={36} /> Our Faculty
        </h1>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="faculty-wrapper">
        {loading ? (
          <div className="faculty-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton sk-card" />
            ))}
          </div>
        ) : Object.keys(groupedTeachers).length === 0 ? (
          <p style={{ textAlign: "center", fontSize: 18 }}>
            No faculty data available
          </p>
        ) : (
          Object.keys(groupedTeachers).map((dept) => (
            <div key={dept} className="dept-block">
              <div className="dept-header">
                <div className="dept-name">{dept}</div>
                <div className="dept-count">
                  {groupedTeachers[dept].length} Members
                </div>
              </div>

              <div className="faculty-grid">
                {groupedTeachers[dept].map((t) => (
                  <div key={t._id} className="faculty-card">
                    <div className="faculty-img">
                      {t.photo ? (
                        <img src={t.photo} alt={t.name} />
                      ) : (
                        <div className="skeleton" style={{ height: "100%" }} />
                      )}
                    </div>

                    <div className="faculty-overlay" />

                    <div className="faculty-info">
                      <div className="faculty-name">{t.name}</div>
                      <div className="faculty-meta">{t.designation}</div>
                      <div className="faculty-email">{t.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
    </>
  );
};

export default ViewUploadedImages;
