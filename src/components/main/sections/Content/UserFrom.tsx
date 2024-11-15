import React, { useState } from 'react';
import styles from "./Form.module.scss"

interface FormData {
 
  fullName: string;
  fatherName: string;
  cnic: string;
  address: string;
  country: string;
  mobileNumber: string;
  email: string;
}

const UserForm: React.FC = () => {


  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [usedCNICs, setUsedCNICs] = useState<Set<string>>(new Set());
  const [usedMobileNumbers, setUsedMobileNumbers] = useState<Set<string>>(new Set());
  const [usedEmails, setUsedEmails] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<FormData>({
   
    fullName: '',
    fatherName: '',
    cnic: '',
    address: '',
    country: '',
    mobileNumber: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    // Validate for duplicates
    if (usedCNICs.has(formData.cnic)) {
      newErrors.cnic = 'This CNIC number is already in use.';
    }
    if (usedMobileNumbers.has(formData.mobileNumber)) {
      newErrors.mobileNumber = 'This mobile number is already in use.';
    }
    if (usedEmails.has(formData.email)) {
      newErrors.email = 'This email is already in use.';
    }

    // Update errors or proceed
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      setUsedCNICs((prev) => new Set(prev).add(formData.cnic));
      setUsedMobileNumbers((prev) => new Set(prev).add(formData.mobileNumber));
      setUsedEmails((prev) => new Set(prev).add(formData.email));

      console.log('Form submitted successfully:', formData);
      alert('Form submitted successfully!');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Hello API Here Now +++++++</h1>
      <form className={styles.form} onSubmit={validateAndSubmit}>
      
      
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          className={styles.input}
        />
        <input
          type="text"
          name="fatherName"
          placeholder="Father's Name"
          value={formData.fatherName}
          onChange={handleChange}
          className={styles.input}
        />
        <input
          type="text"
          name="cnic"
          placeholder="CNIC Number"
          value={formData.cnic}
          onChange={handleChange}
          className={`${styles.input} ${errors.cnic ? styles.error : ''}`}
        />
        {errors.cnic && <span className={styles.errorMessage}>{errors.cnic}</span>}
        <textarea
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className={styles.textarea}
        />
        <input
          type="text"
          name="country"
          placeholder="Country"
          value={formData.country}
          onChange={handleChange}
          className={styles.input}
        />
        <input
          type="text"
          name="mobileNumber"
          placeholder="Mobile Number"
          value={formData.mobileNumber}
          onChange={handleChange}
          className={`${styles.input} ${errors.mobileNumber ? styles.error : ''}`}
        />
        {errors.mobileNumber && <span className={styles.errorMessage}>{errors.mobileNumber}</span>}
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className={`${styles.input} ${errors.email ? styles.error : ''}`}
        />
        {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
        <button type="submit" className={styles.submitButton}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default UserForm;