import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { getPublicFaculty } from "../services/authService";

const ViewUploadedImages = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalTeachers: 0, departments: {} });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await getPublicFaculty({
        limit: 500,
      });
      
      if (response.success) {
        const teacherList = response.data || [];
        setTeachers(teacherList);
        
        // Calculate stats
        const deptCount = {};
        teacherList.forEach(teacher => {
          const deptName = teacher.department?.departmentName || 'Other';
          deptCount[deptName] = (deptCount[deptName] || 0) + 1;
        });
        
        setStats({
          totalTeachers: teacherList.length,
          departments: deptCount
        });
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group teachers by department
  const groupedTeachers = teachers.reduce((groups, teacher) => {
    const deptName = teacher.department?.departmentName || 'Other';
    if (!groups[deptName]) {
      groups[deptName] = [];
    }
    groups[deptName].push(teacher);
    return groups;
  }, {});

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: #f8f9fa;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
        }

        .faculty-container {
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 60px 20px;
        }

        .faculty-hero {
          max-width: 1200px;
          margin: 0 auto 60px;
          text-align: center;
          color: white;
        }

        .faculty-title {
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 700;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .faculty-subtitle {
          font-size: 18px;
          opacity: 0.95;
          margin-bottom: 32px;
          font-weight: 300;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          padding: 24px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stat-number {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .departments-section {
          max-width: 1200px;
          margin: 0 auto;
        }

        .department-block {
          margin-bottom: 50px;
        }

        .dept-header {
          background: white;
          padding: 20px 30px;
          border-radius: 12px 12px 0 0;
          border-bottom: 4px solid #667eea;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }

        .dept-name {
          font-size: 24px;
          font-weight: 700;
          color: #333;
        }

        .dept-count {
          background: #667eea;
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .teachers-grid {
          background: white;
          padding: 30px;
          border-radius: 0 0 12px 12px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 24px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }

        .teacher-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .teacher-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.2);
          border-color: #667eea;
        }

        .teacher-photo {
          width: 100%;
          height: 240px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          overflow: hidden;
          position: relative;
        }

        .teacher-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .teacher-info {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .teacher-name {
          font-size: 16px;
          font-weight: 700;
          color: #333;
          margin-bottom: 4px;
          line-height: 1.3;
        }

        .teacher-email {
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
          word-break: break-word;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .teacher-details {
          font-size: 12px;
          color: #999;
          line-height: 1.6;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: white;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.7;
        }

        .empty-text {
          font-size: 20px;
          font-weight: 300;
        }

        .loading-container {
          text-align: center;
          padding: 80px 20px;
          color: white;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .faculty-container {
            padding: 40px 16px;
          }

          .faculty-title {
            font-size: 28px;
            flex-direction: column;
            gap: 12px;
          }

          .dept-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .dept-count {
            align-self: flex-start;
          }

          .teachers-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 16px;
            padding: 20px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        @media (max-width: 480px) {
          .faculty-container {
            padding: 30px 12px;
          }

          .faculty-title {
            font-size: 24px;
          }

          .faculty-subtitle {
            font-size: 16px;
          }

          .teachers-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 12px;
            padding: 16px;
          }

          .teacher-photo {
            height: 180px;
          }

          .dept-name {
            font-size: 18px;
          }
        }
      `}</style>

      <div className="faculty-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p style={{ fontSize: '18px', marginTop: '20px' }}>Loading Faculty Directory...</p>
          </div>
        ) : (
          <>
            <div className="faculty-hero">
              <h1 className="faculty-title">
                <Users size={40} />
                Our Faculty
              </h1>
              <p className="faculty-subtitle">
                Meet our dedicated team of experienced educators
              </p>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.totalTeachers}</div>
                  <div className="stat-label">Total Faculties</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{Object.keys(stats.departments).length}</div>
                  <div className="stat-label">Departments</div>
                </div>
              </div>
            </div>

            {stats.totalTeachers === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👨‍🎓</div>
                <p className="empty-text">No faculty members available at the moment</p>
              </div>
            ) : (
              <div className="departments-section">
                {Object.keys(groupedTeachers)
                  .sort()
                  .map((deptName) => (
                    <div key={deptName} className="department-block">
                      <div className="dept-header">
                        <div className="dept-name">{deptName}</div>
                        <div className="dept-count">
                          {groupedTeachers[deptName].length} Faculty Member{groupedTeachers[deptName].length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="teachers-grid">
                        {groupedTeachers[deptName].map((teacher) => (
                          <div key={teacher._id} className="teacher-card">
                            <div className="teacher-photo">
                              {teacher.photo ? (
                                <img src={teacher.photo} alt={teacher.name} />
                              ) : (
                                <div
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '60px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'rgba(255,255,255,0.3)',
                                  }}
                                >
                                  👨‍🏫
                                </div>
                              )}
                            </div>
                            <div className="teacher-info">
                              <div>
                                <div className="teacher-name">{teacher.name}</div>
                                <div className="teacher-email">{teacher.email}</div>
                              </div>
                              <div className="teacher-details">
                                {teacher.designation && (
                                  <div className="detail-item">
                                    <span>📌</span>
                                    <span>{teacher.designation}</span>
                                  </div>
                                )}
                                {teacher.bloodGroup && (
                                  <div className="detail-item">
                                    <span>🩸</span>
                                    <span>{teacher.bloodGroup}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ViewUploadedImages;
