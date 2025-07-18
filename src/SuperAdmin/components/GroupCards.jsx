import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';


const GroupCards = ({ group }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/superAdmin/group/${group.code}`); // use code or id depending on your schema
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
            className="d-flex justify-content-between align-items-center bg-darkFuschia text-white px-3 py-2 rounded mb-2"
            onClick={handleClick}
        >
            <span className='fs-4'>{toTitleCase(group.groupName)}</span>
            <FiChevronRight size={24} />
        </div>
    );
};

export default GroupCards;
