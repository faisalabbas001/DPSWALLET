import React, { memo, useEffect, useState } from '../../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../../global';
import type { ApiSite } from '../../../../api/types';
import { selectCurrentAccountState } from '../../../../global/selectors';
import AuthCreateBiometrics1 from '../../../auth/AuthCreateBiometrics1';
import styles from './Explore.module.scss';
import styles1 from './Form.module.scss';

interface OwnProps {
  isActive?: boolean;
}

interface StateProps {
  sites?: ApiSite[];
  shouldRestrict: boolean;
  browserHistory?: string[];
}

interface FormData {
  fullName: string;
  fatherName: string;
  cnic: string;
  address: string;
  country: string;
  mobileNumber: string;
  email: string;
}

const GOOGLE_SEARCH_URL = 'https://www.google.com/search?q=';

function Explore({
  isActive, sites, shouldRestrict, browserHistory,
}: OwnProps & StateProps) {
  const { loadExploreSites, getDapps } = getActions();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    fatherName: '',
    cnic: '',
    address: '',
    country: '',
    mobileNumber: '',
    email: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'error' | ''>('');
  const [showBiometrics, setShowBiometrics] = useState(false); // State to control biometrics component rendering
  const [showForm, setShowForm] = useState(true); // State to control form visibility

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setAlertMessage('');

    const payload = {
      full_name: formData.fullName,
      father_name: formData.fatherName,
      cnic_number: formData.cnic,
      address: formData.address,
      country: formData.country,
      mobile_number: formData.mobileNumber,
      email: formData.email,
      user: "", // Static user ID
    };

    try {
      // Save form data to localStorage
      localStorage.setItem("FormData", JSON.stringify(payload));
      setAlertMessage('Data Submitted Successfully');
      setAlertType('success');
      
      // Show biometrics component and hide form after submission
      setShowBiometrics(true);
      setShowForm(false); // Hide the form after submission

    } catch (error) {
      setAlertMessage('Error: Data not submitted');
      setAlertType('error');
    }

    setTimeout(() => {
      setAlertMessage('');
      setAlertType('');
    }, 3000);
  };

  useEffect(() => {
    if (!isActive) return;
    getDapps();
    loadExploreSites();
  }, [isActive]);

  const CancelButton = () => {
    location.reload();
  };

  return (
    <div className={styles.wrapper}>
      {/* Conditionally render the form or AuthCreateBiometrics */}
      {showForm ? (
        <div className={styles1.container}>
          <h1 className={styles1.heading}>Profile Details</h1>
          {alertMessage && (
            <div className={`${styles1.alert} ${alertType === 'success' ? styles1.success : styles1.error}`}>
              {alertMessage}
            </div>
          )}
          
          {/* Form to collect profile details */}
          <form className={styles1.form} onSubmit={handleSubmit}>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className={styles1.input}
            />
            <input
              type="text"
              name="fatherName"
              placeholder="Father's Name"
              value={formData.fatherName}
              onChange={handleChange}
              required
              className={styles1.input}
            />
            <input
              type="text"
              name="cnic"
              placeholder="CNIC Number"
              required
              value={formData.cnic}
              onChange={handleChange}
              className={`${styles1.input} ${errors.cnic ? styles1.error : ''}`}
            />
            {errors.cnic && <span className={styles1.errorMessage}>{errors.cnic}</span>}
            <textarea
              name="address"
              placeholder="Address"
              required
              value={formData.address}
              onChange={handleChange}
              className={styles1.textarea}
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              required
              onChange={handleChange}
              className={styles1.input}
            />
            <input
              type="text"
              name="mobileNumber"
              placeholder="Mobile Number"
              value={formData.mobileNumber}
              required
              onChange={handleChange}
              className={`${styles1.input} ${errors.mobileNumber ? styles1.error : ''}`}
            />
            {errors.mobileNumber && <span className={styles1.errorMessage}>{errors.mobileNumber}</span>}
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={handleChange}
              className={`${styles1.input} ${errors.email ? styles1.error : ''}`}
            />
            {errors.email && <span className={styles1.errorMessage}>{errors.email}</span>}
            <button type="submit" className={styles1.submitButton}>
              Submit
            </button>
          </form>

          {/* Cancel button */}
          <button onClick={CancelButton} className={styles1.submitButton}>
            Cancel
          </button>
        </div>
      ) : (
        // If the form is hidden, show the biometrics component
        showBiometrics && <AuthCreateBiometrics1 />
      )}
    </div>
  );
}

export default memo(withGlobal<OwnProps>((global): StateProps => {
  const { browserHistory } = selectCurrentAccountState(global) || {};
  return {
    sites: global.exploreSites,
    shouldRestrict: global.restrictions.isLimitedRegion && (IS_IOS_APP || IS_ANDROID_APP),
    browserHistory,
  };
})(Explore));
