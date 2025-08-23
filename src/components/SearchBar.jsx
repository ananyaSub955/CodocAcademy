import React, { useState, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import '../styles/searchBar.css';

const url = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://ananya.honor-itsolutions.com/node";

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const fetchResults = async (q) => {
    if (!q?.trim()) { setResults([]); return; }
    try {
      setLoading(true);
      const res = await fetch(`${url}/search?q=${encodeURIComponent(q)}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query) { setResults([]); return; }
    debounceRef.current = setTimeout(() => fetchResults(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className='input-wrapper'>
      <FaSearch className='search-icon' />
      <input
        type="text"
        placeholder='Search by ICD-10 or SubTopic...'
        className='search-input'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <div className="search-loading">Searching…</div>}
      {!loading && results.length > 0 && (
        <div className="search-results">
          {results.map(r => (
            <div key={`${r.collection}:${r._id}`} className="search-result">
              <div className="result-title">{r.title}</div>
              <div className="result-meta">
                <span className="badge">{r.type}</span>
                <span className="badge">{r.collection}</span>
                {r.extra?.ICD10 && <span className="badge">ICD-10: {r.extra.ICD10}</span>}
              </div>
              {r.extra?.Category && <div className="result-snippet">Category: {r.extra.Category}</div>}
              {r.extra?.Subcategory && <div className="result-snippet">Subcategory: {r.extra.Subcategory}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
