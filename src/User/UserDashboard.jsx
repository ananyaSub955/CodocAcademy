import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const url = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://itws-4500-s25-team6.eastus.cloudapp.azure.com/node";

const UserDashboard = () => {
    const [userId, setUser] = useState(null);
    const [currentTagIndex, setCurrentTagIndex] = useState(0);
    const [specialties, setSpecialties] = useState([]);
    const [bookmarks, setBookmarkedTopics] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [recommendations, setRecommendations] = useState([]);


    const navigate = useNavigate();

    useEffect(() => {
        // Fetch session
        fetch(`${url}/session`, { credentials: "include" })
            .then(async (response) => {
                if (!response.ok) {
                    console.log("No session found");
                    navigate("/login");
                    return;
                }
                const data = await response.json();

                if (!data?.id) {
                    console.error("Session returned invalid user object:", data);
                    return;
                }

                setUser(data);
                //const userId = data.id;

                if (!data?.id) {
                    console.error("Session data missing user ID:", data);
                    return;
                }

                // Fetch user's bookmarks
                fetch(`${url}/user/${data.id}/bookmarks`, { credentials: "include" })
                    .then(async (res) => {
                        if (!res.ok) throw new Error("Failed to fetch bookmarks");
                        const bm = await res.json();
                        setBookmarkedTopics(bm); // Expects [{ _id, name }]
                    })
                    .catch(err => console.error("Bookmark fetch error:", err));

                fetch(`${url}/user/${data.id}/recentlyViewed`, { credentials: "include" })
                    .then(async (res) => {
                        if (!res.ok) throw new Error("Failed to fetch recently viewed");
                        const rv = await res.json();
                        const sorted = rv.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                        setRecentlyViewed(sorted.slice(0, 10));
                    })
                    .catch(err => console.error("Error fetching recently viewed:", err));
                fetch(`${url}/user/${data.id}/recommendations`, { credentials: "include" })
                    .then(async (res) => {
                        if (!res.ok) throw new Error("Failed to fetch recommendations");
                        const recs = await res.json();
                        console.log(recs);
                        setRecommendations(recs);
                    })
            })
            .catch(error => console.error("Error fetching session:", error));

        // Fetch specialties
        fetch(`${url}/specialties`, { credentials: "include" })
            .then(async (response) => {
                if (!response.ok) {
                    console.error("Failed to fetch specialties");
                    return;
                }
                const data = await response.json();
                setSpecialties(data); // Expects [{ id, name }]
            })
            .catch(error => console.error("Error fetching specialties:", error));
    }, []);

    const tagsPerPage = 5;
    const visibleTags = specialties.slice(currentTagIndex, currentTagIndex + tagsPerPage);

    const nextTags = () => {
        if (currentTagIndex + tagsPerPage < specialties.length) {
            setCurrentTagIndex(currentTagIndex + tagsPerPage);
        }
    };

    const prevTags = () => {
        if (currentTagIndex > 0) {
            setCurrentTagIndex(currentTagIndex - tagsPerPage);
        }
    };

    const handleTagClick = async (specialtyName) => {
        try {
            const response = await fetch(`${url}/${specialtyName}/info`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: specialtyName, userId: userId.id }),
            });

            if (!response.ok) throw new Error("Failed to fetch specialty info");

            const data = await response.json();
            navigate(`/user/${specialtyName}/info`, {
                state: {
                    userId: userId.id,
                    userBookmarks: bookmarks,
                },
            });
        } catch (error) {
            console.error("Error fetching specialty info:", error);
        }
    };

    const renderCards = (section, data = []) => {
        return data.map((item, i) => (
            <div
                key={`${section}-${i}`}
                className="d-flex justify-content-center"
                style={{
                    flex: '1 1 25%',
                    minWidth: '10em',
                    maxWidth: '400px',
                    height: '15rem',
                }}
            >
                <div
                    className={`card text-center w-100 h-100 ${section == "Recently Viewed" ? ' text-dark bg-celeste' : 'text-white bg-ultramarine'}`}
                    style={{ borderRadius: '10px' }}
                >
                    <div className="card-body d-flex align-items-center justify-content-center fw-semibold fs-4 w-100">
                        {item.SubTopics || item.name || `Topic ${i + 1}`}

                    </div>
                </div>
            </div>
        ));
    };

    if (!userId) {
        return <div className="text-center mt-10 text-xl text-gray-600">Loading your dashboard...</div>;
    }

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="fw-bold text-darkFuschia mb-6">{userId.firstName}'s Dashboard</h1>

                {/* Tags Row */}
                <div className="flex items-center justify-center gap-2 mb-5 mt-5">
                    <div className="flex gap-2">
                        <FiChevronLeft
                            className={`cursor-pointer ${currentTagIndex === 0 ? 'text-gray-300' : 'text-black'}`}
                            size={24}
                            onClick={prevTags}
                        />
                        {visibleTags.map((tag, index) => (
                            <span
                                key={tag.id}
                                className={`px-4 py-2 rounded fw-medium mx-2 cursor-pointer ${index % 2 === 0 ? 'text-white bg-darkFuschia' : 'text-black bg-celeste'}`}
                                onClick={() => handleTagClick(tag.name)}
                            >
                                {tag.name}
                            </span>
                        ))}
                        <FiChevronRight
                            className={`cursor-pointer ${(currentTagIndex + tagsPerPage) >= specialties.length ? 'text-gray-300' : 'text-black'}`}
                            size={24}
                            onClick={nextTags}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl space-y-8 flex items-center justify-center align-items">
                <Section title="Bookmarks" cards={renderCards("Bookmarks", bookmarks)} />
                <Section title="Recently Viewed" cards={renderCards("Recently Viewed", recentlyViewed)} />
                <Section title="Recommended Topics" cards={renderCards("Recommended Topics", recommendations)} />
            </div>
        </div>
    );
};

const Section = ({ title, cards }) => {
    const itemsPerPage = 5;
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
                    <FiChevronLeft
                        size={24}
                        className={currentPage === 0 ? 'text-gray-300' : 'text-black'}
                    />
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
                    <FiChevronRight
                        size={24}
                        className={currentPage === 0 ? 'text-gray-300' : 'text-black'}
                    />
                </button>
            </div>
        </div>
    );
};

export default UserDashboard;
