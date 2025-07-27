import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';


const GroupCards = ({ group, className = '' }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/superAdmin/group/${group.code}`); 
    };


    function toTitleCase(str) {
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    return (
        <div
            className={`card-style cardHover ${className}`}
            onClick={handleClick}
        >
            <span className='fs-4'>{toTitleCase(group.groupName)}</span>
            <FiChevronRight size={24} />
        </div>
    );
};

export default GroupCards;
