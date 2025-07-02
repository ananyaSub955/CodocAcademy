import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ChevronLeft, ChevronRight } from 'lucide-react';


const url = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://itws-4500-s25-team6.eastus.cloudapp.azure.com/node";

const UserDashboard = () => {
    const [userId, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${url}/session`, { credentials: "include" })
            .then(async (response) => {
                if (!response.ok) {
                    // Not logged in
                    console.log("No session found");
                    navigate("/login"); // don't forget to import navigate!
                    return;
                }
                const data = await response.json();
                setUser(data); // data should contain: { id, email, firstName }
            })
            .catch(error => {
                console.error("Error fetching session:", error);
            });
    }, []);


    const tags = ['Diabetes', 'Vascular', 'Pulmonary', 'Neurology', 'Gastroentrology', 'Renal', 'Connective Tisue Disorder', 'SUD and Behaviorial Sciences', 'Cardiology', 'Miscellaneous'];
    const [currentTagIndex, setCurrentTagIndex] = useState(0);
    const tagsPerPage = 5;

    const nextTags = () => {
        if (currentTagIndex + tagsPerPage < tags.length) {
            setCurrentTagIndex(currentTagIndex + tagsPerPage);
        }
    };

    const prevTags = () => {
        if (currentTagIndex > 0) {
            setCurrentTagIndex(Math.max(0, currentTagIndex - tagsPerPage));
        }
    };

    const visibleTags = tags.slice(currentTagIndex, currentTagIndex + tagsPerPage);


    const renderCards = (count, section = "") => {
        const cards = [];
        for (let i = 0; i < count; i++) {
            cards.push(
                <div
                    key={`${section}-${i}`}
                    className="d-flex justify-content-center"
                    style={{
                        flex: '1 1 25%',
                        minWidth: '350px',
                        maxWidth: '450px',
                        height: '20rem',
                    }}
                >
                    <div
                        className="card text-white bg-ultramarine text-center w-100 h-100"
                        style={{
                            borderRadius: '10px',
                        }}
                    >


                        <div className="card-body d-flex align-items-center justify-content-center fw-semibold fs-5 w-100">
                            {i === 0 && section === "Bookmarks" ? (
                                <div>Circulatory<br />Manifestation</div>
                            ) : (
                                <div>Topic {i + 1}</div>
                            )}
                        </div>
                    </div>
                </div>


            );
        }
        return cards;
    };


    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl fw-bold text-darkFuschia mb-6"> {userId.firstName}'s Dashboard</h1>

                {/* Tags Row */}
                <div className="flex items-center justify-center gap-2 mb-5 mt-5">
                    <div className="flex gap-2">
                        <FiChevronLeft
                            className={`cursor-pointer ${currentTagIndex === 0 ? 'text-gray-300' : 'text-gray-600'}`}
                            size={24}
                            onClick={prevTags}
                        />
                        {visibleTags.map((tag, index) => (
                            <span
                                key={currentTagIndex + index}
                                className={`px-4 py-2 rounded fw-medium mx-2 ${index % 2 === 0 ? 'text-white bg-darkFuschia' : 'text-black bg-celeste '
                                    }`}
                            >
                                {tag}
                            </span>
                        ))}
                        <FiChevronRight
                            className={`cursor-pointer ${currentTagIndex + tagsPerPage >= tags.length ? 'text-gray-300' : 'text-gray-600'}`}
                            size={24}
                            onClick={nextTags}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl space-y-8 flex items-center justify-center align-items">
                {/* Section: Bookmarks */}
                <Section title="Bookmarks" cards={renderCards(6, "Bookmarks")} />

                {/* Section: Recently Viewed */}
                <Section title="Recently Viewed" cards={renderCards(3, "Recently Viewed")} />

                {/* Section: Recommended Topics */}
                <Section title="Recommended Topics" cards={renderCards(3, "Recommended Topics")} />
            </div>
        </div>
    );
};

const Section = ({ title, cards }) => {
    const itemsPerPage = 3;
    const [currentPage, setCurrentPage] = useState(0);

    const totalPages = Math.ceil(cards.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const visibleCards = cards.slice(startIndex, startIndex + itemsPerPage);

    const handlePrev = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="mb-5">
            <h2 className="fs-2 fw-bold text-darkFuschia mb-3 mx-3">{title}</h2>
            <div className="d-flex align-items-center justify-content-center gap-2">
                <button
                    className="btn btn-link p-0 m-0"
                    onClick={handlePrev}
                    disabled={currentPage === 0}
                    style={{ minWidth: 'auto' }}
                >
                    <FiChevronLeft size={24} className="text-black" />
                </button>

                <div className="d-flex flex-column flex-md-row justify-content-center align-items-stretch gap-3">
                    {visibleCards}
                </div>

                <button
                    className="btn btn-link p-0 m-0"
                    onClick={handleNext}
                    disabled={currentPage >= totalPages - 1}
                    style={{ minWidth: 'auto' }}
                >
                    <FiChevronRight size={24} className="text-black" />
                </button>
            </div>


        </div>
    );
};



export default UserDashboard