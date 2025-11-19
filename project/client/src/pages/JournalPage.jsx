import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import '../css/PageDetails.css';

const JournalPage = () => {
  const navigate = useNavigate();
  const { journalId, pageId } = useParams();

  const [pageData, setPageData] = useState(null);
  const [journalData, setJournalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
    if (journalId && pageId) {
        setIsLoading(true);

        // Fetch journal info
        fetch(`https://stickerbackend.onrender.com/api/journals/${journalId}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setJournalData(data))
        .catch(err => console.error('Failed to fetch journal:', err));

        // Fetch current page
        fetch(`https://stickerbackend.onrender.com/api/journals/${journalId}/pages/${pageId}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setPageData(data))
        .catch(err => console.error('Failed to fetch page:', err));

        // Fetch all pages to handle "Next"
        fetch(`https://stickerbackend.onrender.com/api/journals/${journalId}/pages`, { credentials: 'include' })
        .then(res => res.json())
        .then(pages => setJournalData(prev => ({ ...prev, pages }))) // merge pages into journalData
        .catch(err => console.error('Failed to fetch all pages:', err))
        .finally(() => setIsLoading(false));
    }
    }, [journalId, pageId]);

  const handleBack = () => {
    navigate(`/journals/${journalId}`);
  };

    const handleNext = () => {
    if (!journalData?.pages || !pageData) return;

    // Find current page index
    const currentIndex = journalData.pages.findIndex(p => p.id === pageData.id);
    if (currentIndex === -1) return;

    // Wrap around if at the end
    const nextIndex = currentIndex + 1 < journalData.pages.length ? currentIndex + 1 : 0;
    const nextPageId = journalData.pages[nextIndex].id;

    navigate(`/journals/${journalId}/view/${nextPageId}`);
    };

  const renderPagePreview = () => {
    if (isLoading) return <div className="page-preview-loading">Loading...</div>;
    if (!pageData) return <div className="page-preview-empty">No page data available</div>;

    const getBackgroundStyle = () => {
      if (pageData.pageBackgroundImage) {
        return {
          backgroundImage: `url(${pageData.pageBackgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      }
      const colorMap = {
        white: '#ffffff',
        gray: '#808080',
        black: '#000000'
      };
      return { backgroundColor: colorMap[pageData.pageColor] || '#ffffff' };
    };

    const getTextColor = () => {
      if (pageData.pageBackgroundImage) {
        const darkBackgrounds = ['black.jpg'];
        const isDark = darkBackgrounds.some(bg => pageData.pageBackgroundImage.includes(bg));
        return isDark ? '#ffffff' : '#000000';
      }
      return pageData.pageColor === 'black' ? '#ffffff' : '#000000';
    };

    const getSpotifyEmbedUrl = (url) => {
      if (!url) return null;
      const trackMatch = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
      return trackMatch ? `https://open.spotify.com/embed/track/${trackMatch[1]}?utm_source=generator` : null;
    };

    return (
      <div
        className="page-preview-canvas"
        style={{
          ...getBackgroundStyle(),
          color: getTextColor(),
          minHeight: '500px',
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3',
          fontFamily: "'Rubik', sans-serif"
        }}
      >
        {/* Images */}
        {pageData.images?.map(image => (
          <div
            key={image.id}
            className="page-preview-image"
            style={{
              position: 'absolute',
              left: `${(image.x / 800) * 100}%`,
              top: `${(image.y / 600) * 100}%`,
              width: `${(image.width / 800) * 100}%`,
              maxWidth: '150px'
            }}
          >
            <img src={image.data} alt={image.fileName} style={{ width: '100%', height: 'auto' }} />
          </div>
        ))}

        {/* Doodle */}
        {pageData.doodle && (
          <img
            src={pageData.doodle}
            alt="Doodle"
            className="page-preview-doodle"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Stickers */}
        {pageData.stickers?.map(sticker => (
          <div
            key={sticker.id}
            className="page-preview-sticker"
            style={{
              position: 'absolute',
              left: `${(sticker.x / 800) * 100}%`,
              top: `${(sticker.y / 600) * 100}%`,
              fontSize: '2rem'
            }}
          >
            {sticker.type === 'image' && sticker.image ? (
              <img src={sticker.image} alt={sticker.name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
            ) : (
              <span>{sticker.emoji}</span>
            )}
          </div>
        ))}

        {/* Text Elements */}
        {pageData.textElements?.map(text => (
          <div
            key={text.id}
            className="page-preview-text"
            style={{
              position: 'absolute',
              left: `${(text.x / 800) * 100}%`,
              top: `${(text.y / 600) * 100}%`,
              fontSize: `${(text.fontSize / 800) * 100}%`,
              color: text.color,
              fontFamily: "'Rubik', sans-serif"
            }}
          >
            {text.content}
          </div>
        ))}
      </div>
    );
  };

  const renderFormFields = () => {
    if (!pageData || !pageData.metadata) return <div>No metadata available</div>;

    const tagsArray = (() => {
      let tags = pageData.metadata.tags || [];
      if (typeof tags === 'string') tags = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      return Array.isArray(tags) && tags.length > 0 ? tags : [];
    })();

    return (
      <>
        <div className="page-form-field">
          <label className="page-form-label">Title</label>
          <div className="page-form-readonly">{pageData.metadata.title || 'N/A'}</div>
        </div>

        {pageData.prompt && (
          <div className="page-form-field">
            <label className="page-form-label">Prompt</label>
            <div className="page-form-prompt-display">{pageData.prompt}</div>
          </div>
        )}

        {pageData.spotifyUrl && (
          <div className="page-form-field">
            <label className="page-form-label">Spotify Song</label>
            <div className="page-form-spotify-display">
              <iframe
                title="Spotify song"
                src={`https://open.spotify.com/embed/track/${pageData.spotifyUrl.split('/track/')[1]}?utm_source=generator`}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          </div>
        )}

        <div className="page-form-field">
          <label className="page-form-label">Date</label>
          <div className="page-form-readonly">{pageData.metadata.date || 'N/A'}</div>
        </div>

        <div className="page-form-field">
          <label className="page-form-label">Location</label>
          <div className="page-form-readonly">{pageData.metadata.location || 'N/A'}</div>
        </div>

        <div className="page-form-field">
          <label className="page-form-label">Description</label>
          <div className="page-form-readonly">{pageData.metadata.description || 'N/A'}</div>
        </div>

        <div className="page-form-field">
          <label className="page-form-label">Tags</label>
          <div className="tags-display-readonly">
            {tagsArray.length > 0
              ? tagsArray.map((tag, index) => <span key={index} className="tag-chip-readonly">{tag}</span>)
              : <span className="no-tags">No tags</span>}
          </div>
        </div>
      </>
    );
  };

  const renderFooterActions = () => (
    <>
      <button className="page-footer-btn back" onClick={handleBack}>
        Back
      </button>
      <button className="page-footer-btn primary" onClick={handleNext} disabled={!pageData}>
        Next
      </button>
    </>
  );

  return (
    <PageLayout
      title={journalData ? `Journal Page - ${journalData.name}` : 'Journal Page'}
      pagePreview={renderPagePreview()}
      formFields={renderFormFields()}
      footerActions={renderFooterActions()}
      mode="journal"
    />
  );
};

export default JournalPage;
