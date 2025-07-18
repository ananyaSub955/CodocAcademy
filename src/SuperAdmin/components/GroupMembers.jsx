import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MemberCard from '../../GroupAdmin/components/MemberCard';
import BackButton from '../../components/BackButton';

const url = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://itws-4500-s25-team6.eastus.cloudapp.azure.com/node";

const GroupMembers = () => {
  const { groupId } = useParams();
  //const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    fetch(`${url}/group/${groupId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setGroupName(data.groupName);
        setMembers(data.members || []);
      })
      .catch(err => console.error("Failed to fetch group", err));
  }, [groupId]);

  function toTitleCase(str) {
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

  return (
    <div className="p-4">
      <BackButton text="Back to all Groups" link='/superAdmin/dashboard' />
      {/* <h1 className="text-3xl font-bold mb-4">Dashboard</h1> */}
      <h2 className="fs-1 fw-bold text-center mb-4">{toTitleCase(groupName)}</h2>
      {members.map(member => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );
};

export default GroupMembers;
