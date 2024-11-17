import React, { memo, useEffect,useState, useCallback,useLayoutEffect } from '../lib/teact/teact';
import { getActions, getGlobal, setGlobal, withGlobal } from '../global';

import { AppState, AssetPairs, UserSwapToken, UserToken } from '../global/types';

import { INACTIVE_MARKER, IS_ANDROID_DIRECT, IS_CAPACITOR } from '../config';
import { setActiveTabChangeListener } from '../util/activeTabMonitor';
import buildClassName from '../util/buildClassName';
import { resolveRender } from '../util/renderPromise';
import {
  IS_ANDROID,
  IS_DELEGATED_BOTTOM_SHEET,
  IS_DELEGATING_BOTTOM_SHEET,
  IS_ELECTRON,
  IS_IOS,
  IS_LINUX,
} from '../util/windowEnvironment';
import { updateSizes } from '../util/windowSize';
import { callApi } from '../api';

import useBackgroundMode from '../hooks/useBackgroundMode';
import { useDeviceScreen } from '../hooks/useDeviceScreen';
import useFlag from '../hooks/useFlag';
import useInterval from '../hooks/useInterval';
import useSyncEffect from '../hooks/useSyncEffect';
import useTimeout from '../hooks/useTimeout';

import AppInactive from './AppInactive';
import Auth from './auth/Auth';
import DappConnectModal from './dapps/DappConnectModal';
import DappTransferModal from './dapps/DappTransferModal';
import Dialogs from './Dialogs';
import ElectronHeader from './electron/ElectronHeader';
import LedgerModal from './ledger/LedgerModal';
import Main from './main/Main';
import AddAccountModal from './main/modals/AddAccountModal';
import BackupModal from './main/modals/BackupModal';
import OnRampWidgetModal from './main/modals/OnRampWidgetModal';
import QrScannerModal from './main/modals/QrScannerModal';
import SignatureModal from './main/modals/SignatureModal';
import SwapActivityModal from './main/modals/SwapActivityModal';
import TransactionModal from './main/modals/TransactionModal';
import UnhideNftModal from './main/modals/UnhideNftModal';
import Notifications from './main/Notifications';
import MediaViewer from './mediaViewer/MediaViewer';
import Settings from './settings/Settings';
import SettingsModal from './settings/SettingsModal';
import SwapModal from './swap/SwapModal';
import TransferModal from './transfer/TransferModal';
import ConfettiContainer from './ui/ConfettiContainer';
import InAppBrowser from './ui/InAppBrowser';
import LoadingOverlay from './ui/LoadingOverlay';
import Transition from './ui/Transition';

// import Test from './components/test/TestNoRedundancy';
import styles from './App.module.scss';
import { isValidAddressOrDomain } from '../util/isValidAddressOrDomain';
import useLastCallback from '../hooks/useLastCallback';
import { ApiToken, ApiTokenWithPrice } from '../api/types';
import { pause } from '../util/schedulers';
import { updateBalances, updateSettings } from '../global/reducers';
import { selectAccountState } from '../global/selectors';
import { pick } from '../util/iteratees';

interface StateProps {
  appState: AppState;
  accountId?: string;
  isBackupWalletModalOpen?: boolean;
  isQrScannerOpen?: boolean;
  isHardwareModalOpen?: boolean;
  areSettingsOpen?: boolean;
  isMediaViewerOpen?: boolean;
}

const APP_UPDATE_INTERVAL = (IS_ELECTRON && !IS_LINUX) || IS_ANDROID_DIRECT
  ? 5 * 60 * 1000 // 5 min
  : undefined;
const PRERENDER_MAIN_DELAY = 1200;
let mainKey = 0;

function App({
  appState,
  accountId,
  isBackupWalletModalOpen,
  isHardwareModalOpen,
  isQrScannerOpen,
  areSettingsOpen,
  isMediaViewerOpen,
}: StateProps) {
  // return <Test />;
  const {
    closeBackupWalletModal,
    closeHardwareWalletModal,
    closeSettings,
    cancelCaching,
    closeQrScanner,
    checkAppVersion,
    addToken,
    addSwapToken,
    setSwapTokenIn,
    setSwapTokenOut,
    // importToken,
    resetImportToken,
  } = getActions();

  const { isPortrait } = useDeviceScreen();
  const areSettingsInModal = !isPortrait || IS_ELECTRON || IS_DELEGATING_BOTTOM_SHEET || IS_DELEGATED_BOTTOM_SHEET;

  const [isInactive, markInactive] = useFlag(false);
  const [canPrerenderMain, prerenderMain] = useFlag();

  const renderingKey = isInactive
    ? AppState.Inactive
    : ((areSettingsOpen && !areSettingsInModal)
      ? AppState.Settings : appState
    );

  useTimeout(
    prerenderMain,
    renderingKey === AppState.Auth && !canPrerenderMain ? PRERENDER_MAIN_DELAY : undefined,
  );

  useInterval(checkAppVersion, APP_UPDATE_INTERVAL);

  useEffect(() => {
    updateSizes();
    setActiveTabChangeListener(() => {
      document.title = `MyTonWallet ${INACTIVE_MARKER}`;

      markInactive();
      closeSettings();
      cancelCaching();
    });
  }, [markInactive]);

  useBackgroundMode(() => {
    void callApi('setIsAppFocused', false);
  }, () => {
    void callApi('setIsAppFocused', true);
  });

  useLayoutEffect(() => {
    document.documentElement.classList.add('is-rendered');
    resolveRender();
  }, []);

  useSyncEffect(() => {
    if (accountId) {
      mainKey += 1;
    }
  }, [accountId]);

  // eslint-disable-next-line consistent-return
  function renderContent(isActive: boolean, isFrom: boolean, currentKey: number) {
    switch (currentKey) {
      case AppState.Auth:
        return <Auth />;
      case AppState.Main: {
        const slideFullClassName = buildClassName(
          styles.appSlide,
          styles.appSlideContent,
          'custom-scroll',
          'app-slide-content',
        );
        return (
          <Transition
            name="semiFade"
            activeKey={mainKey}
            shouldCleanup
            nextKey={renderingKey === AppState.Auth && canPrerenderMain ? mainKey + 1 : undefined}
            slideClassName={slideFullClassName}
          >
            <Main
              key={mainKey}
              isActive={isActive}
            />
          </Transition>
        );
      }
      case AppState.Settings:
        return <Settings />;
      case AppState.Ledger:
        return <LedgerModal isOpen onClose={handleCloseBrowserTab} />;
      case AppState.Inactive:
        return <AppInactive />;
    }
  }


 
  // useEffect(() => {
          
  //      console.log("check is valid token address",isValidAddressOrDomain("EQCRzsWWWpEEjgp9kV0RaRmPk3qXsiRknmD_z86SWzflkrmr","ton"));

  //     const data = importToken({ address: "EQCRzsWWWpEEjgp9kV0RaRmPk3qXsiRknmD_z86SWzflkrmr", isSwap: true });
  //     console.log("token data: " , data);
    
  // }, []);



  // const handleTokenClick = useLastCallback((selectedToken: Token) => {
    
  //     addToken({ token: selectedToken as UserToken });
  //     addSwapToken({ token: selectedToken as UserSwapToken });
  // });


  // Constants
  const INITIAL_TOKEN_ADDRESS = "EQCRzsWWWpEEjgp9kV0RaRmPk3qXsiRknmD_z86SWzflkrmr";
  const IMPORT_TOKEN_PAUSE = 250;
  let shouldFilter:boolean;
  // Define the async function for token import and adding
  async function importToken(address: string, isSwap: boolean): Promise<UserToken | null> {
    const global = getGlobal();
    const { currentAccountId } = global;
  
    // Get the token slug based on the address
    const slug = (await callApi('buildTokenSlug', 'ton', address))!;
    let token: ApiTokenWithPrice | ApiToken | undefined = global.tokenInfo.bySlug?.[slug];
  
    // If token is not found, fetch it from the API
    if (!token) {
      token = await callApi('fetchToken', currentAccountId!, address);
      await pause(IMPORT_TOKEN_PAUSE);
  
      if (!token) {
        console.warn("Token could not be fetched.");
        return null; // Return null if token cannot be fetched
      } else {
        // Optionally handle the fetched token
        const apiToken: ApiTokenWithPrice = {
          ...token,
          quote: {
            slug: token.slug,
            price: 0,
            priceUsd: 0,
            percentChange24h: 0,
          },
        };
        // Update global state with the new token info
        updateSettings(global, { tokenInfo: { bySlug: { [slug]: apiToken } } });
        setGlobal(global);
      }
    }
  
    // Build a UserToken from the fetched token data
    const userToken: UserToken = {
      ...pick(token, [
        'symbol',
        'slug',
        'name',
        'image',
        'decimals',
        'keywords',
        'chain',
        'tokenAddress',
      ]),
      amount: 0n,  // Set initial amount to 0
      totalValue: '0',
      price: 0,
      priceUsd: 0,
      change24h: 0,
    };
  
    // Optionally, update balances if needed
    const balances = selectAccountState(global, currentAccountId!)?.balances?.bySlug ?? {};
    const shouldUpdateBalance = !(token.slug in balances);
  
    if (shouldUpdateBalance) {
      updateBalances(global, currentAccountId!, { [token.slug]: 0n });
    }
  
    return userToken;
  }
  

  const getToken = async () => {
    const isValidAddress = isValidAddressOrDomain(INITIAL_TOKEN_ADDRESS, 'ton');
    
    if (isValidAddress) {
      // Set the timeout for 5 seconds
      try {
        // Start importing the token with a timeout
        const importedToken = await importToken(INITIAL_TOKEN_ADDRESS, true);
        console.log("Imported token:", importedToken);
  
        if (importedToken) {
          addToken({ token: importedToken });
          addSwapToken({ token:importedToken as UserSwapToken });
          const setToken = shouldFilter ? setSwapTokenOut : setSwapTokenIn;
          setToken({ tokenSlug: importedToken.slug });
        } else {
          console.warn("Token import failed, token is undefined");
        }
      } catch (error) {
        console.error("Error in token import process:", error);
      }
    } else {
      resetImportToken();
    }
  };
  
  // Call the function inside useEffect
  useEffect(() => {
    getToken();
  }, []);
  
  
  
  

  return (
    <>
      {IS_ELECTRON && !IS_LINUX && <ElectronHeader withTitle />}

      <Transition
        name={isPortrait ? (IS_ANDROID ? 'slideFadeAndroid' : IS_IOS ? 'slideLayers' : 'slideFade') : 'semiFade'}
        activeKey={renderingKey}
        shouldCleanup={renderingKey !== AppState.Settings && !isMediaViewerOpen}
        className={styles.transitionContainer}
        slideClassName={buildClassName(styles.appSlide, 'custom-scroll')}
      >
        {renderContent}
        
      </Transition>

      {areSettingsInModal && (
        <SettingsModal
          isOpen={areSettingsOpen}
          onClose={closeSettings}
        >
          <Settings isInsideModal />
        </SettingsModal>
      )}
      <MediaViewer />
      {!isInactive && (
        <>
          <LedgerModal isOpen={isHardwareModalOpen} onClose={closeHardwareWalletModal} />
          <BackupModal
            isOpen={isBackupWalletModalOpen}
            onClose={closeBackupWalletModal}
          />
          <TransferModal />
          <SwapModal />
          <SignatureModal />
          <TransactionModal />
          <SwapActivityModal />
          <DappConnectModal />
          <DappTransferModal />
          <AddAccountModal />
          <OnRampWidgetModal />
          <UnhideNftModal />
          {!IS_DELEGATED_BOTTOM_SHEET && <Notifications />}
          {IS_CAPACITOR && (
            <QrScannerModal
              isOpen={isQrScannerOpen}
              onClose={closeQrScanner}
            />
          )}
          {!IS_DELEGATED_BOTTOM_SHEET && <Dialogs />}
          {!IS_DELEGATED_BOTTOM_SHEET && <ConfettiContainer />}
          {IS_CAPACITOR && !IS_DELEGATED_BOTTOM_SHEET && <InAppBrowser />}
          {!IS_DELEGATED_BOTTOM_SHEET && <LoadingOverlay />}
        </>
      )}
    </>
  );
}

export default memo(withGlobal((global): StateProps => {
  return {
    appState: global.appState,
    accountId: global.currentAccountId,
    isBackupWalletModalOpen: global.isBackupWalletModalOpen,
    isHardwareModalOpen: global.isHardwareModalOpen,
    areSettingsOpen: global.areSettingsOpen,
    isMediaViewerOpen: Boolean(global.mediaViewer.mediaId),
    isQrScannerOpen: global.isQrScannerOpen,
  };
})(App));

async function handleCloseBrowserTab() {
  const tab = await chrome.tabs.getCurrent();
  if (!tab?.id) return;
  await chrome.tabs.remove(tab.id);
}
