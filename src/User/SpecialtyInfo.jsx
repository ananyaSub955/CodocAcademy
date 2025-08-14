import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import BackButton from '../components/BackButton';


const url = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://ananya.honor-itsolutions.com/";

const SpecialtyInfo = () => {
  const { specialty } = useParams();
  const [userId, setUserId] = useState(null);
  const [bookmarkedTopics, setBookmarkedTopics] = useState([]);

  const [structuredData, setStructuredData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [sessionLoading, setSessionLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  const [openAccordionKeys, setOpenAccordionKeys] = useState([]);

  const location = useLocation();
  const scrollToTopicId = location.state?.scrollToTopicId;



  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`${url}/session`, { credentials: "include" });
        const session = await res.json();

        if (session?.id) {
          setUserId(session.id);
          setBookmarkedTopics((session.bookmarks || []).map(b => ({
            _id: String(b._id).trim(),
            name: b.name || ""
          })));
        }
      } catch (err) {
        console.error("Session fetch failed:", err);
      } finally {
        setSessionLoading(false);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    if (!userId) return;

    setDataLoading(true);

    fetch(`${url}/${specialty}/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: specialty, userId })
    })
      .then(res => res.json())
      .then(result => {

        const rawData = (result.data || []).map(item => {
          const cleaned = {};
          Object.entries(item).forEach(([key, value]) => {
            cleaned[key.trim()] = typeof value === 'string' ? value.trim() : value;
          });
          return cleaned;
        });

        const grouped = {};

        rawData.forEach(item => {
          const cat = item.Category?.trim() || "Uncategorized";
          const sub = item.Subcategory?.trim() || "Unspecified Subcategory";

          if (!grouped[cat]) grouped[cat] = {};
          if (!grouped[cat][sub]) grouped[cat][sub] = [];

          grouped[cat][sub].push(item);

          // console.log(item);

        });

        setStructuredData(grouped);
      })
      .catch(console.error)
      .finally(() => setDataLoading(false));
  }, [specialty, userId]);

  useEffect(() => {
    if (!structuredData || !scrollToTopicId) return;

    const allItems = Object.values(structuredData).flatMap(subcats =>
      Object.values(subcats).flat()
    );

    const targetItem = allItems.find(item => String(item._id).trim() === String(scrollToTopicId).trim());

    if (targetItem) {
      setSelectedCategory(targetItem.Category);

      const key = Object.entries(structuredData[targetItem.Category] || {}).flatMap(
        ([_, items], subIdx) =>
          items.map((it, idx) =>
            String(it._id) === String(targetItem._id) ? `${subIdx}-${idx}` : null
          )
      ).filter(Boolean)[0];

      if (key) setOpenAccordionKeys(key);

      setTimeout(() => {
        const el = document.getElementById(`accordion-${scrollToTopicId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [structuredData, scrollToTopicId]);



  const getFieldValue = (item, target) => {
    const match = Object.keys(item).find(
      key => key.trim().toLowerCase() === target.trim().toLowerCase()
    );
    return match && item[match] ? item[match] : "—";
  };

  const TopicBody = ({ item }) => {
    return (
      <>
        <p><strong>ICD-10:</strong> {getFieldValue(item, "ICD 10")}</p>
        <p><strong>Clinical Tip:</strong> {getFieldValue(item, "Clinical tip")}</p>
        <p><strong>Coding/Documentation Tip:</strong> {getFieldValue(item, "Coding/Documentation tip")}</p>
      </>
    );
  };

  const isBookmarked = (item) => {
    const itemId = String(item._id).trim();
    return bookmarkedTopics.some(b => String(b._id).trim() === itemId);
  };


  const toggleBookmark = async (item) => {
    const itemId = String(item._id).trim();
    const alreadyBookmarked = isBookmarked(item);  // snapshot before state change
    const action = alreadyBookmarked ? "remove" : "add";

    console.log(`Toggling bookmark for item ${itemId}: ${action}`);

    try {
      const response = await fetch(`${url}/user/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId,
          action,
          bookmark: {
            _id: itemId,
            name: item.SubTopics || "Unnamed SubTopic",
            specialty: specialty,
            category: item.Category,
            subCategory: item.Subcategory
          }

        })
      });

      const result = await response.json();

      if (result.success) {
        setBookmarkedTopics(prev =>
          action === "add"
            ? [...prev, {
              _id: itemId,
              category: item.Category,
              name: item.SubTopics || "Unnamed SubTopic"
            }]
            : prev.filter(b => String(b._id) !== itemId)
        );
      }
    } catch (error) {
      console.error("Bookmark error:", error);
    }
  };


  if (sessionLoading || dataLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (

    <div className="flex-1 flex flex-col">
      <BackButton text="Back to Dashboard" link='/user/dashboard' />

      <h1 className="fs-1 fw-bold text-center text-darkFuschia mb-5">{specialty}</h1>

      <div className="container flex-grow">
        <div className="row">
          {/* Left column: Categories */}
          <div className="col-md-4 border-end">
            <h4 className="text-darkFuschia fs-2">Categories</h4>
            <div className="list-group mb-3">
              {Object.keys(structuredData).map((cat, i) => (
                <button
                  key={i}
                  className={`list-group-item list-group-item-action text-black ${cat === selectedCategory ? 'active custom-active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Right column: Subcategories + Subtopics */}
          <div className="col-md-8">
            {selectedCategory ? (
              <>
                <h4 className="mb-3 fs-2 ">{selectedCategory}</h4>
                {Object.entries(structuredData[selectedCategory]).map(([subcat, items], subIdx) => (
                  <div key={subIdx} className="mb-4">
                    <h5 className="text-ultramarine mb-2">{subcat}</h5>
                    <Accordion activeKey={openAccordionKeys} alwaysOpen>
                      {items.map((item, idx) => (
                        <Accordion.Item eventKey={`${subIdx}-${idx}`} key={idx}>
                          <div id={`accordion-${item._id}`}>
                            <Accordion.Header
                              onClick={() => {
                                const key = `${subIdx}-${idx}`;
                                setOpenAccordionKeys((prevKeys) =>
                                  prevKeys.includes(key)
                                    ? prevKeys.filter((k) => k !== key)
                                    : [...prevKeys, key]
                                );

                                // Log view if necessary
                                if (userId && item._id) {
                                  fetch(`${url}/user/recentlyViewed`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    credentials: "include",
                                    body: JSON.stringify({
                                      userId,
                                      topic: {
                                        _id: item._id,
                                        name: item.SubTopics || "Unnamed SubTopic",
                                        SubTopics: item.SubTopics,
                                        specialty: specialty,
                                        category: item.Category,
                                        subcategory: item.Subcategory
                                      }
                                    })
                                  }).catch(err => console.error("Track view error:", err));
                                }
                              }}
                            >

                              <div className="d-flex justify-content-between align-items-center w-100">
                                <span>{item.SubTopics || "Unnamed SubTopic"}</span>
                                <div className="d-flex align-items-center mr-4">
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleBookmark(item);
                                    }}
                                    className="cursor-pointer mx-2"
                                  >
                                    {isBookmarked(item) ? <FaBookmark color="#d10b65" /> : <FaRegBookmark />}
                                  </span>


                                </div>

                              </div>

                            </Accordion.Header>

                            <Accordion.Body>

                              <TopicBody item={item} />

                            </Accordion.Body>
                          </div>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-muted mt-4">Select a category to view more information.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialtyInfo;

