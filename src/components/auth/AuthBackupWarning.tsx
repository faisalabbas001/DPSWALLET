import React, { memo, useEffect } from '../../lib/teact/teact';
import { getActions, getGlobal, setGlobal } from '../../global';
import { IS_PRODUCTION } from '../../config';
import renderText from '../../global/helpers/renderText';
import buildClassName from '../../util/buildClassName';
import useLang from '../../hooks/useLang';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import styles from './Auth.module.scss';
import { AppState, UserSwapToken, UserToken } from '../../global/types';
import { callApi } from '../../api';
import { ApiToken, ApiTokenWithPrice } from '../../api/types';
import { pause } from '../../util/schedulers';
import { updateBalances, updateSettings } from '../../global/reducers';
import { pick } from '../../util/iteratees';
import { selectAccountState } from '../../global/selectors';
import { isValidAddressOrDomain } from '../../util/isValidAddressOrDomain';

interface OwnProps {
  isOpen: boolean;
  onSkip: NoneToVoidFunction;
  onClose: NoneToVoidFunction;
}

interface StateProps {
  appState: AppState;
  accountId?: string;
  isBackupWalletModalOpen?: boolean;
  isQrScannerOpen?: boolean;
  isHardwareModalOpen?: boolean;
  areSettingsOpen?: boolean;
  isMediaViewerOpen?: boolean;
}

function AuthBackupWarning({ isOpen, onSkip, onClose }: OwnProps) {
  const { openAuthBackupWalletModal, closeBackupWalletModal, closeHardwareWalletModal, closeSettings, cancelCaching, closeQrScanner, checkAppVersion, addToken, addSwapToken, setSwapTokenIn, setSwapTokenOut, resetImportToken } = getActions();
  
  const lang = useLang();
  const canSkipMnemonicCheck = !IS_PRODUCTION;

  let tokendata = 
  {
    symbol: "DPS",
    slug: "ton-eqcrzswwwp",
    name: "Digital payment service",
    image: "https://onedrive.live.com/embed?resid=E349F207B635A4A4%217103&authkey=%21AKMzo4iLxvl0oa4&width=256&height=256",
    decimals: 6,
    chain: "ton",
    tokenAddress: "EQCRzsWWWpEEjgp9kV0RaRmPk3qXsiRknmD_z86SWzflkrmr",
    amount: "bigint:0",
    totalValue: "0",
    price: 0,
    priceUsd: 0,
    change24h: 0
}


      const getToken = async () => {
              await addToken({ token: tokendata });
              await addSwapToken({ token:tokendata as UserSwapToken });
            };
 

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      forceBottomSheet
      nativeBottomSheetKey="backup-warning"
      dialogClassName={styles.disclaimerBackupDialog}
    >
      <p className={styles.backupNotice}>{renderText(lang('$auth_backup_warning_notice'))}</p>
      <div className={styles.backupNoticeButtons}>
        <Button
          isPrimary
          className={buildClassName(styles.btn, styles.btn_wide, !canSkipMnemonicCheck && styles.btn_single)}
          onClick={openAuthBackupWalletModal}
        >
          {lang('Back Up Now')}
        </Button>
        {canSkipMnemonicCheck && (
          <Button
            isDestructive
            className={buildClassName(styles.btn, styles.btn_mini)}
            onClick={() => {
              onSkip();
              getToken();
            }}
          >
            {lang('Later')}
          </Button>
        )}
      </div>
    </Modal>
  );
}

export default memo(AuthBackupWarning);
