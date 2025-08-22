import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const url = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ananya.honor-itsolutions.com/node";

const UserDashboard = () => {
    const [userId, setUser] = useState(null);
    const [currentTagIndex, setCurrentTagIndex] = useState(0);
    const [specialties, setSpecialties] = useState([]);
    const [bookmarks, setBookmarkedTopics] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const tagScrollRef = useRef(null);
    //const [recommendations, setRecommendations] = useState([]);


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
                // fetch(`${url}/user/${data.id}/recommendations`, { credentials: "include" })
                //     .then(async (res) => {
                //         if (!res.ok) throw new Error("Failed to fetch recommendations");
                //         const recs = await res.json();
                //         console.log(recs);
                //         setRecommendations(recs);
                //     })
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
            navigate(`/user/${encodeURIComponent(specialtyName)}/info`, {
                state: {
                    userId: userId.id,
                    userBookmarks: bookmarks,
                },
            });
        } catch (error) {
            console.error("Error fetching specialty info:", error);
        }
    };

    function toTitleCase(str) {
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    const handleTopicClick = (topic) => {
        if (!topic?.specialty || !topic?._id) {
            console.error("Invalid topic structure:", topic);
            return;
        }
        navigate(`/user/${topic.specialty}/info`, {
            state: {
                userId: userId.id,
                userBookmarks: bookmarks,
                scrollToTopicId: topic._id,
            },
        });
    };


    const renderCards = (section, data = []) => {
        return data.map((item, i) => (
            // /<h1> ${item.name} </h1>
            <div
                key={`${section}-${i}`}
                className="d-flex justify-content-center"
                style={{
                    flex: '1 1 25%',
                    minWidth: '10em',
                    maxWidth: '400px',
                    height: '15rem',
                }}
                onClick={() => {
                    if (section === "Bookmarks" || section === "Recently Viewed") {
                        handleTopicClick(item);
                    } else {
                        handleTagClick(item.name);
                    }
                }}
            >

                <div
                    className={`cardHover card text-center w-100 h-100
                         ${section == "Recently Viewed"
                             ? 'bg-celeste text-dark' 
                             : 'bg-ultramarine text-white'}`}
                    style={{ borderRadius: '10px' }}
                >
                    <div className="card-body d-flex align-items-center justify-content-center fw-semibold fs-4 w-100">
                        {toTitleCase(item.SubTopics || item.name || `Topic ${i + 1}`)}
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
                <div className="relative w-full my-4 overflow-hidden">
                    <div className="relative w-full overflow-hidden">
                        <div
                            className="flex flex-nowrap overflow-x-auto no-scrollbar px-2 py-2 space-x-3"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            {specialties.map((tag, index) => (
                                <span
                                    key={tag.id}
                                    onClick={() => handleTagClick(tag.name)}
                                    className={`tagHover rounded me-2 cursor-pointer inline-block px-4 py-2 text-sm font-medium rounded-md 
                                        ${index % 2 === 0 ? 
                                            'bg-darkFuschia text-white' 
                                            :'bg-celeste text-black'
                                        }`}
                                    style={{
                                        whiteSpace: 'nowrap',
                                        flex: '0 0 auto',
                                    }}
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    </div>

                </div>


            </div>

            {/* Main Content */}
            <div className="max-w-4xl space-y-8 flex items-center justify-center align-items">
                <Section title="Bookmarks" cards={renderCards("Bookmarks", bookmarks)} />
                <Section title="Recently Viewed" cards={renderCards("Recently Viewed", recentlyViewed)} />
                {/* <Section title="Recommended Topics" cards={renderCards("Recommended Topics", recommendations)} /> */}
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
            {cards.length === 0 ? (
                <div className="text-center text-secondary fst-italic">
                    No {title.toLowerCase()} yet.
                </div>
            ) : (
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
            )}
        </div>
    );
};

export default UserDashboard;
