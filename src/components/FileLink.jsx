import React, { useState, useEffect } from 'react';
import { X, FileIcon, Download, Eye } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Enhanced FileLink Component for S3 and Local URLs
 * - Displays images with inline preview
 * - Shows file type icons for non-image files
 * - Opens modal preview for better viewing
 * - Auto-refreshes expired S3 URLs on-demand
 */
export const FileLink = ({ label, file }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(file?.url);
  const [loading, setLoading] = useState(false);

  // Refresh URL if it has an S3 key (for expired URLs)
  const refreshUrl = async () => {
    if (!file?.key) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/files/get-url?s3Key=${encodeURIComponent(file.key)}`);
      const data = await response.json();
      
      if (data.success && data.url) {
        setCurrentUrl(data.url);
      }
    } catch (error) {
      console.error('Failed to refresh URL:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh URL on mount if needed
  useEffect(() => {
    if (file?.key && !currentUrl) {
      refreshUrl();
    }
  }, [file?.key]);

  if (!file) return null;

  const url = currentUrl || file?.url;
  
  if (!url) {
    return (
      <div style={styles.fileRow}>
        <span style={styles.fileLabel}>{label}</span>
        <button 
          style={styles.refreshBtn}
          onClick={refreshUrl}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Fetch URL'}
        </button>
      </div>
    );
  }
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
  const isPdf = /\.pdf$/i.test(url);
  
  const fileName = file.originalName || file.filename || 'File';

  return (
    <>
      <div style={styles.fileRow}>
        <span style={styles.fileLabel}>{label}</span>
        <div style={styles.fileActions}>
          {isImage ? (
            <>
              <button 
                style={styles.iconBtn}
                onClick={() => setShowModal(true)}
                title="Preview Image"
              >
                <Eye size={16} /> Preview
              </button>
              <a 
                href={url} 
                download={fileName}
                target="_blank" 
                rel="noreferrer"
                style={styles.iconBtn}
                title="Download"
              >
                <Download size={16} /> Download
              </a>
            </>
          ) : (
            <>
              <a 
                href={url} 
                target="_blank" 
                rel="noreferrer"
                style={styles.primaryBtn}
                title={`View ${label}`}
              >
                <FileIcon size={14} /> View / Download
              </a>
            </>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {isImage && showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              style={styles.closeBtn}
              onClick={() => setShowModal(false)}
            >
              <X size={24} />
            </button>
            <img src={url} alt={label} style={styles.modalImage} />
            <div style={styles.modalFooter}>
              <p style={styles.modalLabel}>{label}</p>
              <a 
                href={url} 
                download={fileName}
                target="_blank" 
                rel="noreferrer"
                style={styles.downloadBtn}
              >
                <Download size={16} /> Download Original
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  fileRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px dashed #e5e7eb',
  },
  fileLabel: {
    fontWeight: 600,
    color: '#0f172a',
    flex: 1,
  },
  fileActions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  refreshBtn: {
    padding: '6px 12px',
    background: '#f59e0b',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    background: '#dbeafe',
    color: '#0c4a6e',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    position: 'relative',
    background: '#fff',
    borderRadius: 12,
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    background: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '6px 8px',
    cursor: 'pointer',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImage: {
    maxWidth: '100%',
    maxHeight: 'calc(90vh - 70px)',
    objectFit: 'contain',
    padding: 12,
  },
  modalFooter: {
    padding: '12px 20px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalLabel: {
    fontWeight: 600,
    margin: 0,
  },
  downloadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
  },
};

export default FileLink;
