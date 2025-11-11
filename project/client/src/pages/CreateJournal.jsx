// src/pages/CreateJournal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/CreateJournal.css';
import axios from 'axios';

// Cover options with colors and their corresponding image paths
const coverOptions = [
  { color: '#FFFFFF', name: 'white', image: null }, // White/blank default
  { color: '#FFB6D9', name: 'pink', image: '/covers/pinkcover.jpg' },
  { color: '#9ED9CC', name: 'green', image: '/covers/greencover.jpg' },
  { color: '#A0CED9', name: 'blue', image: '/covers/bluecover.jpg' },
  { color: '#FFD580', name: 'yellow', image: '/covers/yellowcover.jpg' },
  { color: '#B8B8B8', name: 'gray', image: '/covers/graycover.jpg' },
];

const CreateJournal = () => {
  const navigate = useNavigate();

  const [journalName, setJournalName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCover, setSelectedCover] = useState(coverOptions[0]); // Default to white
  const [customImage, setCustomImage] = useState(null); // For user uploaded image
  const [customImagePreview, setCustomImagePreview] = useState(null);

  // Back button handler
  const handleBack = () => navigate('/journals');

  // Handle cover selection
  const handleCoverSelect = (cover) => {
    setSelectedCover(cover);
    // Clear custom image when selecting a preset cover
    setCustomImage(null);
    setCustomImagePreview(null);
  };

  // Handle custom image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomImagePreview(reader.result);
      setCustomImage(file);
      // Clear selected preset cover when uploading custom image
      setSelectedCover({ color: '#FFFFFF', name: 'custom', image: null });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!journalName.trim()) {
      alert('Please enter a journal name.');
      return;
    }

    // If user uploaded a custom image, we need to handle it differently
    if (customImage) {
      const formData = new FormData();
      formData.append('name', journalName.trim());
      formData.append('description', description.trim());
      formData.append('coverImage', customImage);
      formData.append('coverColor', selectedCover.color);
      formData.append('coverName', 'custom');

      try {
        const response = await axios.post('http://localhost:3000/api/journals', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
        
        console.log('Journal created:', response.data);
        navigate('/journals');
      } catch (err) {
        console.error('Error creating journal:', err);
        if (err.response?.status === 401) {
          alert('Please log in to create a journal.');
          navigate('/login');
        } else {
          alert('Failed to create journal. Please try again.');
        }
      }
    } else {
      // Use preset cover
      const journalData = {
        name: journalName.trim(),
        description: description.trim(),
        coverImage: selectedCover.image,
        coverColor: selectedCover.color,
        coverName: selectedCover.name,
        createdAt: new Date().toISOString(),
      };

      try {
        const response = await axios.post('http://localhost:3000/api/journals', journalData, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
        
        console.log('Journal created:', response.data);
        navigate('/journals');
      } catch (err) {
        console.error('Error creating journal:', err);
        if (err.response?.status === 401) {
          alert('Please log in to create a journal.');
          navigate('/login');
        } else {
          alert('Failed to create journal. Please try again.');
        }
      }
    }
  };

  return (
    <div className="create-journal-page">
      <i className="fa-solid fa-arrow-left back-button" onClick={handleBack} title="Back to Journals"></i>
      <h1>Create New Journal</h1>

      <div className="create-journal-container">
        {/* Left: Cover preview */}
        <div className="cover-preview-section">
          <div className="cover-preview">
            {customImagePreview ? (
              // Show custom uploaded image
              <img 
                src={customImagePreview} 
                alt="Custom journal cover"
                className="cover-image"
              />
            ) : selectedCover.image ? (
              // Show preset cover image
              <img 
                src={selectedCover.image} 
                alt={`${selectedCover.name} journal cover`}
                className="cover-image"
              />
            ) : (
              // Show white/blank cover
              <div 
                className="color-cover" 
                style={{ backgroundColor: selectedCover.color }}
              >
                <span className="blank-cover-text">Blank Cover</span>
              </div>
            )}
          </div>

          {/* Upload custom image option */}
          <div className="upload-section">
            <label htmlFor="image-upload" className="upload-label">
              <i className="fa-solid fa-upload"></i>
              Upload Custom Image
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
                  className={`color-circle ${selectedCover.name === cover.name && !customImagePreview ? 'selected' : ''}`}
                  style={{ backgroundColor: cover.color, border: cover.name === 'white' ? '2px solid #e5e7eb' : 'none' }}
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
                  {selectedCover.name === cover.name && !customImagePreview && (
                    <i className="fa-solid fa-check" style={{ color: cover.name === 'white' ? '#6b7280' : '#ffffff' }}></i>
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

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={handleBack}>
              Cancel
            </button>
            <button type="submit" className="btn-filled">
              Create Journal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJournal;