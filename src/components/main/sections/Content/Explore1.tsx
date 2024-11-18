import React, {
  memo, useEffect, useState,
} from '../../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../../global';

import type { ApiSite } from '../../../../api/types';

import { selectCurrentAccountState } from '../../../../global/selectors';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    const payload = {
      full_name: formData.fullName,
      father_name: formData.fatherName,
      cnic_number: formData.cnic,
      address: formData.address,
      country: formData.country,
      mobile_number: formData.mobileNumber,
      email: formData.email,
      user: 4, // Static user ID
    };

    try {
      const response = await fetch('https://softdev.pythonanywhere.com/api/user-profile/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage('Profile created successfully!');
        console.log('Response:', result);
      } else {
        const errorData = await response.json();
        setErrors(errorData);
        console.error('Error:', errorData);
      }
    } catch (error) {
      console.error('Network error:', error);
      setErrors({ general: 'Network error occurred. Please try again later.' });
    }
  };

  useEffect(() => {
    if (!isActive) return;

    getDapps();
    loadExploreSites();
  }, [isActive]);



  const CancelButton=()=>{
    location.reload()
  }


  return (
    <div className={styles.wrapper}>
      <div className={styles1.container}>
        <h1 className={styles1.heading}>Profile Details</h1>
        {successMessage && <p className={styles1.successMessage}>{successMessage}</p>}
        {errors.general && <p className={styles1.errorMessage}>{errors.general}</p>}
        <form className={styles1.form} onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className={styles1.input}
          />
          <input
            type="text"
            name="fatherName"
            placeholder="Father's Name"
            value={formData.fatherName}
            onChange={handleChange}
            className={styles1.input}
          />
          <input
            type="text"
            name="cnic"
            placeholder="CNIC Number"
            value={formData.cnic}
            onChange={handleChange}
            className={`${styles1.input} ${errors.cnic ? styles1.error : ''}`}
          />
          {errors.cnic && <span className={styles1.errorMessage}>{errors.cnic}</span>}
          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className={styles1.textarea}
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            className={styles1.input}
          />
          <input
            type="text"
            name="mobileNumber"
            placeholder="Mobile Number"
            value={formData.mobileNumber}
            onChange={handleChange}
            className={`${styles1.input} ${errors.mobileNumber ? styles1.error : ''}`}
          />
          {errors.mobileNumber && <span className={styles1.errorMessage}>{errors.mobileNumber}</span>}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className={`${styles1.input} ${errors.email ? styles1.error : ''}`}
          />
          {errors.email && <span className={styles1.errorMessage}>{errors.email}</span>}
          <button type="submit" className={styles1.submitButton}>
            Submit
          </button>

        </form>

        <button  onClick={CancelButton} className={styles1.submitButton}>
            Cancel
          </button>
      </div>
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
