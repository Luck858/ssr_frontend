// src/pages/MultiStepForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // your existing Sidebar
import CombinedApplicantDetails from "../components/CombinedApplicantDetails"; // the combined 3-step component you provided
import { submitApplication } from "../services/admissonService";
import "bootstrap/dist/css/bootstrap.min.css";

/**
 * MultiStepForm
 *
 * Parent page that hosts CombinedApplicantDetails (internal 3-step flow).
 * - Keeps a local `formData` object that mirrors what's inside CombinedApplicantDetails.
 * - Listens to onNext(payload, meta) from child; merges payload into local state.
 * - If meta.submit === true, calls submitApplication(payload) and navigates to summary.
 * - Computes a simple progress (1..3) from saved data so the progress bar reflects where user is.
 *
 * This file intentionally does not change submission logic or payload structure — it simply
 * wraps the combined component, shows a responsive layout with your Sidebar and a top progress bar.
 */
export default function MultiStepForm() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    studentDetails: {},
    addressDetails: {},
    contactDetails: {},
    otherDetails: {},
    uploadedFiles: {},
    studyDetails: [],
    preferences: {},
    signatureUpload: {},
  });
  const [submitting, setSubmitting] = useState(false);
  const [progressStep, setProgressStep] = useState(1); // computed
  const navigate = useNavigate();

  // compute progress from saved formData so progress reflects actual saved state
  useEffect(() => {
    const hasSignature =
      formData.signatureUpload &&
      (formData.signatureUpload.studentSignature || formData.signatureUpload.passportSizePhoto);

    const hasOther =
      (formData.otherDetails && Object.keys(formData.otherDetails).some((k) => !!formData.otherDetails[k])) ||
      (formData.uploadedFiles && Object.keys(formData.uploadedFiles).length > 0) ||
      (Array.isArray(formData.studyDetails) && formData.studyDetails.length && formData.studyDetails.some((r) => r && Object.keys(r).length)) ||
      (formData.preferences && Object.keys(formData.preferences).some((k) => !!formData.preferences[k]));

    if (hasSignature) setProgressStep(3);
    else if (hasOther) setProgressStep(2);
    else setProgressStep(1);
  }, [formData]);

  // Called by CombinedApplicantDetails
  const handleCombinedNext = async (payload = {}, meta = {}) => {
    // Merge incoming payload into local state (shallow merge at top level)
    setFormData((prev) => {
      return {
        ...prev,
        ...payload,
      };
    });

    // If meta.submit true -> final submit on server
    if (meta && meta.submit) {
      setSubmitting(true);
      try {
        const response = await submitApplication(payload);
        if (response && response.success) {
          navigate(`/summary/${response.applicationId}`);
        } else {
          // keep it simple: show alert (you can replace with toast)
          alert(response?.message || "Failed to submit application. Please try again.");
          console.error("submitApplication response:", response);
        }
      } catch (err) {
        console.error("Error submitting application:", err);
        alert("Server error while submitting application.");
      } finally {
        setSubmitting(false);
      }
    }

    // If child passes a suggested progress (optional), respect it
    if (meta && typeof meta.progress === "number") {
      setProgressStep(Math.min(Math.max(meta.progress, 1), 3));
    }
  };

  const handleCombinedPrevious = () => {
    // Child will handle internal previous. Parent-level fallback: step back progress
    setProgressStep((p) => Math.max(1, p - 1));
  };

  return (
    <>
      <style>{`
        :root{
          --sidebar-width: 250px;
          --sidebar-collapsed: 80px;
        }

        .msf-page {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(180deg,#f7fafc,#eef2ff);
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          color: #0f172a;
        }

        /* increased base font size for readability */
        .msf-main {
          flex: 1;
          transition: margin-left .28s ease;
          padding: 28px 30px;
          min-height: 100vh;
          font-size: 18px; /* increased from default */
          line-height: 1.45;
        }

        .msf-header {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:16px;
          margin-bottom:18px;
        }

        .msf-title { font-size:24px; font-weight:800; margin:0; } /* bumped */
        .msf-sub { color:#6b7280; font-size:15px; margin:0; } /* bumped */

        .msf-progress {
          width: 360px; /* a bit wider so the bar looks balanced with larger text */
        }

        .msf-progress-bar {
          height:12px; /* slightly taller to match larger font */
          background: #e6eef8;
          border-radius: 999px;
          overflow:hidden;
        }

        .msf-progress-fill {
          height:100%;
          background: linear-gradient(90deg,#06b6d4,#2563eb);
          transition: width .28s ease;
        }

        .msf-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* small responsive tweaks */
        @media (max-width: 980px) {
          .msf-main { padding: 18px; font-size: 17px; }
          .msf-progress { width: 260px; }
        }

        @media (max-width: 680px) {
          .msf-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .msf-title { font-size: 20px; }
          .msf-sub { font-size: 14px; }
          .msf-main { font-size: 16px; }
          .msf-progress { width: 100%; }
        }

        /* improve button sizes to match larger fonts */
        .msf-control-btn {
          padding: 12px 16px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 15px;
        }
      `}</style>

      <div className="msf-page">
        {/* use your existing Sidebar component. It accepts onToggle prop and manages its own isOpen */}
        <Sidebar onToggle={(isOpen) => setSidebarOpen(!!isOpen)} />

        <main
          className="msf-main"
          style={{ marginLeft: sidebarOpen ? "var(--sidebar-width)" : "var(--sidebar-collapsed)" }}
        >
          <div className="msf-container">
            <div className="msf-header">
              <div>
                <h1 className="msf-title">Online Admission Application</h1>
                <p className="msf-sub">Three-step consolidated flow — Personal → Documents → Submit</p>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ textAlign: "right", minWidth: 140 }}>
                  <div style={{ fontSize: 15, color: "#475569", marginBottom: 6 }}>Step {progressStep} of 3</div>
                  <div style={{ fontSize: 14, color: "#64748b" }}>
                    {progressStep === 1 && "Personal information"}
                    {progressStep === 2 && "Documents & preferences"}
                    {progressStep === 3 && "Signature & submit"}
                  </div>
                </div>

                <div className="msf-progress">
                  <div className="msf-progress-bar">
                    <div
                      className="msf-progress-fill"
                      style={{ width: `${(progressStep / 3) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <CombinedApplicantDetails
                data={formData}
                onNext={(payload, meta) => {
                  // merged and handle submit
                  handleCombinedNext(payload, meta || {});
                }}
                onPrevious={handleCombinedPrevious}
              />
            </div>

            <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="msf-control-btn"
                style={{
                  border: "1px solid rgba(15,23,42,0.06)",
                  background: "transparent",
                  color: "#374151"
                }}
              >
                Back to top
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
