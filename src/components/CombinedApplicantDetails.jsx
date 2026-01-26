// src/components/CombinedApplicantDetails.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { uploadSingleFile } from '../services/admissonService';

/**
 * CombinedApplicantDetails
 *
 * This component now covers the full 3-step grouped flow:
 *  - Step A: Personal / Address / Contact (required fields validated)
 *  - Step B: Other Details / Uploads / Study Details / Preferences
 *  - Step C: Signature & Photo Upload + Final Review & Submit
 *
 * Props:
 *  - data: partial saved object (may include studentDetails, addressDetails, contactDetails,
 *          otherDetails, uploadedFiles, studyDetails, preferences, signatureUpload)
 *  - onNext(combinedPayload, meta) -- called to save and advance. meta = { advance: boolean, submit: boolean }
 *  - onPrevious() -- optional, called to go back to previous parent step
 *
 * Notes:
 *  - The component internally validates required fields in Step A before allowing Save & Next.
 *  - File inputs are read to data URLs and stored in uploadedFiles and signatureUpload.
 *  - When the user clicks "Submit Application" on the final review, this component calls:
 *      onNext(combinedPayload, { advance: true, submit: true })
 */
export default function CombinedApplicantDetails({ data = {}, onNext, onPrevious }) {
  // incoming initial fragments
  const initialStudent = data.studentDetails || {};
  const initialAddress = data.addressDetails || {};
  const initialContact = data.contactDetails || {};
  const initialOther = data.otherDetails || {};
  const initialUploads = data.uploadedFiles || {};
  const initialStudy = Array.isArray(data.studyDetails) && data.studyDetails.length ? data.studyDetails : Array(7).fill({});
  const initialPreferences = data.preferences || {};
  const initialSignature = data.signatureUpload || {};

  // Step navigation inside this component (A, B, C)
  const [internalStep, setInternalStep] = useState(1);

  // Personal / contact / address
  const [student, setStudent] = useState({
    studentName: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: '',
    aadharNumber: '',
    bloodGroup: '',
    interHallTicketNo: '',
    interGroup: '',
    tenthHallTicketNo: '',
    ...initialStudent
  });

  const [address, setAddress] = useState({
    houseNo: '',
    street: '',
    village: '',
    mandal: '',
    district: '',
    secretariatSachivalayam: '',
    pinCode: '',
    ...initialAddress
  });

  const [contact, setContact] = useState({
    mobileNo: '',
    parentsContactNo: '',
    guardianContactNo: '',
    email: '',
    ...initialContact
  });

  // Other details
  const [other, setOther] = useState({
    religion: '',
    category: '',
    caste: '',
    physicallyChallenged: '',
    casteCertificateMeeSevaNa: '',
    incomeCertificateMeeSevaNa: '',
    ewsMeeSevaNa: '',
    rationCardNo: '',
    riceCardNo: '',
    fatherAadhar: '',
    motherAadhar: '',
    bankName: '',
    bankIFSC: '',
    bankAccountNo: '',
    ...initialOther
  });

  // Uploads
  const [uploadedFiles, setUploadedFiles] = useState({ ...initialUploads });
  const [previews, setPreviews] = useState({ ...initialUploads });

  // Study details
  const [studyDetails, setStudyDetails] = useState(initialStudy);

  // Preferences
  const [preferences, setPreferences] = useState({
    secondLanguage: '',
    degreeGroup: '',
    bscSpecializations: [],
    collegePreferences: Array(5).fill(''),
    ...initialPreferences
  });

  // Signature & passport (step C)
  const [signatureUpload, setSignatureUpload] = useState({
    studentSignature: '',
    passportSizePhoto: '',
    ...initialSignature
  });
  const [signaturePreviews, setSignaturePreviews] = useState({
    studentSignature: initialSignature.studentSignature || '',
    passportSizePhoto: initialSignature.passportSizePhoto || ''
  });

  // UI & validation
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // sync if parent passes updated data later
    setStudent((s) => ({ ...s, ...(data.studentDetails || {}) }));
    setAddress((a) => ({ ...a, ...(data.addressDetails || {}) }));
    setContact((c) => ({ ...c, ...(data.contactDetails || {}) }));
    setOther((o) => ({ ...o, ...(data.otherDetails || {}) }));
    setUploadedFiles((u) => ({ ...u, ...(data.uploadedFiles || {}) }));
    setPreviews((p) => ({ ...p, ...(data.uploadedFiles || {}) }));
    setStudyDetails(Array.isArray(data.studyDetails) && data.studyDetails.length ? data.studyDetails : studyDetails);
    setPreferences((p) => ({ ...p, ...(data.preferences || {}) }));
    setSignatureUpload((s) => ({ ...s, ...(data.signatureUpload || {}) }));
    setSignaturePreviews((p) => ({ ...p, ...(data.signatureUpload || {}) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* -------------------------
     Handlers for small parts
     ------------------------- */
  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContact((prev) => ({ ...prev, [name]: value }));
  };
  const handleOtherChange = (e) => {
    const { name, value } = e.target;
    setOther((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadedFile = async (e) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;
    const file = files[0];
    try {
      // upload to server and store returned file object (not just URL)
      const res = await uploadSingleFile(file);
      const fileObj = res.file || res.data?.file || res;
      if (fileObj && fileObj.url) {
        // Store the entire file object with all metadata
        setUploadedFiles((prev) => ({ ...prev, [name]: fileObj }));
        setPreviews((prev) => ({ ...prev, [name]: fileObj.url }));
      }
    } catch (err) {
      console.error('Upload failed', err);
      setErrors((prev) => ({ ...prev, server: err?.message || 'Upload failed' }));
    }
  };

  const handleSignatureFile = async (e) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;
    const file = files[0];
    try {
      const res = await uploadSingleFile(file);
      const fileObj = res.file || res.data?.file || res;
      if (fileObj && fileObj.url) {
        // Store the entire file object with all metadata
        setSignatureUpload((prev) => ({ ...prev, [name]: fileObj }));
        setSignaturePreviews((prev) => ({ ...prev, [name]: fileObj.url }));
      }
    } catch (err) {
      console.error('Signature upload failed', err);
      setErrors((prev) => ({ ...prev, server: err?.message || 'Upload failed' }));
    }
  };

  const handleStudyChange = (index, field, value) => {
    setStudyDetails((prev) => {
      const copy = [...prev];
      copy[index] = { ...(copy[index] || {}), [field]: value };
      return copy;
    });
  };

  const handlePreferencesChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
  };

  const toggleBscSpec = (spec) => {
    setPreferences((prev) => {
      const arr = prev.bscSpecializations || [];
      const updated = arr.includes(spec) ? arr.filter((s) => s !== spec) : [...arr, spec];
      return { ...prev, bscSpecializations: updated };
    });
  };

  const handleCollegePrefChange = (index, value) => {
    setPreferences((prev) => {
      const prefs = [...(prev.collegePreferences || Array(5).fill(''))];
      prefs[index] = value;
      return { ...prev, collegePreferences: prefs };
    });
  };

  /* -------------------------
     Validation (Step A required)
     ------------------------- */
  const validateStepA = () => {
    const err = {};
    if (!student.studentName?.trim()) err.studentName = 'Student name is required';
    if (!student.fatherName?.trim()) err.fatherName = 'Father name is required';
    if (!student.motherName?.trim()) err.motherName = 'Mother name is required';
    if (!student.dateOfBirth) err.dateOfBirth = 'DOB is required';
    if (!student.gender) err.gender = 'Gender is required';
    if (!address.houseNo?.trim()) err.houseNo = 'House no is required';
    if (!address.street?.trim()) err.street = 'Street is required';
    if (!address.village?.trim()) err.village = 'Village is required';
    if (!address.mandal?.trim()) err.mandal = 'Mandal is required';
    if (!address.district?.trim()) err.district = 'District is required';
    if (!address.pinCode?.trim()) err.pinCode = 'Pin code is required';
    if (!contact.mobileNo?.trim()) err.mobileNo = 'Mobile number is required';
    if (!contact.email?.trim()) err.email = 'Email is required';
    setErrors(err);
    return Object.keys(err).length === 0;
    // temporarily disable validation
  };

  /* -------------------------
     Emit combined payload
     ------------------------- */
  const buildCombined = () => ({
    studentDetails: { ...student },
    addressDetails: { ...address },
    contactDetails: { ...contact },
    otherDetails: { ...other },
    uploadedFiles: { ...uploadedFiles },
    studyDetails: [...studyDetails],
    preferences: { ...preferences },
    signatureUpload: { ...signatureUpload }
  });

  const saveAndMaybeAdvance = ({ advance = true, submit = false } = {}) => {
    const payload = buildCombined();
    if (typeof onNext === 'function') {
      onNext(payload, { advance, submit });
    }
  };

  /* -------------------------
     Internal step controls
     ------------------------- */
  const goToNextInternal = () => {
    if (internalStep === 1) {
      if (!validateStepA()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      // save and go to 2
      saveAndMaybeAdvance({ advance: false, submit: false });
      setInternalStep(2);
      return;
    }
    if (internalStep === 2) {
      // save and go to 3
      saveAndMaybeAdvance({ advance: false, submit: false });
      setInternalStep(3);
      return;
    }
  };

  const goToPreviousInternal = () => {
    if (internalStep > 1) setInternalStep((s) => s - 1);
    else if (typeof onPrevious === 'function') onPrevious();
  };

  const handleFinalSubmit = async () => {
    // minimal check: signature and photo required
    const err = {};
    if (!signatureUpload.studentSignature) err.studentSignature = 'Signature required';
    if (!signatureUpload.passportSizePhoto) err.passportSizePhoto = 'Passport photo required';
    if (Object.keys(err).length) {
      setErrors(err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // delegate actual submission to parent via onNext(payload, { submit: true })
    try {
      setSaving(true);
      const payload = buildCombined();
      if (typeof onNext === 'function') {
        onNext(payload, { advance: true, submit: true });
      }
    } catch (error) {
      console.error('Error delegating submit to parent', error);
      setErrors((prev) => ({ ...prev, server: 'Submission failed' }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------
     Helper small components
     ------------------------- */
  const InlineError = ({ msg }) => msg ? <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 6 }}>{msg}</div> : null;

  const fileFields = [
    'tenthMarksMemo',
    'interMarksTC',
    'studentAadhar',
    'motherAadhar',
    'casteCertificate',
    'rationRiceCard',
    'motherBankPassbook',
    'incomeCertificate',
    'passportSizePhotos'
  ];
  const fileLabels = {
    tenthMarksMemo: '10th Marks Memo',
    interMarksTC: 'Inter Marks + TC',
    studentAadhar: 'Student Aadhar',
    motherAadhar: 'Mother Aadhar',
    casteCertificate: 'Caste Certificate',
    rationRiceCard: 'Ration + Rice Card',
    motherBankPassbook: 'Mother Bank Passbook',
    incomeCertificate: 'Income Certificate',
    passportSizePhotos: 'Passport Size Photos'
  };

  const classNames = [
    '2nd Inter',
    '1st Inter',
    '10th Class',
    '9th Class',
    '8th Class',
    '7th Class',
    '6th Class'
  ];

  /* -------------------------
     Render
     ------------------------- */
  return (
    <div style={styles.root}>
      <style>{`
        @media (max-width: 780px) {
          .cad-grid { grid-template-columns: 1fr !important; }
          .two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={styles.header}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Admission — Step {internalStep} of 3</h2>
        <div style={{ color: '#6b7280', marginTop: 6 }}>
          {internalStep === 1 && 'Fill personal, address & contact details.'}
          {internalStep === 2 && 'Provide other details, uploads, study history & preferences.'}
          {internalStep === 3 && 'Upload signature/photo and review before submitting.'}
        </div>
      </div>

      {errors.server && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 10, borderRadius: 8, marginBottom: 12 }}>
          {errors.server}
        </div>
      )}

      {/* STEP 1 */}
      {internalStep === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); goToNextInternal(); }}>
          <div style={styles.card}>
            <div className="cad-grid" style={styles.grid}>
              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div style={styles.sectionTitle}>Personal Details</div>
                  <div style={styles.sectionHint}>Name, DOB, identity</div>
                </div>

                <div style={styles.fieldRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Student Name as per SSC*</label>
                    <input name="studentName" value={student.studentName} onChange={handleStudentChange} style={styles.input} />
                    <InlineError msg={errors.studentName} />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Father's Name as per SSC*</label>
                    <input name="fatherName" value={student.fatherName} onChange={handleStudentChange} style={styles.input} />
                    <InlineError msg={errors.fatherName} />
                  </div>
                </div>

                <div style={styles.fieldRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Mother's Name as per SSC*</label>
                    <input name="motherName" value={student.motherName} onChange={handleStudentChange} style={styles.input} />
                    <InlineError msg={errors.motherName} />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Date of Birth *</label>
                    <input type="date" name="dateOfBirth" value={student.dateOfBirth} onChange={handleStudentChange} style={styles.input} />
                    <InlineError msg={errors.dateOfBirth} />
                  </div>
                </div>

                <div style={styles.fieldRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Gender *</label>
                    <select name="gender" value={student.gender} onChange={handleStudentChange} style={styles.input}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <InlineError msg={errors.gender} />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Aadhar Number</label>
                    <input name="aadharNumber" value={student.aadharNumber} onChange={handleStudentChange} style={styles.input} placeholder="12-digit Aadhar" />
                  </div>
                  
                </div>

                <div style={styles.fieldRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Blood Group</label>
                    <select name="bloodGroup" value={student.bloodGroup} onChange={handleStudentChange} style={styles.input}>
                      <option value="">Select</option>
                      <option>O+</option><option>O-</option><option>A+</option><option>A-</option>
                      <option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Intermediate Hall Ticket No</label>
                    <input name="interHallTicketNo" value={student.interHallTicketNo} onChange={handleStudentChange} style={styles.input} />
                  </div>
                </div>

                <div style={styles.fieldRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Inter Group</label>
                    <select name="interGroup" value={student.interGroup} onChange={handleStudentChange} style={styles.input}>
                      <option value="">Select Group</option>
                      <option value="MPC">MPC</option>
                      <option value="BiPC">BiPC</option>
                      <option value="HEC">HEC</option>
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>10th Hall Ticket No</label>
                    <input name="tenthHallTicketNo" value={student.tenthHallTicketNo} onChange={handleStudentChange} style={styles.input} />
                  </div>
                </div>
              </section>

              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <div style={styles.sectionTitle}>Address Details</div>
                  <div style={styles.sectionHint}>Location fields</div>
                </div>

                <div style={styles.fieldRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>House No *</label>
                    <input name="houseNo" value={address.houseNo} onChange={handleAddressChange} style={styles.input} />
                    <InlineError msg={errors.houseNo} />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Street *</label>
                    <input name="street" value={address.street} onChange={handleAddressChange} style={styles.input} />
                    <InlineError msg={errors.street} />
                  </div>
                </div>

                <div style={styles.fieldRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Village *</label>
                    <input name="village" value={address.village} onChange={handleAddressChange} style={styles.input} />
                    <InlineError msg={errors.village} />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Mandal *</label>
                    <input name="mandal" value={address.mandal} onChange={handleAddressChange} style={styles.input} />
                    <InlineError msg={errors.mandal} />
                  </div>
                </div>

                <div style={styles.fieldRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>District *</label>
                    <input name="district" value={address.district} onChange={handleAddressChange} style={styles.input} />
                    <InlineError msg={errors.district} />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Secretariat / Sachivalayam</label>
                    <input name="secretariatSachivalayam" value={address.secretariatSachivalayam} onChange={handleAddressChange} style={styles.input} />
                  </div>
                </div>

                <div style={styles.fieldRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Pin Code *</label>
                    <input name="pinCode" value={address.pinCode} onChange={handleAddressChange} style={styles.input} />
                    <InlineError msg={errors.pinCode} />
                  </div>

                  <div style={styles.field} />
                </div>
              </section>

              <section style={{ ...styles.section, gridColumn: '1 / -1' }}>
                <div style={styles.sectionHeader}>
                  <div style={styles.sectionTitle}>Contact Details</div>
                  <div style={styles.sectionHint}>Phone & email</div>
                </div>

                <div className="two-col" style={{ ...styles.fieldRow, gridTemplateColumns: '1fr 1fr' }}>
                  <div style={styles.field}>
                    <label style={styles.label}>Mobile No *</label>
                    <input name="mobileNo" value={contact.mobileNo} onChange={handleContactChange} style={styles.input} placeholder="10-digit mobile number" />
                    <InlineError msg={errors.mobileNo} />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Parents Contact No</label>
                    <input name="parentsContactNo" value={contact.parentsContactNo} onChange={handleContactChange} style={styles.input} />
                  </div>
                </div>

                <div className="two-col" style={{ ...styles.fieldRow, gridTemplateColumns: '1fr 1fr' }}>
                  <div style={styles.field}>
                    <label style={styles.label}>Guardian Contact No</label>
                    <input name="guardianContactNo" value={contact.guardianContactNo} onChange={handleContactChange} style={styles.input} />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Email *</label>
                    <input name="email" type="email" value={contact.email} onChange={handleContactChange} style={styles.input} />
                    <InlineError msg={errors.email} />
                  </div>
                </div>
              </section>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <div>
                {typeof onPrevious === 'function' && (
                  <button type="button" onClick={onPrevious} style={styles.btnSecondary}>Back</button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => { saveAndMaybeAdvance({ advance: false }); }} style={styles.btnGhost}>Save</button>
                <button type="submit" style={styles.btnPrimary}>Save & Next →</button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* STEP 2 */}
      {internalStep === 2 && (
        <div style={styles.card}>
          <div style={{ display: 'grid', gap: 14 }}>
            {/* Other Details */}
            <div style={styles.subCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitle}>Other Details</div>
                <div style={styles.sectionHint}>Category, certificates, bank</div>
              </div>

              <div style={styles.fieldRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Religion</label>
                  <select name="religion" value={other.religion} onChange={handleOtherChange} style={styles.input}>
                    <option value="">Select Religion</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Christian">Christian</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Buddhist">Buddhist</option>
                    <option value="Jain">Jain</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Category *</label>
                  <select name="category" value={other.category} onChange={handleOtherChange} style={styles.input} required>
                    <option value="">Select Category</option>
                    <option value="OC">OC</option>
                    <option value="BC-A">BC-A</option>
                    <option value="BC-B">BC-B</option>
                    <option value="BC-C">BC-C</option>
                    <option value="BC-D">BC-D</option>
                    <option value="BC-E">BC-E</option>
                    <option value="ST">ST</option>
                    <option value="SC">SC</option>
                  </select>
                </div>
              </div>

              <div style={styles.fieldRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Caste</label>
                  <input name="caste" value={other.caste} onChange={handleOtherChange} style={styles.input} />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Physically Challenged</label>
                  <select name="physicallyChallenged" value={other.physicallyChallenged} onChange={handleOtherChange} style={styles.input}>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div style={styles.fieldRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Caste Certificate Mee Seva No</label>
                  <input name="casteCertificateMeeSevaNa" value={other.casteCertificateMeeSevaNa} onChange={handleOtherChange} style={styles.input} />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Income Certificate Mee Seva No</label>
                  <input name="incomeCertificateMeeSevaNa" value={other.incomeCertificateMeeSevaNa} onChange={handleOtherChange} style={styles.input} />
                </div>
              </div>

              <div style={styles.fieldRow}>
                <div style={styles.field}>
                  <label style={styles.label}>EWS Mee Seva No</label>
                  <input name="ewsMeeSevaNa" value={other.ewsMeeSevaNa} onChange={handleOtherChange} style={styles.input} />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Ration Card No</label>
                  <input name="rationCardNo" value={other.rationCardNo} onChange={handleOtherChange} style={styles.input} />
                </div>
              </div>

              <div style={styles.fieldRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Rice Card No</label>
                  <input name="riceCardNo" value={other.riceCardNo} onChange={handleOtherChange} style={styles.input} />
                </div>

<div style={styles.field}>
  <label style={styles.label}>Father Aadhar</label>
  <input
    name="fatherAadhar"
    value={other.fatherAadhar}
    onChange={handleOtherChange}
    style={styles.input}
    placeholder="12-digit Aadhar"
  />
</div>

                <div style={styles.field}>
                  <label style={styles.label}>Mother Aadhar</label>
                  <input name="motherAadhar" value={other.motherAadhar} onChange={handleOtherChange} style={styles.input} />
                </div>
              </div>

              <div style={styles.fieldRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Bank Name</label>
                  <input name="bankName" value={other.bankName} onChange={handleOtherChange} style={styles.input} />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Bank IFSC</label>
                  <input name="bankIFSC" value={other.bankIFSC} onChange={handleOtherChange} style={styles.input} />
                </div>
              </div>

              <div style={styles.fieldRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Bank Account No</label>
                  <input name="bankAccountNo" value={other.bankAccountNo} onChange={handleOtherChange} style={styles.input} />
                </div>

                <div style={styles.field} />
              </div>
            </div>

            {/* Uploads */}
            <div style={styles.subCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitle}>Upload Xerox Copies</div>
                <div style={styles.sectionHint}>Images or PDFs (optional)</div>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {fileFields.map((field) => {
                  const preview = previews[field];
                  const previewUrl = typeof preview === 'string' ? preview : preview?.url || preview;
                  const isImage = typeof previewUrl === 'string' && (previewUrl.startsWith('data:image') || /\.(jpg|jpeg|png)$/i.test(previewUrl));
                  return (
                  <div key={field} style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={styles.label}>{fileLabels[field]}</label>
                    <input type="file" name={field} accept=".pdf,.jpg,.jpeg,.png" onChange={handleUploadedFile} style={styles.fileInput} />
                    {preview && (
                      <div style={styles.preview}>
                        {isImage ? (
                          <img src={previewUrl} alt="preview" style={styles.previewImage} />
                        ) : (
                          <div style={{ fontSize: 13 }}>File selected</div>
                        )}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Study Details */}
            <div style={styles.subCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitle}>Last 7 Years Study Details</div>
                <div style={styles.sectionHint}>Institute & place</div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.tableCell}>S.No</th>
                      <th style={styles.tableCell}>School/College</th>
                      <th style={styles.tableCell}>Academic Year</th>
                      <th style={styles.tableCell}>Class</th>
                      <th style={styles.tableCell}>Place</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classNames.map((cls, idx) => (
                      <tr key={idx}>
                        <td style={styles.tableCell}>{idx + 1}</td>
                        <td style={styles.tableCell}>
                          <input value={studyDetails[idx]?.schoolCollegeName || ''} onChange={(e) => handleStudyChange(idx, 'schoolCollegeName', e.target.value)} style={styles.tableInput} />
                        </td>
                        <td style={styles.tableCell}>
                          <input value={studyDetails[idx]?.academicYear || ''} onChange={(e) => handleStudyChange(idx, 'academicYear', e.target.value)} style={styles.tableInput} />
                        </td>
                        <td style={styles.tableCell}>
                          <input value={cls} disabled style={{ ...styles.tableInput, backgroundColor: '#f5f5f5' }} />
                        </td>
                        <td style={styles.tableCell}>
                          <input value={studyDetails[idx]?.place || ''} onChange={(e) => handleStudyChange(idx, 'place', e.target.value)} style={styles.tableInput} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Preferences */}
            <div style={styles.subCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitle}>Preferences</div>
                <div style={styles.sectionHint}>Languages, degree & colleges</div>
              </div>

              <div style={styles.fieldRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Second Language</label>
                  <select name="secondLanguage" value={preferences.secondLanguage} onChange={handlePreferencesChange} style={styles.input}>
                    <option value="">Select</option>
                    <option value="Sanskrit">Sanskrit</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Urdu">Urdu</option>
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Degree Group</label>
                  <select name="degreeGroup" value={preferences.degreeGroup} onChange={handlePreferencesChange} style={styles.input}>
                    <option value="">Select</option>
                    <option value="BSc">BSc</option>
                    <option value="BCom">BCom</option>
                  </select>
                </div>
              </div>

              {preferences.degreeGroup === 'BSc' && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>BSc Specializations</div>
                  <div style={styles.checkboxGroup}>
                    {['Computer Science','Data Analytics','Electronics','Internet of Things','Statistics','Physics'].map(opt => (
                      <label key={opt} style={styles.checkboxLabel}>
                        <input type="checkbox" checked={(preferences.bscSpecializations||[]).includes(opt)} onChange={() => toggleBscSpec(opt)} /> {opt}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>College Preferences (1-5)</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <input key={i} placeholder={`College Preference ${i+1}`} value={preferences.collegePreferences?.[i] || ''} onChange={(e) => handleCollegePrefChange(i, e.target.value)} style={styles.input} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <div>
              <button type="button" onClick={() => setInternalStep(1)} style={styles.btnSecondary}>← Previous</button>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => { saveAndMaybeAdvance({ advance: false }); }} style={styles.btnGhost}>Save</button>
              <button type="button" onClick={() => setInternalStep(3)} className="btn-primary" style={styles.btnPrimary}>Save & Next →</button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {internalStep === 3 && (
        <div style={styles.card}>
          {/* Signature Upload */}
          <div style={styles.subCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>Signature & Passport Photo</div>
              <div style={styles.sectionHint}>Upload required images</div>
            </div>

            <div style={styles.fieldRow}>
              <div style={styles.field}>
                <label style={styles.label}>Student Signature *</label>
                <input type="file" name="studentSignature" accept=".jpg,.jpeg,.png,.pdf" onChange={handleSignatureFile} style={styles.fileInput} />
                <InlineError msg={errors.studentSignature} />
                {signaturePreviews.studentSignature && (
                  <div style={styles.preview}>
                    {(() => {
                      const preview = signaturePreviews.studentSignature;
                      const previewUrl = typeof preview === 'string' ? preview : preview?.url || preview;
                      const isImage = typeof previewUrl === 'string' && (previewUrl.startsWith('data:image') || /\.(jpg|jpeg|png)$/i.test(previewUrl));
                      return isImage ? (
                        <img src={previewUrl} alt="signature" style={styles.previewImage} />
                      ) : (
                        <div style={{ fontSize: 13 }}>File selected</div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Passport Size Photo 100kb Only*</label>
                <input type="file" name="passportSizePhoto" accept=".jpg,.jpeg,.png" onChange={handleSignatureFile} style={styles.fileInput} />
                <InlineError msg={errors.passportSizePhoto} />
                {signaturePreviews.passportSizePhoto && (
                  <div style={styles.preview}>
                    {(() => {
                      const preview = signaturePreviews.passportSizePhoto;
                      const previewUrl = typeof preview === 'string' ? preview : preview?.url || preview;
                      return <img src={previewUrl} alt="passport" style={styles.previewImage} />;
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Final Review */}
          <div style={{ height: 12 }} />
          <div style={styles.subCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>Review & Submit</div>
              <div style={styles.sectionHint}>Confirm details before submitting</div>
            </div>

            <div style={{ background: '#f7fffb', padding: 12, borderRadius: 8 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Summary</div>
              <div style={styles.summaryItem}><strong>Name:</strong> {student.studentName || '—'}</div>
              <div style={styles.summaryItem}><strong>Email:</strong> {contact.email || '—'}</div>
              <div style={styles.summaryItem}><strong>Mobile:</strong> {contact.mobileNo || '—'}</div>
              <div style={styles.summaryItem}><strong>Gender:</strong> {student.gender || '—'}</div>
              <div style={styles.summaryItem}><strong>Degree Group:</strong> {preferences.degreeGroup || '—'}</div>
              <p style={{ marginTop: 8, color: '#065f46' }}>
                ✓ Please review all details. When you click "Submit Application" the parent will receive the full payload
                and should create the application on the server. The parent can respond by navigating to a summary page.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <div>
              <button type="button" onClick={() => setInternalStep(2)} style={styles.btnSecondary}>← Previous</button>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => { saveAndMaybeAdvance({ advance: false }); }} style={styles.btnGhost}>Save</button>
              <button type="button" onClick={handleFinalSubmit} disabled={saving} style={styles.btnPrimary}>
                {saving ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------
   Styles
   ------------------------- */
const styles = {
  root: { width: '100%' },
  header: { marginBottom: 12 },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 10px 28px rgba(15,23,42,0.06)',
    border: '1px solid rgba(15,23,42,0.03)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 420px',
    gap: 14
  },
  section: {
    background: '#fbfdff',
    borderRadius: 10,
    padding: 12,
    border: '1px solid rgba(15,23,42,0.03)'
  },
  subCard: {
    background: '#fafcff',
    borderRadius: 10,
    padding: 12,
    border: '1px solid rgba(15,23,42,0.03)'
  },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontWeight: 700, fontSize: 14 },
  sectionHint: { color: '#6b7280', fontSize: 12 },
  fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#0f172a' },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #e6eef8', fontSize: 14 },
  fileInput: { padding: 6, borderRadius: 6, border: '1px solid #e6eef8' },
  preview: { marginTop: 8, padding: 8, background: '#f3f4f6', borderRadius: 6, textAlign: 'center' },
  previewImage: { maxWidth: '100%', maxHeight: 180, borderRadius: 6 },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { backgroundColor: '#eef2ff', color: '#0f172a' },
  tableCell: { padding: 8, border: '1px solid #e6eef8', textAlign: 'left' },
  tableInput: { width: '100%', padding: 6, border: '1px solid #e6eef8', borderRadius: 6 },
  checkboxGroup: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 8 },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: 8 },
  summaryItem: { padding: '6px 0', borderBottom: '1px dashed #e6eef8' },
  btnPrimary: {
    padding: '10px 18px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(90deg,#06b6d4,#2563eb)',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer'
  },
  btnSecondary: {
    padding: '10px 14px',
    borderRadius: 8,
    border: 'none',
    background: '#6b7280',
    color: 'white',
    fontWeight: 700,
    cursor: 'pointer'
  },
  btnGhost: {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid rgba(15,23,42,0.06)',
    background: 'transparent',
    color: '#374151',
    fontWeight: 700,
    cursor: 'pointer'
  }
};
