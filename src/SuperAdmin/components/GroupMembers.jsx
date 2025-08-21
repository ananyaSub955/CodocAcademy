import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MemberCard from '../../GroupAdmin/components/MemberCard';
import BackButton from '../../components/BackButton';

const url = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://ananya.honor-itsolutions.com";

const GroupMembers = () => {
  const { groupId } = useParams();
  const [members, setMembers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [plan, setGroupPlan] = useState("");

  useEffect(() => {
    fetch(`${url}/group/${groupId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setGroupName(data.groupName);
        setMembers(data.members || []);
        setGroupPlan(data.plan);
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

  const renderPlanLabel = () => {
    switch (plan) {
      case "group_lt10_yearly":
        return <h3>Plan: Less than 10 <i>Yearly</i> Group Plan</h3>;
      case "group_gt10_yearly":
        return <h3>Plan: 10+ <i>Yearly</i> Group Plan</h3>;
      case "group_lt10_monthly":
        return <h3>Plan: Less than 10 <i>Monthly</i> Group Plan</h3>;
      case "group_gt10_monthly":
        return <h3>Plan: 10+ <i>Monthly</i> Group Plan</h3>;
      default:
        return null;
    }
  };


  return (
    <div >
      <BackButton text="Back to all Groups" link='/superAdmin/dashboard' />
      <div className="container">

        <div className="p-4">
          <h2 className="fs-1 fw-bold text-center mb-4">{toTitleCase(groupName)}</h2>
          {members.map((member, index) => (
            <MemberCard
              key={member.id}
              member={member}
              className={index % 2 === 0 ? "bg-deepTeal text-white" : "bg-celeste"}
            />
          ))}
          <div className='my-5 border border-black px-2 pt-2'>{renderPlanLabel()}</div>
        </div>
      </div>
    </div>
  );
};

export default GroupMembers;
