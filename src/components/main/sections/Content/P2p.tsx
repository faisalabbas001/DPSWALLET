import React from 'react';

interface P2pProps {
  isActive: boolean;
}

const P2p: React.FC<P2pProps> = ({ isActive }) => {
  return (
    <div>
      <h1>{isActive ? 'Active' : 'Inactive'}</h1>
      <h1>fasial ooooji </h1>
    </div>
  );
};

export default P2p;
