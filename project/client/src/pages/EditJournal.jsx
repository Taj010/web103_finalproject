// src/pages/EditJournal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/CreateJournal.css'; // Reuse CreateJournal styles
import axios from 'axios';

// Cover options - same as CreateJournal
const coverOptions = [
  { color: '#FFB6D9', name: 'pink', image: '/covers/pinkcover.jpg' },
  { color: '#9ED9CC', name: 'green', image: '/covers/greencover.jpg' },
  { color: '#A0CED9', name: 'blue', image: '/covers/bluecover.jpg' },
  { color: '#FFD580', name: 'yellow', image: '/covers/yellowcover.jpg' },
  { color: '#B8B8B8', name: 'gray', image: '/covers/graycover.jpg' },
];

const EditJournal = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get journal ID from URL

  const [journalName, setJournalName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCover, setSelectedCover] = useState(null);
  const [currentCoverImage, setCurrentCoverImage] = useState(null); // Store the existing cover
  const [customImage, setCustomImage] = useState(null);
  const [customImagePreview, setCustomImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState(null);

  // Fetch journal data on mount
  useEffect(() => {
    fetchJournal();
  }, [id]);

  const fetchJournal = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/journals/${id}`, {
        withCredentials: true,
      });
      
      const journal = response.data;
      setJournalName(journal.name);
      setDescription(journal.description || '');
      setOriginalData(journal);
      
      // Determine which type of cover the journal has
      if (journal.coverImage) {
        // Check if it's a preset cover
        const preset = coverOptions.find(c => c.image === journal.coverImage);
        if (preset) {
          // It's a preset cover
          setSelectedCover(preset);
        } else {
          // It's a custom uploaded image
          setCurrentCoverImage(journal.coverImage);
          setCustomImagePreview(journal.coverImage);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching journal:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 404) {
        alert('Journal not found');
        navigate('/journals');
      }
    }
  };

  const handleBack = () => navigate('/journals');

  const handleCoverSelect = (cover) => {
    setSelectedCover(cover);
    setCustomImage(null);
    setCustomImagePreview(null);
    setCurrentCoverImage(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomImagePreview(reader.result);
      setCustomImage(file);
      setSelectedCover(null);
      setCurrentCoverImage(null);
    };
    reader.readAsDataURL(file);
  };

  const hasChanges = () => {
    if (!originalData) return false;
    
    if (journalName.trim() !== originalData.name) return true;
    if (description.trim() !== (originalData.description || '')) return true;
    if (customImage) return true; // New image uploaded
    if (selectedCover && selectedCover.image !== originalData.coverImage) return true;
    
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!journalName.trim()) {
      alert('Please enter a journal name.');
      return;
    }

    if (!hasChanges()) {
      alert('No changes detected.');
      return;
    }

    // If user uploaded a new custom image
    if (customImage) {
      const formData = new FormData();
      formData.append('name', journalName.trim());
      formData.append('description', description.trim());
      formData.append('coverImage', customImage);
      formData.append('coverColor', '#FFFFFF');
      formData.append('coverName', 'custom');

      try {
        const response = await axios.put(`http://localhost:3000/api/journals/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
        
        console.log('Journal updated:', response.data);
        navigate('/journals');
      } catch (err) {
        console.error('Error updating journal:', err);
        alert('Failed to update journal. Please try again.');
      }
    } else {
      // Use preset cover or keep existing custom image
      const journalData = {
        name: journalName.trim(),
        description: description.trim(),
        coverImage: selectedCover?.image || currentCoverImage,
        coverColor: selectedCover?.color || originalData.coverColor,
        coverName: selectedCover?.name || originalData.coverName,
      };

      try {
        const response = await axios.put(`http://localhost:3000/api/journals/${id}`, journalData, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
        
        console.log('Journal updated:', response.data);
        navigate('/journals');
      } catch (err) {
        console.error('Error updating journal:', err);
        alert('Failed to update journal. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="create-journal-page">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner" style={{
            width: '50px',
            height: '50px',
            margin: '0 auto 1rem',
            border: '4px solid #e5e7eb',
            borderTopColor: '#8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-journal-page">
      <i className="fa-solid fa-arrow-left back-button" onClick={handleBack} title="Back to Journals"></i>
      <h1>Edit Journal</h1>

      <div className="create-journal-container">
        {/* Left: Cover preview */}
        <div className="cover-preview-section">
          <div className="cover-preview">
            {customImagePreview ? (
              // Show custom uploaded image (new or existing)
              <img 
                src={customImagePreview} 
                alt="Journal cover"
                className="cover-image"
              />
            ) : selectedCover?.image ? (
              // Show selected preset cover
              <img 
                src={selectedCover.image} 
                alt={`${selectedCover.name} journal cover`}
                className="cover-image"
              />
            ) : (
              // Fallback (shouldn't happen in edit mode)
              <div 
                className="color-cover" 
                style={{ backgroundColor: originalData?.coverColor || '#FFFFFF' }}
              >
                <div className="blank-cover-content">
                  <i className="fa-solid fa-image blank-cover-icon"></i>
                  <span className="blank-cover-text">Choose a cover below</span>
                </div>
              </div>
            )}
          </div>

          {/* Upload custom image option */}
          <div className="upload-section">
            <label htmlFor="image-upload" className="upload-label">
              <i className="fa-solid fa-upload"></i>
              Upload New Cover Image
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Preset color options */}
          <div className="color-options">
            <p className="color-options-label">Or choose a preset:</p>
            <div className="color-circles">
              {coverOptions.map((cover) => (
                <div
                  key={cover.name}
                  className={`color-circle ${selectedCover?.name === cover.name ? 'selected' : ''}`}
                  style={{ backgroundColor: cover.color }}
                  onClick={() => handleCoverSelect(cover)}
                  title={`${cover.name} cover`}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleCoverSelect(cover);
                    }
                  }}
                >
                  {selectedCover?.name === cover.name && (
                    <i className="fa-solid fa-check"></i>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form inputs */}
        <form className="journal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="journal-name">Journal Name *</label>
            <input
              id="journal-name"
              type="text"
              value={journalName}
              onChange={(e) => setJournalName(e.target.value)}
              placeholder="My Amazing Journal"
              maxLength={50}
              required
            />
            <span className="char-count">{journalName.length}/50</span>
          </div>

          <div className="form-group">
            <label htmlFor="journal-description">Description (optional)</label>
            <textarea
              id="journal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this journal about?"
              maxLength={200}
              rows={4}
            />
            <span className="char-count">{description.length}/200</span>
          </div>

          {/* Show changes indicator */}
          {hasChanges() && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>You have unsaved changes</span>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={handleBack}>
              Cancel
            </button>
            <button type="submit" className="btn-filled" disabled={!hasChanges()}>
              <i className="fa-solid fa-floppy-disk"></i>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJournal;