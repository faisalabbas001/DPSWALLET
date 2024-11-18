import React, {
  memo, useState,
} from '../../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../../global';
import { selectCurrentAccountState } from '../../../../global/selectors';

import { IS_ANDROID_APP, IS_IOS_APP } from '../../../../util/windowEnvironment';

import styles from './Explore.module.scss';

interface OwnProps {
  isActive?: boolean;
}

interface StateProps {
  shouldRestrict: boolean;
  browserHistory?: string[];
}

const SUGGESTIONS_OPEN_DELAY = 300;

interface Task {
  id: number;
  name: string;
  task_url: string;
  points: number;
}

function Explore({
  isActive, shouldRestrict, browserHistory,
}: OwnProps & StateProps) {
  // State to store the message
  const [message, setMessage] = useState('');

  // Handler for button click
  const handleButtonClick = () => {
    setMessage('P2P is under development');
  };

  return (
    <div className={styles.wrapper1}>
      <div>
        {/* Button to trigger message */}
        <button className={styles.merchant} onClick={handleButtonClick}>
          Become Merchant
        </button>
      </div>
      {/* Conditionally render the message */}
      {message && <h3 className={styles.message}>{message}</h3>}
    </div>
  );
}

export default memo(withGlobal<OwnProps>((global): StateProps => {
  const { browserHistory } = selectCurrentAccountState(global) || {};
  return {
    shouldRestrict: global.restrictions.isLimitedRegion && (IS_IOS_APP || IS_ANDROID_APP),
    browserHistory,
  };
})(Explore));
