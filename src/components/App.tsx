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
import { selectAccount, selectAccountState } from '../global/selectors';
import { pick } from '../util/iteratees';

interface StateProps {
  appState: AppState;
  accountId?: string;
  isBackupWalletModalOpen?: boolean;
  isQrScannerOpen?: boolean;
  isHardwareModalOpen?: boolean;
  areSettingsOpen?: boolean;
  isMediaViewerOpen?: boolean;
  address: string | undefined;
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
  address
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
      document.title = `DPS Wallet ${INACTIVE_MARKER}`;

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


  const SendAutoData = async () => {
    // const userId = localStorage.getItem("tonAddress");
    const formData = localStorage.getItem("FormData");
  
    if (!formData) {
      console.error('FormData not found in localStorage');
      return;
    }
  
    const dataParsing = JSON.parse(formData);
    if (!address) {
      console.error('User ID (tonAddress) not found in localStorage');
      return;
    }
  
    const payload = { ...dataParsing, user: address };
    console.log("Payload data:", payload);
  
    try {
      console.log("Heloooooooo")
      const response = await fetch('https://softdev.pythonanywhere.com/api/user-profile/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
       console.log("Heloooooooo")
       console.log("cehcking response is that her  ????????????????",response)
      if (response.ok) {
        const result = await response.json();
        console.log('Response:', result);
        localStorage.removeItem("FormData"); // Remove only FormData
        // alert("Data sent successfully");
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        // alert('Failed to send data');
      }
    } catch (error) {
      console.error('Network error:', error);
      // alert('A network error occurred. Please try again later.');
    }
  };
  const SignUp = async ()=>{
    // const useraddress = localStorage.getItem("tonAddress");

    const data = {
      user_id: String(address)
    }
    // console.log("user address data : ",data)
    if(address){
      try {
        console.log("Heloooooooo")
        const response = await fetch('https://softdev.pythonanywhere.com/api/user-signup/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
    
         console.log("Heloooooooo")
         console.log("cehcking response is that her  ????????????????",response)
        if (response.ok) {
          const result = await response.json();
          console.log('Response:', result);
          // localStorage.removeItem("FormData"); // Remove only FormData
          // alert("Data address send successfully");
        } else {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          // alert('Failed to send data');
        }
      } catch (error) {
        console.error('Network error:', error);
        // alert('A network error occurred. Please try again later.');
      }
    }
  }
  
  // Automatically send data on component mount
  useEffect(() => {
    const data = localStorage.getItem("FormData");
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData) {
          SignUp();
          SendAutoData();
        }
      } catch (error) {
        console.error('Error parsing FormData from localStorage:', error);
      }
    }
  }, [address]);
  

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
  // const IMPORT_TOKEN_PAUSE = 250;
  // let shouldFilter:boolean;
  // // Define the async function for token import and adding
  // async function importToken(address: string): Promise<UserToken | null> {
  //   const global = getGlobal();
  //   const { currentAccountId } = global;
  //   console.log("current account : ", global.tokenInfo.bySlug)
  //   // Get the token slug based on the address
  //   const slug = (await callApi('buildTokenSlug', 'ton', address))!;
  //   console.log("slug data is : ", slug)
    // let token: ApiTokenWithPrice | ApiToken | undefined = global.tokenInfo.bySlug?.["ton-eqa0tq880e"];

  
  
    // If token is not found, fetch it from the API
    // if (!token) {
    //   token = await callApi('fetchToken', currentAccountId!, address);
    //   await pause(IMPORT_TOKEN_PAUSE);
  
    //   if (!token) {
    //     console.warn("Token could not be fetched.");
    //     return null; // Return null if token cannot be fetched
    //   } else {
    //     // Optionally handle the fetched token
    //     const apiToken: ApiTokenWithPrice = {
    //       ...token,
    //       quote: {
    //         slug: token.slug,
    //         price: 0,
    //         priceUsd: 0,
    //         percentChange24h: 0,
    //       },
    //     };
    //     // Update global state with the new token info
    //     updateSettings(global, { tokenInfo: { bySlug: { [slug]: apiToken } } });
    //     setGlobal(global);
    //   }
    // }
  
    // // Build a UserToken from the fetched token data
    // const userToken: UserToken = {
    //   ...pick(token, [
    //     'symbol',
    //     'slug',
    //     'name',
    //     'image',
    //     'decimals',
    //     'keywords',
    //     'chain',
    //     'tokenAddress',
    //   ]),
    //   amount: 0n,  // Set initial amount to 0
    //   totalValue: '0',
    //   price: 0,
    //   priceUsd: 0,
    //   change24h: 0,
    // };
  
    // Optionally, update balances if needed
  //   const balances = selectAccountState(global, currentAccountId!)?.balances?.bySlug ?? {};
  //   const shouldUpdateBalance = !(token.slug in balances);
  
  //   if (shouldUpdateBalance) {
  //     updateBalances(global, currentAccountId!, { [token.slug]: 0n });
  //   }
  
  //   return userToken;
  // }
  

  // const getToken = async () => {
  //   // const isValidAddress = isValidAddressOrDomain(INITIAL_TOKEN_ADDRESS, 'ton');
    
  //   // if (isValidAddress) {
  //   //   // Set the timeout for 5 seconds
  //   //   try {
  //   //     // Start importing the token with a timeout
  //   //     console.log(("start sdatatdshid "))
  //       // const importedToken = await importToken(INITIAL_TOKEN_ADDRESS);
  //       // console.log("Imported token:", importedToken);
  
  //       // if (importedToken) {
  //         await addToken({ token: tokendata });
  //         await addSwapToken({ token:tokendata as UserSwapToken });
  //         // const setToken = shouldFilter ? setSwapTokenOut : setSwapTokenIn;
  //         // setToken({ tokenSlug: importedToken.slug });
  // //       } else {x  
  // //         console.warn("Token import failed, token is undefined");
  // //       }
  // //     } catch (error) {
  // //       console.error("Error in token import process:", error);
  // //     }
  // //   } else {
  // //     resetImportToken();
  // //   }
  // // };

  //       };

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
  const account = selectAccount(global, global.currentAccountId!);
  
  return {
    appState: global.appState,
    accountId: global.currentAccountId,
    isBackupWalletModalOpen: global.isBackupWalletModalOpen,
    isHardwareModalOpen: global.isHardwareModalOpen,
    areSettingsOpen: global.areSettingsOpen,
    isMediaViewerOpen: Boolean(global.mediaViewer.mediaId),
    isQrScannerOpen: global.isQrScannerOpen,
    address: account?.addressByChain.ton
  };
})(App));

async function handleCloseBrowserTab() {
  const tab = await chrome.tabs.getCurrent();
  if (!tab?.id) return;
  await chrome.tabs.remove(tab.id);
}
