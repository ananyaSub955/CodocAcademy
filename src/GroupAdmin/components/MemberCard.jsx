import React from 'react';
import { Trash2 } from 'lucide-react'; // Or any other icon lib

const MemberCard = ({ member, onRemove, className = '' }) => {
  function toTitleCase(str) {
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
  return (
    <div className={`card-style cardHover ${className}`}>
      <span className='fs-4'>{toTitleCase(member.firstName)} {toTitleCase(member.lastName)}</span>
      <button
        className="btn btn-link text-white py-1"
        onClick={() => onRemove(member.id)}
        aria-label={`Remove ${member.firstName}`}
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};

export default MemberCard;
