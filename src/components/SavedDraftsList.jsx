import React, { useEffect, useState } from 'react';
import { getSavedDrafts, deleteDraft, getDraftById } from '../services/admissonService';
import { Edit, Trash2, Calendar, AlertCircle, Play } from 'lucide-react';

/**
 * SavedDraftsList
 * Displays all saved drafts for the current user with options to edit or delete
 * 
 * Props:
 *  - onResumeDraft(draftData) - Called when user clicks "Resume"
 *  - onEditDraft(draftId) - Called when user clicks "Edit"
 */
export default function SavedDraftsList({ onResumeDraft, onEditDraft }) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getSavedDrafts();
      const draftsList = response.data || response.drafts || response || [];
      setDrafts(Array.isArray(draftsList) ? draftsList : []);
    } catch (err) {
      console.error('Error fetching drafts:', err);
      setError(err.message || 'Failed to load drafts');
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (draftId) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) return;

    try {
      setDeleting(draftId);
      await deleteDraft(draftId);
      setDrafts((prev) => prev.filter((d) => d._id !== draftId));
    } catch (err) {
      console.error('Error deleting draft:', err);
      setError('Failed to delete draft');
    } finally {
      setDeleting(null);
    }
  };

  const handleResumeDraft = async (draftId) => {
    try {
      const response = await getDraftById(draftId);
      const draft = response.data || response;
      if (draft && draft.draftData && typeof onResumeDraft === 'function') {
        // Include draftId so the form knows which draft to update
        onResumeDraft({ ...draft.draftData, draftId: draft._id });
      }
    } catch (err) {
      console.error('Error resuming draft:', err);
      setError('Failed to load draft data');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProgressPercentage = (draftData) => {
    if (!draftData) return 0;
    let completed = 0;
    let total = 3; // 3 steps

    // STEP 1: Personal, Address, Contact Details
    const step1Required = [
      draftData.studentDetails?.studentName,
      draftData.studentDetails?.fatherName,
      draftData.studentDetails?.motherName,
      draftData.studentDetails?.dateOfBirth,
      draftData.studentDetails?.gender,
      draftData.addressDetails?.houseNo,
      draftData.addressDetails?.street,
      draftData.addressDetails?.village,
      draftData.addressDetails?.mandal,
      draftData.addressDetails?.district,
      draftData.addressDetails?.pinCode,
      draftData.contactDetails?.mobileNo,
      draftData.contactDetails?.email,
    ];
    const step1Filled = step1Required.filter(Boolean).length;
    if (step1Filled === step1Required.length) completed++;

    // STEP 2: Other Details, Uploads, Study Details, Preferences
    const step2HasData = 
      (draftData.otherDetails && Object.keys(draftData.otherDetails).some((k) => !!draftData.otherDetails[k])) ||
      (draftData.uploadedFiles && Object.keys(draftData.uploadedFiles).length > 0) ||
      (Array.isArray(draftData.studyDetails) && draftData.studyDetails.some((r) => r && Object.keys(r).length)) ||
      (draftData.preferences && Object.keys(draftData.preferences).some((k) => !!draftData.preferences[k]));
    if (step2HasData) completed++;

    // STEP 3: Signature & Passport Photo
    const step3HasData =
      draftData.signatureUpload?.studentSignature ||
      draftData.signatureUpload?.passportSizePhoto;
    if (step3HasData) completed++;

    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingMessage}>Loading drafts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>
          <AlertCircle size={20} />
          {error}
        </div>
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyMessage}>
          <AlertCircle size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
          <div style={styles.emptyTitle}>No saved drafts yet</div>
          <div style={styles.emptyText}>
            Start a new application or your drafts will appear here
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Saved Drafts ({drafts.length})</h3>
        <p style={styles.subtitle}>Resume your incomplete applications</p>
      </div>

      <div style={styles.gridContainer}>
        {drafts.map((draft) => {
          const progress = getProgressPercentage(draft.draftData);
          const studentName = draft.draftData?.studentDetails?.studentName || 'Unnamed Draft';
          const email = draft.draftData?.contactDetails?.email || 'No email';

          return (
            <div key={draft._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>{studentName}</div>
                <div style={styles.progressBadge}>{progress}%</div>
              </div>

              <div style={styles.cardContent}>
                <div style={styles.emailInfo}>
                  <span style={styles.emailLabel}>Email:</span>
                  <span style={styles.emailValue}>{email}</span>
                </div>

                <div style={styles.dateInfo}>
                  <Calendar size={14} style={{ opacity: 0.7 }} />
                  <span style={styles.dateText}>
                    Saved: {formatDate(draft.savedAt)}
                  </span>
                </div>

                <div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                  </div>
                  <div style={styles.progressLabel}>{progress}% complete</div>
                </div>
              </div>

              <div style={styles.cardActions}>
                <button
                  onClick={() => handleResumeDraft(draft._id)}
                  style={styles.btnResume}
                  title="Resume this draft"
                >
                  <Play size={14} />
                  Resume
                </button>

                <button
                  onClick={() => onEditDraft && onEditDraft(draft._id)}
                  style={styles.btnEdit}
                  title="Edit this draft"
                >
                  <Edit size={14} />
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteDraft(draft._id)}
                  disabled={deleting === draft._id}
                  style={styles.btnDelete}
                  title="Delete this draft"
                >
                  <Trash2 size={14} />
                  {deleting === draft._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    background: 'white',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 10px 28px rgba(15,23,42,0.06)',
    border: '1px solid rgba(15,23,42,0.03)',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: '1px solid #e6eef8',
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
  },
  subtitle: {
    margin: '6px 0 0 0',
    fontSize: 13,
    color: '#6b7280',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 16,
  },
  card: {
    background: 'linear-gradient(135deg, #fafcff 0%, #f5f8ff 100%)',
    border: '1px solid #e6eef8',
    borderRadius: 12,
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#0f172a',
    flex: 1,
    wordBreak: 'break-word',
  },
  progressBadge: {
    background: 'linear-gradient(90deg, #06b6d4, #2563eb)',
    color: 'white',
    fontSize: 12,
    fontWeight: 700,
    padding: '6px 12px',
    borderRadius: 6,
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(6,182,212,0.3)',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  emailInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
  },
  emailLabel: {
    fontWeight: 600,
    color: '#374151',
    minWidth: 50,
  },
  emailValue: {
    color: '#6b7280',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  dateInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#6b7280',
  },
  dateText: {
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    background: '#e6eef8',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #06b6d4, #2563eb)',
    transition: 'width 0.3s ease',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'right',
    fontWeight: 600,
  },
  cardActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px solid #e6eef8',
  },
  btnResume: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: '10px 12px',
    background: 'linear-gradient(90deg, #06b6d4, #2563eb)',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnEdit: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: '10px 12px',
    background: '#f0f9ff',
    color: '#0369a1',
    border: '1px solid #0369a1',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnDelete: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: '10px 12px',
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #991b1b',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  loadingMessage: {
    textAlign: 'center',
    padding: 50,
    color: '#6b7280',
    fontSize: 14,
    fontWeight: 500,
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: 10,
    fontSize: 14,
    border: '1px solid #fecaca',
  },
  emptyMessage: {
    textAlign: 'center',
    padding: 50,
    color: '#6b7280',
  },
  emptyTitle: {
    fontWeight: 600,
    fontSize: 15,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#6b7280',
  },
};
