import React, { memo, useEffect } from '../../../lib/teact/teact';
import { getActions } from '../../../global';

import renderText from '../../../global/helpers/renderText';
import buildClassName from '../../../util/buildClassName';

import useLang from '../../../hooks/useLang';
import useQrCode from '../../../hooks/useQrCode';

import InteractiveTextField from '../../ui/InteractiveTextField';
import TonActions from './TonActions';

import styles from '../ReceiveModal.module.scss';

interface OwnProps {
  isActive?: boolean;
  isStatic?: boolean;
  isLedger?: boolean;
  address: string;
  onClose?: NoneToVoidFunction;
}

function TonContent({
  isActive,
  isStatic,
  isLedger,
  address,
  onClose,
}: OwnProps) {
  console.log('Checking for the address in tab343  +++++++++', address);
  
  const { verifyHardwareAddress } = getActions();
  const localStorageKey = 'tonAddress'; // Namespaced localStorage key

  // Function to validate the address
  const isValidAddress = (address: string): boolean => {
    // Example validation (replace with actual validation logic)
    return address && address.length > 0;
  };

  useEffect(() => {
    if (!isValidAddress(address)) {
      console.warn('Invalid address:', address);
      return;
    }

    try {
      const storedAddress = localStorage.getItem(localStorageKey);
      if (storedAddress === address) {
        console.log('Address is already stored in localStorage:', storedAddress);
      } else {
        localStorage.setItem(localStorageKey, address);
        console.log('Address stored in localStorage:', address);
      }
    } catch (error) {
      console.error('Failed to access localStorage:', error);
    }
  }, [address]);

  const lang = useLang();
  const { qrCodeRef, isInitialized } = useQrCode({
    address,
    chain: 'ton',
    isActive,
    hiddenClassName: styles.qrCodeHidden,
    withFormatTransferUrl: true,
  });

  const qrClassNames = buildClassName(
    styles.qrCode,
    isStatic && styles.qrCodeStatic,
    !isInitialized && styles.qrCodeHidden,
  );

  const handleVerify = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    verifyHardwareAddress();
  };

  return (
    <div>
      <div className={buildClassName(styles.contentTitle, styles.contentTitleQr)}>
        {renderText(lang('$receive_ton_description'))}
      </div>

      <div className={qrClassNames} ref={qrCodeRef} />

      <InteractiveTextField
        chain="ton"
        address={address!}
        className={isStatic ? styles.copyButtonStatic : styles.addressWrapper}
        copyNotification={lang('Your address was copied!')}
        noSavedAddress
      />

      {isLedger && (
        <div className={buildClassName(styles.contentTitle, styles.contentTitleLedger)}>
          {renderText(lang('$ledger_verify_address'))}{' '}
          <a href="#" onClick={handleVerify} className={styles.dottedLink}>
            {lang('Verify now')}
          </a>
        </div>
      )}

      {!isStatic && <TonActions isLedger={isLedger} onClose={onClose} />}
    </div>
  );
}

export default memo(TonContent);
