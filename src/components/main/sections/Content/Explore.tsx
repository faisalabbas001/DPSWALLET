import React, {
  memo, useEffect, useState,
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
  const [tasks, setTasks] = useState<Task[]>([]);

  const user_id=6715890443;

  useEffect(() => {
    // Fetching tasks from the API
    fetch(`https://softdev.pythonanywhere.com/api/tasks/?user_id=${user_id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Fetched Data:', data); // Log fetched data
        setTasks(data); // Save tasks in state
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []); // Empty dependency array to run once on mount

  const handleStartClick = (taskId: number) => {
    const requestData = {
      user: user_id,
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
        // Re-fetch tasks to refresh the component
        fetchTasks();
      })
      .catch((error) => {
        console.error('Error starting task:', error);
      });
  };
  
  // Function to fetch tasks
  const fetchTasks = () => {
    fetch(`https://softdev.pythonanywhere.com/api/tasks/?user_id=${user_id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Fetched Data:', data); // Log fetched data
        setTasks(data); // Save tasks in state
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };
  
  useEffect(() => {
    fetchTasks(); // Call fetchTasks during initial render
  }, []);
  
  return (
    <div className={styles.wrapper}>
      <div>
        {tasks.length > 0 ? (
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
                    window.open(task.task_url, "_blank");
                    handleStartClick(task.id); // Post data when clicking the button
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
          <h4>No tasks found. Data is under development.</h4>
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
