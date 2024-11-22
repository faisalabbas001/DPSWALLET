import React, { memo, useState, useEffect } from '../../lib/teact/teact';
import { getActions } from '../../global';

import type { AuthMethod } from '../../global/types';

import buildClassName from '../../util/buildClassName';
import useHistoryBack from '../../hooks/useHistoryBack';
import useLang from '../../hooks/useLang';

import Button from '../ui/Button';
import styles from './Auth.module.scss';

import Explore1 from "../main/sections/Content/Explore1"; // Ensure correct import for Explore1

interface OwnProps {
  isActive?: boolean;
  method?: AuthMethod;
}

const AuthCreateBiometrics = ({
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
        <div className={styles.title}>{lang('Congratulations!')}</div>
        <p className={styles.info}>
          <b>{lang(isImporting ? 'The wallet is imported' : 'The wallet is ready')}.</b>
        </p>
        <p className={styles.info}>
          {lang('Create a password or use biometric authentication to protect it.')}
        </p>

        <div className={styles.buttons}>
          {/* Conditionally render content based on localStorage */}
          {!isFormDataSaved ? (
            // If no form data in localStorage, show buttons
            <Explore1 />
          ) : (
            // If form data exists in localStorage, show Explore1
           
            <>
            {/* <Button
              isText
              className={buildClassName(styles.btn, styles.btn_text)}
              onClick={() => console.log('Use Profile Data clicked')}
            >
              {lang('Use Profile Data')}
            </Button> */}
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
          )}
        </div>
      </div>
    </>
  );
};

export default memo(AuthCreateBiometrics);
