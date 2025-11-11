// src/pages/AllJournals.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AllJournals.css';
import axios from 'axios';

const AllJournals = () => {
  const navigate = useNavigate();

  const [journals, setJournals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterTags, setFilterTags] = useState([]);

  const locations = ['New York', 'Los Angeles', 'Chicago', 'Other'];
  const tags = ['Travel', 'Work', 'Personal', 'School'];

  useEffect(() => {
    axios.get('/api/journals')
      .then(res => setJournals(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredJournals = journals
    .filter(j => j.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(j => filterDate ? j.date.includes(filterDate) : true)
    .filter(j => filterLocation ? j.location === filterLocation : true)
    .filter(j => filterTags.length > 0 ? filterTags.every(tag => j.tags.includes(tag)) : true);

  const handleAddPage = (journalId) => {
    navigate(`/journals/${journalId}/pages/add`);
  };

  const toggleTag = (tag) => {
    setFilterTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleCreateJournal = () => {
    navigate('/journals/create');
  };

  return (
    <div className="all-journals-page">
      <div className="header">
        <h2>All Journals</h2>
        <button className="btn-filled" onClick={handleCreateJournal}>
          Create New Journal
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search journals"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filters">
        <span className="filters-label">Filters:</span>

        <div className="filter-group">
          <label>Date:</label>
          <input
            type="month"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Location:</label>
          <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)}>
            <option value="">All</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="filter-group tags">
          <label>Tags:</label>
          {tags.map(tag => (
            <button
              key={tag}
              className={filterTags.includes(tag) ? 'selected' : ''}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="journal-cards">
        {filteredJournals.map(journal => (
          <div key={journal.id} className="journal-card">
            <div className="journal-image" style={{ backgroundColor: journal.color || '#fff' }}></div>
            <div className="journal-info">
              <div className="journal-text">
                <h2>{journal.name}</h2>
                {journal.description && <p>{journal.description}</p>}
              </div>
              <i
                className="fa-solid fa-square-plus add-page-icon"
                title="Add Page"
                onClick={() => handleAddPage(journal.id)}
              ></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllJournals;
