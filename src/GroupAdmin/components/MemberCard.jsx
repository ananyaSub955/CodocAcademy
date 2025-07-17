import React from 'react';
import { Trash2 } from 'lucide-react'; // Or any other icon lib

const MemberCard = ({ member, onRemove }) => {
  return (
    <div className="d-flex justify-content-between align-items-center bg-darkFuschia text-white px-3 py-2 rounded mb-2">
      <span className='fs-4'>{member.firstName} {member.lastName}</span>
      <button
        className="btn btn-link text-white py-1"
        onClick={() => onRemove(member.id)}
        //aria-label={`Remove ${member.firstName}`}
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};

export default MemberCard;
