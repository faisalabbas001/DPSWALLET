import React, { memo, useState } from '../../lib/teact/teact';
import { getActions } from '../../global';

import type { AuthMethod } from '../../global/types';

import buildClassName from '../../util/buildClassName';
import { ANIMATED_STICKERS_PATHS } from '../ui/helpers/animatedAssets';

import useHistoryBack from '../../hooks/useHistoryBack';
import useLang from '../../hooks/useLang';

import AnimatedIconWithPreview from '../ui/AnimatedIconWithPreview';
import Button from '../ui/Button';

import styles from './Auth.module.scss';

import Explore1 from  "../main/sections/Content/Explore1"; // Ensure correct import for Explore1

interface OwnProps {
  isActive?: boolean;
  method?: AuthMethod;
}

const AuthCreateBiometrics = ({
  isActive,
  method,
}: OwnProps) => {
  const {
    startCreatingBiometrics,
    resetAuth,
    skipCreateBiometrics,
  } = getActions();

  const lang = useLang();
  const isImporting = method !== 'createAccount';

  useHistoryBack({
    isActive,
    onBack: resetAuth,
  });

  const [showExplore, setShowExplore] = useState(false); // State to control rendering of Explore1

  const handleShowExplore = () => {
    setShowExplore(true); // Set the state to show Explore1
  };

  return (
    <>
      <div className={buildClassName(styles.container, styles.container_scrollable, 'custom-scroll')}>
        {/* <AnimatedIconWithPreview
          play={isActive}
          tgsUrl={ANIMATED_STICKERS_PATHS.happy}
          previewUrl={ANIMATED_STICKERS_PATHS.happyPreview}
          noLoop={false}
          nonInteractive
          className={styles.sticker}
        /> */}
        
        <div className={styles.title}>{lang('Congratulations!')}</div>
        <p className={styles.info}>
          <b>{lang(isImporting ? 'The wallet is imported' : 'The wallet is ready')}.</b>
        </p>
        <p className={styles.info}>
          {lang('Create a password or use biometric authentication to protect it.')}
        </p>

        <div className={styles.buttons}>
          <Button
            isText
            className={buildClassName(styles.btn, styles.btn_text)}
            onClick={handleShowExplore}
          >
            Use Profile Data
          </Button>

          {/* Conditionally render Explore1 when showExplore is true */}
          {showExplore && <Explore1 />}

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
        </div>
      </div>
    </>
  );
};

export default memo(AuthCreateBiometrics);
