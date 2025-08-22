import React, { useEffect, useState } from 'react';
import GroupCards from './components/GroupCards';

const url = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://ananya.honor-itsolutions.com/node";

const SuperAdminDashboard = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetch(`${url}/groups`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setGroups(data))
      .catch(err => console.error("Failed to fetch groups", err));
  }, []);


  return (
    <div className="container mt-4">

      <div className="p-4">
        <h1 className="fs-1 font-bold mb-4 text-center fw-bold">Dashboard</h1>
        <h2 className="fs-2 mb-4">Groups</h2>
        {groups.map((group, index) => (
          <GroupCards 
          key={group.id}
           group={group}
          className={index % 2 === 0 ? "bg-deepTeal text-white" : "bg-celeste"} 
           />
        ))}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
