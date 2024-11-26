import React, { memo, useState, useEffect } from '../../lib/teact/teact';
import { getActions } from '../../global';

import type { AuthMethod } from '../../global/types';

import buildClassName from '../../util/buildClassName';
import useHistoryBack from '../../hooks/useHistoryBack';
import useLang from '../../hooks/useLang';

import Button from '../ui/Button';
import styles from './Auth.module.scss';

interface OwnProps {
  isActive?: boolean;
  method?: AuthMethod;
}

const AuthCreateBiometrics1 = ({
  isActive,
  method,
}: OwnProps) => {
  const { startCreatingBiometrics, resetAuth, skipCreateBiometrics } = getActions();

  const lang = useLang();
  const isImporting = method !== 'createAccount';

  useHistoryBack({
    isActive,
    onBack: resetAuth,
  });

  const [isFormDataSaved, setIsFormDataSaved] = useState(false); // Track localStorage state

  // Check if form data exists in localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("FormData");
    setIsFormDataSaved(!!savedData); // True if data exists, false otherwise
  }, []);

  return (
    <>
      <div className={buildClassName(styles.container, styles.container_scrollable, 'custom-scroll')}>
       

        <div className={styles.buttons}>
          {/* Conditionally render buttons based on localStorage */}
          {isFormDataSaved ? (
            <>
              <p className={styles.info}>
                {lang('Create a password or use biometric authentication to protect it.')}
              </p>
              <Button
                isPrimary
                className={styles.btn}
                onClick={startCreatingBiometrics}
              >
                {lang('Connect Biometrics')}
              </Button>
              <Button
                isText
                className={buildClassName(styles.btn, styles.btn_text)}
                onClick={skipCreateBiometrics}
              >
                {lang('Use Password')}
              </Button>
            </>
          ) : (
            // If no form data in localStorage, you can place alternative content here
            <p>{lang('No form data found. Please fill out the form first.')}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default memo(AuthCreateBiometrics1);
