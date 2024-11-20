import React, { memo, useEffect, useState } from '../../../../lib/teact/teact';
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true); // Loading state


  // useEffect(() => {
  //   console.log("Fetching address...");
  //   const storedAddress = localStorage.getItem("tonAddress");
  //   console.log("Address fetched:", storedAddress);
  // }, []);
  
 


  const [userAddress, setUserAddress] = useState<string | null>(null); // State for address

  // Fetch address from localStorage
  useEffect(() => {
    const storedAddress = localStorage.getItem("tonAddress");
    if (storedAddress) {
      console.log('Address found in localStorage:', storedAddress);
      setUserAddress(storedAddress);
    } else {
      console.log('No address found in localStorage.');
    }
  }, []);

  const fetchTasks = () => {
    if (!userAddress) {
      console.error('User address is missing. Cannot fetch tasks.');
      return;
    }

    setLoading(true); // Show loader before fetching data
    fetch(`https://softdev.pythonanywhere.com/api/tasks/?user_id=${userAddress}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Fetched Data:', data);
        setTasks(data);
        setLoading(false); // Hide loader once data is fetched
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false); // Hide loader in case of error
      });
  };

  console.log("checking for the address  ++++++++++ of task file ",userAddress)

  const handleStartClick = (taskId: number) => {
    if (!userAddress) {
      console.error('User address is missing. Cannot start task.');
      return;
    }

    const requestData = {
      user:userAddress, // Use the address in place of user_id
      task: taskId,
      isCompleted: false,
    };

    fetch('https://softdev.pythonanywhere.com/api/user-tasks/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Task started successfully:', data);
        fetchTasks(); // Re-fetch tasks to refresh the component
      })
      .catch((error) => {
        console.error('Error starting task:', error);
      });
  };

  useEffect(() => {
    if (userAddress) {
      fetchTasks(); // Fetch tasks only if userAddress is available
    }
  }, [userAddress]);


  console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&",userAddress)

  return (
    <div className={styles.wrapper}>
      <div>
        {loading ? (
          // Render loader when loading is true
          <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
          </div>
        ) : tasks.length > 0 ? (
          // Render tasks if not loading and tasks exist
          tasks.map((task) => (
            <div className={styles.container} key={task.id}>
              <div className={styles.row}>
                <img
                  className={styles.logo}
                  src="https://cdn.mos.cms.futurecdn.net/8gzcr6RpGStvZFA2qRt4v6-1200-80.jpg"
                  alt="logo"
                />
                <h1 className={styles.task}>{task.name}</h1>
                <button
                  className={styles.start}
                  onClick={() => {
                    window.open(task.task_url, '_blank');
                    handleStartClick(task.id);
                  }}
                >
                  Start
                </button>
              </div>
              <span className={styles.pointsContainer}>
                <p className={styles.points}>+{task.points} DPS</p>
              </span>
            </div>
          ))
        ) : (
          // Render message if no tasks are available
          <h4>No tasks available</h4>
        )}
      </div>
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
