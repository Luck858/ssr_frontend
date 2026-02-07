import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PrincipalDashboard from "./pages/PrincipalDashboard";
import AdminRegisterUser from "./pages/AdminRegisterUser";
import AdminManageUsers from "./pages/AdminManageUsers";
import TeacherRegisterStudent from "./pages/TeacherRegisterStudent";
import AdminCreateCourse from './pages/AdminCreateCourse';
import Navbar from "./components/Navbar";
import AdminRegisterDepartment from "./pages/AdminRegisterDepartment";
import Home from "./pages/Home";
import ContactUs from "./pages/ContactUs";
import AdminHeroCarousel from "./pages/AdminHeroCarousel";
import Placements from "./components/Placements";
import DepartmentPage from './pages/AdminRegisterBatchPage';
import AttendanceSidebar from './components/AttendanceSidebar';
import AdminRegisterBatchPage from './pages/AdminRegisterBatchPage';
import FeeManagement from './pages/AdminFeeManagement';
import StudentFeeDashboard from './pages/StudentFeeDashboard';
import AboutUs from './pages/AboutUs';
import VisionMission from './components/VisionMission';
import ChairmanMessage from './components/ChairmanMessage';
import Department from './pages/DepartmentPage';
import AdminRecruiters from './pages/AdminRecruiters';
import AttendanceReport from './pages/AttendanceReport';
import TakeAttendance from './pages/TakeAttendance';
import { getCurrentUserId } from './services/authService';
import TeacherBranchStudents from './pages/SectionStudents';
import TeacherClasses from './pages/TeacherClasses';
import TeacherProfile from './pages/TeacherProfile';
import AdminGallery from "./pages/AdminGallery";
import ViewUploadedImages from "./pages/ViewUploadedImages";
import StudentAttendanceView from "./pages/StudentAttendanceView";
import SubjectManagement from "./pages/SubjectManagement";
import SemesterManagement from "./pages/SemesterManagement";
import TeacherAllocation from "./pages/TeacherAllocation";
import TimetablePreparation from "./pages/TimetablePreparation";
import SectionManagement from "./pages/SectionManagement";
import ResumeUpload from "./pages/ResumeUpload";
import CodingProblems from "./pages/CodingProblems";
import StudentProfile from "./pages/StudentProfile";
import AdmissionForm from "./pages/AdmissionForm";
import MultiStepForm from "./pages/AdmissonAplicationForm";
import ApplicationSummary from "./pages/ApplicationSummary";
import ApplicationDetails from "./pages/ApplicationDetails";
import ApplicationListing from "./pages/ApplicationListing";
import CoordinatorManagement from "./pages/CoordinatorManagement";

const RootRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="btn-loading"
          style={{ width: "40px", height: "40px" }}
        ></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  const [UserId, setUserId] = useState("");

  useEffect(() => {
    const id = getCurrentUserId();
    setUserId(id);
    console.log("ID:", id);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/placements" element={<Placements />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/about/faculty" element={<ViewUploadedImages />} />
          <Route path="/about/vision-mission" element={<VisionMission />} />
          <Route path="/about/chairman-message" element={<ChairmanMessage />} />
          <Route path="/departments/:id" element={<Department />} />
          <Route path="/admission-form" element={<AdmissionForm />} />
          <Route path="/multi-step-form" element={<MultiStepForm />} />
          <Route path="/summary/:applicationId" element={<ApplicationSummary />} />
          <Route path="/applications/:id" element={<ApplicationDetails />} />
          <Route path="/applications" element={<ApplicationListing />} />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route 
          path="/coordinator/dashboard"
          element={
            <ProtectedRoute allowedRoles={["coordinator"]}>
              <TeacherDashboard />
            </ProtectedRoute>
              }
          />
          <Route path="/teacher/multi-step-form"
           element={
            <ProtectedRoute allowedRoles={["teacher"]}>
           <MultiStepForm />
           </ProtectedRoute>
           }
            />
           <Route
            path="/teacher/profile"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherProfile/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/students"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherBranchStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/classes"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherClasses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/attendance/"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TakeAttendance teacherId={UserId} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

            <Route
            path="/admin/coordinator-management"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CoordinatorManagement/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/principal/dashboard"
            element={
              <ProtectedRoute allowedRoles={["principal"]}>
                <PrincipalDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/register-user"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRegisterUser />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/view-uploaded-images"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ViewUploadedImages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/manage-users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminManageUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/subject-creation"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SubjectManagement />
              </ProtectedRoute>
            }
          />
           <Route
            path="/admin/semester-creation"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SemesterManagement />
              </ProtectedRoute>
            }
          />
           <Route
            path="/admin/teacher-allocation"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <TeacherAllocation />
              </ProtectedRoute>
            }
          />
           <Route
            path="/admin/timetable-preparation"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <TimetablePreparation />
              </ProtectedRoute>
            }
          />
           <Route
            path="/admin/section-creation"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SectionManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AttendanceReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/reports"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <AttendanceReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/register-department"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRegisterDepartment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminCreateCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fees"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <FeeManagement />
              </ProtectedRoute>
            }
          />
         
          <Route
            path="/student/payfees"
            element={
              <ProtectedRoute>
                <StudentFeeDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/batches"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRegisterBatchPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/register-student"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherRegisterStudent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <TakeAttendance/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/hero-carousel"
             element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminHeroCarousel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/recruiters"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRecruiters />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gallery"
            element={
              
                <AdminGallery/>
              
            }
          />
             <Route
            path="/student/attendance"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentAttendanceView   studentId={UserId} />
              </ProtectedRoute>
            }
          />
          <Route path="/student/profile" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentProfile />  
            </ProtectedRoute>
          }/>
          <Route path="/student/resume-upload" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <ResumeUpload />  
            </ProtectedRoute>
          }/>
          <Route path="/student/coding-problems" element={
            <ProtectedRoute allowedRoles={["student"]}> 
              <CodingProblems />
            </ProtectedRoute>
          }/>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}








export default App;