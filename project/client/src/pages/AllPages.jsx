// src/pages/AllPages.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/AllJournals.css'; // reuse styles
import axios from 'axios';

const AllPages = () => {
  const navigate = useNavigate();
  const { journalId } = useParams();

  const [journal, setJournal] = useState(null);
  const [pages, setPages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterTags, setFilterTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract unique locations and tags from pages
  const getUniqueLocations = () => {
    const locationSet = new Set();
    pages.forEach(page => {
      if (page.metadata?.location && page.metadata.location.trim()) {
        locationSet.add(page.metadata.location.trim());
      }
    });
    return Array.from(locationSet).sort();
  };

  const getUniqueTags = () => {
    const tagSet = new Set();
    pages.forEach(page => {
      if (page.metadata?.tags) {
        let tags = page.metadata.tags;
        // Handle both array and string formats
        if (typeof tags === 'string') {
          tags = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
        }
        if (Array.isArray(tags)) {
          tags.forEach(tag => {
            if (tag && tag.trim()) {
              tagSet.add(tag.trim());
            }
          });
        }
      }
    });
    return Array.from(tagSet).sort();
  };

  const locations = getUniqueLocations();
  const tags = getUniqueTags();

  useEffect(() => {
    fetchJournalAndPages();
  }, [journalId]);

  const fetchJournalAndPages = async () => {
    try {
      setLoading(true);

      // fetch journal info
      const journalRes = await axios.get(`http://localhost:3000/api/journals/${journalId}`, {
        withCredentials: true,
      });
      setJournal(journalRes.data);

      // fetch pages for this journal
      const pagesRes = await axios.get(`http://localhost:3000/api/journals/${journalId}/pages`, {
        withCredentials: true,
      });
      setPages(pagesRes.data);

    } catch (err) {
      console.error('Error fetching pages:', err);
      if (err.response?.status === 401) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/journals');

  // Helper function to get page display title
  const getPageTitle = (page) => {
    // First check for saved title in metadata
    if (page.metadata?.title) return page.metadata.title;
    // Then check for prompt
    if (page.prompt) return page.prompt;
    // Then check for first text element
    if (page.textElements && page.textElements.length > 0) {
      return page.textElements[0].text || 'Untitled Page';
    }
    return 'Untitled Page';
  };

  const filteredPages = pages
    .filter(p => {
      const title = getPageTitle(p);
      return title.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .filter(p => {
      if (!filterDate) return true;
      // Filter by year-month (format: YYYY-MM)
      const pageDate = p.createdAt || p.metadata?.date;
      if (!pageDate) return false;
      const dateObj = new Date(pageDate);
      const pageYearMonth = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      return pageYearMonth === filterDate;
    })
    .filter(p => {
      if (!filterLocation) return true;
      return p.metadata?.location === filterLocation;
    })
    .filter(p => {
      if (filterTags.length === 0) return true;
      const pageTags = p.metadata?.tags || [];
      let pageTagsArray = [];
      if (typeof pageTags === 'string') {
        pageTagsArray = pageTags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      } else if (Array.isArray(pageTags)) {
        pageTagsArray = pageTags.map(t => typeof t === 'string' ? t.trim() : t);
      }
      // Check if all selected filter tags are present in page tags
      return filterTags.every(filterTag => 
        pageTagsArray.some(pageTag => 
          (typeof pageTag === 'string' ? pageTag.toLowerCase() : String(pageTag).toLowerCase()) === 
          filterTag.toLowerCase()
        )
      );
    });

  const handleViewPage = (pageId) => {
    navigate(`/journals/${journalId}/pages/${pageId}`);
  };

  const handleAddPage = () => {
    navigate(`/journals/${journalId}/pages/add`);
  };

  const toggleTag = (tag) => {
    setFilterTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (loading) {
    return (
      <div className="all-journals-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-journals-page">
      <i className="fa-solid fa-arrow-left back-button" onClick={handleBack} title="Back to Journals"></i>
      <h2>{journal?.name || 'Pages'}</h2>
      
      {journal?.description && (
        <p className="journal-description-subtitle">{journal.description}</p>
      )}

      {/* Search and Add Page Button Row */}
      <div className="search-create-row">
        <div className="search-container">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            placeholder="Search pages..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-filled" onClick={handleAddPage}>
          <i className="fa-solid fa-plus"></i>
          Add a Page
        </button>
      </div>

      {/* Filters */}
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
            {locations.length > 0 ? (
              locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))
            ) : (
              <option disabled>No locations available</option>
            )}
          </select>
        </div>

        <div className="filter-group tags">
          <label>Tags:</label>
          {tags.length > 0 ? (
            tags.map(tag => (
              <button
                key={tag}
                className={filterTags.includes(tag) ? 'selected' : ''}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))
          ) : (
            <span className="no-tags-message">No tags available</span>
          )}
        </div>
      </div>

      {/* Page Cards */}
      {filteredPages.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-file-lines"></i>
          <h3>No pages found</h3>
          <p>
            {pages.length === 0 
              ? "Add your first page to this journal!"
              : "Try adjusting your search or filters."
            }
          </p>
          {pages.length === 0 && (
            <button className="btn-filled" onClick={handleAddPage}>
              Add Your First Page
            </button>
          )}
        </div>
      ) : (
        <div className="journal-cards">
          {filteredPages.map(page => (
            <div key={page.id} className="journal-card" onClick={() => handleViewPage(page.id)}>
              <div className="journal-cover">
                {page.pageBackgroundImage ? (
                  <img 
                    src={
                      page.pageBackgroundImage?.startsWith('/pages') 
                        ? page.pageBackgroundImage 
                        : `http://localhost:3000${page.pageBackgroundImage}`
                    }
                    alt="Page background" 
                  />
                ) : (
                  <div 
                    className="color-cover" 
                    style={{ backgroundColor: page.pageColor || '#FFFFFF' }}
                  ></div>
                )}
              </div>

              <div className="journal-info">
                <div className="journal-header">
                  <h2>{getPageTitle(page)}</h2>
                  <button 
                    className="add-page-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPage(page.id);
                    }}
                    aria-label="View page"
                  >
                    <i className="fa-solid fa-eye"></i>
                  </button>
                </div>

                <div className="journal-meta">
                  <span className="page-count">
                    {new Date(page.createdAt).toLocaleDateString()}
                  </span>
                  {page.metadata?.location && <span className="page-count"> | {page.metadata.location}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllPages;
