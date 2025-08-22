import React, { useState, useEffect } from 'react'
import MemberCard from './components/MemberCard'

const url = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://ananya.honor-itsolutions.com/node";

const GroupAdminDashboard = () => {
  const [members, setMembers] = useState([]);
  const [group, setGroup] = useState(null)
  const [groupCode, setGroupCode] = useState("");

  useEffect(() => {
    fetch(`${url}/session`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.code) setGroupCode(data.code);
        else console.warn("No code found in session");

      });
    //console.log(data);
  }, []);


  useEffect(() => {
    const fetchGroup = async () => {
      const res = await fetch(`${url}/group/${groupCode}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setMembers(data.members || []);
      //console.log(members);
      setGroup(data);
    };

    if (groupCode) fetchGroup();
  }, [groupCode]);


  const removeMember = async (memberId) => {
    const res = await fetch(`${url}/group/${groupCode}/removeMember`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ memberId }),
    });

    const data = await res.json();
    if (res.ok) {
      setMembers((prev) =>
        prev.filter((m) => m.id !== parseInt(memberId, 10)) // ✅ fix here
      );
      //console.log("hello");
    } else {
      alert(data.message || "Failed to remove member.");
    }
  };



  return (
    <div className="container mt-4">
      {!group ? (
        <p>Loading group information...</p>
      ) : (
        <>
          <h1 className="mb-5 fs-1 fw-bold ">
            Members for <span>{group.groupName}</span>
          </h1>

          {members.length === 0 ? (
            <p>No members in this group yet.</p>
          ) : (
            members.map((member, index) => (
              <MemberCard
                key={member._id}
                member={member}
                onRemove={removeMember}
                className={index % 2 === 0 ? "bg-deepTeal text-white" : "bg-celeste"} 
              />
            ))
          )}

          {members.length >= 10 && (
          <p className="text-danger mt-4">
            You have reached the maximum number of members under your current plan.
          </p>
        )}

        </>
      )}

      <h3 className='my-4 border border-black p-2'> Current Code: <strong>{groupCode}</strong></h3>

    </div>
  );

};

export default GroupAdminDashboard;