import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditorSidebar from '../components/EditorSidebar';
import '../css/AddPage.css';

const AddPage = () => {
  const navigate = useNavigate();
  const { journalId } = useParams();

  // Step 6: Sticker Library
  const stickerLibrary = [
    { id: 1, emoji: '⭐', name: 'Star' },
    { id: 2, emoji: '❤️', name: 'Heart' },
    { id: 3, emoji: '🎉', name: 'Party' },
    { id: 4, emoji: '🌟', name: 'Sparkle' },
    { id: 5, emoji: '💫', name: 'Dizzy' },
    { id: 6, emoji: '✨', name: 'Sparkles' },
    { id: 7, emoji: '🎈', name: 'Balloon' },
    { id: 8, emoji: '🎊', name: 'Confetti' },
    { id: 9, emoji: '💝', name: 'Gift Heart' },
    { id: 10, emoji: '🎁', name: 'Gift' },
    { id: 11, emoji: '🌸', name: 'Cherry Blossom' },
    { id: 12, emoji: '🌺', name: 'Hibiscus' }
  ];

  // Step 3: State Management
  const [pageData, setPageData] = useState({
    pageColor: 'white',
    images: [],
    stickers: [],
    textElements: [],
    doodle: null,
    spotifyUrl: null,
    prompt: null
  });

  const [expandedSections, setExpandedSections] = useState({
    stickers: false,
    doodles: false,
    text: false,
    upload: false
  });

  // Step 7: Doodle State
  const [isDoodling, setIsDoodling] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const doodleCanvasRef = useRef(null);
  const pageCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // Step 8: Text State
  const [textInput, setTextInput] = useState('');
  const [textSize, setTextSize] = useState(24);
  const [textColor, setTextColor] = useState('#000000');

  // Helper function to update page color
  const updatePageColor = (color) => {
    setPageData(prev => ({ ...prev, pageColor: color }));
  };

  // Helper function to toggle sections
  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const getCanvasBackgroundColor = () => {
    const colorMap = {
      'white': '#ffffff',
      'gray': '#808080',
      'black': '#000000'
    };
    return colorMap[pageData.pageColor] || '#ffffff';
  };

  const getCanvasTextColor = () => {
    return pageData.pageColor === 'black' ? '#ffffff' : '#000000';
  };

  // Step 6: Sticker Functions
  const handleStickerClick = (sticker) => {
    const stickerId = `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const canvasRect = pageCanvasRef.current?.getBoundingClientRect();
    const centerX = canvasRect ? canvasRect.width / 2 - 40 : 400;
    const centerY = canvasRect ? canvasRect.height / 2 - 40 : 300;

    const stickerData = {
      id: stickerId,
      stickerId: sticker.id,
      emoji: sticker.emoji,
      name: sticker.name,
      x: centerX,
      y: centerY,
      rotation: 0
    };

    setPageData(prev => ({
      ...prev,
      stickers: [...prev.stickers, stickerData]
    }));
  };

  const updateStickerPosition = (stickerId, newX, newY) => {
    setPageData(prev => ({
      ...prev,
      stickers: prev.stickers.map(sticker =>
        sticker.id === stickerId ? { ...sticker, x: newX, y: newY } : sticker
      )
    }));
  };

  // Step 7: Doodle Functions
  const setupDoodleCanvas = () => {
    const canvas = doodleCanvasRef.current;
    const container = pageCanvasRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const startDoodling = () => {
    setIsDoodling(true);
    setupDoodleCanvas();
  };

  const stopDoodling = () => {
    setIsDoodling(false);
    isDrawingRef.current = false;
    saveDoodle();
  };

  const saveDoodle = () => {
    const canvas = doodleCanvasRef.current;
    if (!canvas) return;
    const imageData = canvas.toDataURL('image/png');
    setPageData(prev => ({ ...prev, doodle: imageData }));
  };

  const clearDoodle = () => {
    const canvas = doodleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getCanvasCoordinates = (e) => {
    const canvas = doodleCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (!isDoodling) return;
    isDrawingRef.current = true;
    const coords = getCanvasCoordinates(e);
    lastPosRef.current = coords;
  };

  const draw = (e) => {
    if (!isDoodling || !isDrawingRef.current) return;
    const canvas = doodleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastPosRef.current = coords;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  // Step 8: Text Functions
  const handleAddText = () => {
    if (!textInput.trim()) {
      alert('Please enter some text');
      return;
    }

    const textId = `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const canvasRect = pageCanvasRef.current?.getBoundingClientRect();
    const centerX = canvasRect ? canvasRect.width / 2 : 400;
    const centerY = canvasRect ? canvasRect.height / 2 : 300;

    const textData = {
      id: textId,
      content: textInput,
      x: centerX,
      y: centerY,
      fontSize: textSize,
      color: textColor
    };

    setPageData(prev => ({
      ...prev,
      textElements: [...prev.textElements, textData]
    }));

    setTextInput('');
  };

  const updateTextPosition = (textId, newX, newY) => {
    setPageData(prev => ({
      ...prev,
      textElements: prev.textElements.map(text =>
        text.id === textId ? { ...text, x: newX, y: newY } : text
      )
    }));
  };

  // Step 11: Right Sidebar Action Button Handlers
  const handleMusicClick = () => {
    // TODO: Open Spotify URL input (modal or expandable)
    alert('Music button clicked - Spotify integration coming soon!');
  };

  const handleChatBubbleClick = () => {
    // TODO: Open prompt generator (modal or expandable) 
    alert('Chat bubble clicked - Prompt generator coming soon!');
  };

  // Step 9: Image Upload Functions
  const validateImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.');
      return false;
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size too large. Please upload an image smaller than 10MB.');
      return false;
    }
    return true;
  };

  const handleImageUpload = (file) => {
    if (!validateImageFile(file)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      const imageId = `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const canvasRect = pageCanvasRef.current?.getBoundingClientRect();
      const centerX = canvasRect ? canvasRect.width / 2 - 150 : 400;
      const centerY = canvasRect ? canvasRect.height / 2 - 150 : 300;

      const imageDataObj = {
        id: imageId,
        data: imageData,
        fileName: file.name,
        x: centerX,
        y: centerY,
        width: 300,
        height: 300
      };

      setPageData(prev => ({
        ...prev,
        images: [...prev.images, imageDataObj]
      }));
    };
    reader.readAsDataURL(file);
  };

  const updateImagePosition = (imageId, newX, newY) => {
    setPageData(prev => ({
      ...prev,
      images: prev.images.map(img =>
        img.id === imageId ? { ...img, x: newX, y: newY } : img
      )
    }));
  };

  useEffect(() => {
    if (isDoodling) {
      setupDoodleCanvas();
    }
  }, [isDoodling, brushColor, brushSize]);

  useEffect(() => {
    if (pageData.doodle && doodleCanvasRef.current && !isDoodling) {
      const img = new Image();
      img.onload = () => {
        setupDoodleCanvas();
        const ctx = doodleCanvasRef.current.getContext('2d');
        ctx.drawImage(img, 0, 0);
      };
      img.src = pageData.doodle;
    }
  }, [pageData.doodle, isDoodling]);

  useEffect(() => {
    const handleResize = () => {
      if (isDoodling && doodleCanvasRef.current) {
        setupDoodleCanvas();
        if (pageData.doodle) {
          const img = new Image();
          img.onload = () => {
            const ctx = doodleCanvasRef.current.getContext('2d');
            ctx.drawImage(img, 0, 0);
          };
          img.src = pageData.doodle;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDoodling, pageData.doodle]);

  // Draggable Element Component
  const DraggableElement = ({ id, x, y, width, height, className = '', onPositionChange, children }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const elementRef = useRef(null);
    const dragStartRef = useRef({ mouseX: 0, mouseY: 0, elementX: 0, elementY: 0 });
    const currentOffsetRef = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
      // Don't start drag if doodling is active
      if (isDoodling) return;
      
      e.stopPropagation();
      e.preventDefault();
      
      const canvas = pageCanvasRef.current;
      if (!canvas || !elementRef.current) return;

      const canvasRect = canvas.getBoundingClientRect();
      const elementRect = elementRef.current.getBoundingClientRect();

      // Calculate offset from mouse click to element top-left
      const offsetX = e.clientX - elementRect.left;
      const offsetY = e.clientY - elementRect.top;

      // Store initial positions
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        elementX: x,
        elementY: y,
        offsetX: offsetX,
        offsetY: offsetY
      };

      setIsDragging(true);
      setDragOffset({ x: 0, y: 0 });
    };

    useEffect(() => {
      if (!isDragging) return;

      const handleMouseMove = (e) => {
        e.preventDefault();
        
        const canvas = pageCanvasRef.current;
        if (!canvas) return;

        // Calculate mouse movement
        const deltaX = e.clientX - dragStartRef.current.mouseX;
        const deltaY = e.clientY - dragStartRef.current.mouseY;

        // Calculate new position
        let newX = dragStartRef.current.elementX + deltaX;
        let newY = dragStartRef.current.elementY + deltaY;

        // Get element dimensions
        const elementWidth = width || 80;
        const elementHeight = height || 80;

        // Constrain to canvas bounds
        const maxX = canvas.offsetWidth - elementWidth;
        const maxY = canvas.offsetHeight - elementHeight;
        const constrainedX = Math.max(0, Math.min(newX, maxX));
        const constrainedY = Math.max(0, Math.min(newY, maxY));

        // Update visual position immediately for smooth dragging
        const offsetX = constrainedX - dragStartRef.current.elementX;
        const offsetY = constrainedY - dragStartRef.current.elementY;
        
        // Store in ref for immediate access
        currentOffsetRef.current = { x: offsetX, y: offsetY };
        
        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
          setDragOffset({ x: offsetX, y: offsetY });
        });
      };

      const handleMouseUp = (e) => {
        e.preventDefault();
        
        // Calculate final position using current offset from ref
        const finalX = dragStartRef.current.elementX + currentOffsetRef.current.x;
        const finalY = dragStartRef.current.elementY + currentOffsetRef.current.y;
        
        // Update position in parent state only on mouse up
        onPositionChange(finalX, finalY);
        
        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
        currentOffsetRef.current = { x: 0, y: 0 };
      };

      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }, [isDragging, width, height, onPositionChange]);

    return (
      <div
        ref={elementRef}
        className={`${className} ${isDragging ? 'dragging' : ''}`}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: width ? `${width}px` : 'auto',
          height: height ? `${height}px` : 'auto',
          cursor: isDragging ? 'grabbing' : 'move',
          position: 'absolute',
          zIndex: isDragging ? 100 : 'inherit',
          touchAction: 'none',
          transform: isDragging ? `translate(${dragOffset.x}px, ${dragOffset.y}px)` : 'none',
          willChange: isDragging ? 'transform' : 'auto'
        }}
        onMouseDown={handleMouseDown}
      >
        {children}
      </div>
    );
  };

  return (
    <div className="add-page-container">

      {/* Main Container with Three Sections */}
      <div className="main-container">
        {/* Left Sidebar - Editor Tools */}
        <EditorSidebar
          pageData={pageData}
          updatePageColor={updatePageColor}
          stickerLibrary={stickerLibrary}
          handleStickerClick={handleStickerClick}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          isDoodling={isDoodling}
          startDoodling={startDoodling}
          stopDoodling={stopDoodling}
          clearDoodle={clearDoodle}
          brushColor={brushColor}
          setBrushColor={setBrushColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          doodleCanvasRef={doodleCanvasRef}
          textInput={textInput}
          setTextInput={setTextInput}
          textSize={textSize}
          setTextSize={setTextSize}
          textColor={textColor}
          setTextColor={setTextColor}
          handleAddText={handleAddText}
          handleImageUpload={handleImageUpload}
        />

        {/* Center Section - Page Canvas */}
        {/* Step 10: Page Canvas Rendering System */}
        <main className="page-section">
          <h2 className="page-title">Add Page</h2>
          <div
            className="page-canvas"
            ref={pageCanvasRef}
            style={{
              backgroundColor: getCanvasBackgroundColor(), 
              color: getCanvasTextColor()
            }}
          >
            {/* Step 10: Render all page elements in correct layering order */}
            {/* Layer 1: Images (z-index: 5) */}
            {/* Render Images */}
            {pageData.images.map(image => (
              <DraggableElement
                key={image.id}
                id={image.id}
                x={image.x}
                y={image.y}
                width={image.width}
                height={image.height}
                className="canvas-image"
                onPositionChange={(newX, newY) => updateImagePosition(image.id, newX, newY)}
              >
                <img src={image.data} alt={image.fileName} className="canvas-image-img" />
              </DraggableElement>
            ))}

            {/* Layer 2: Doodles (z-index: 8) - rendered as canvas overlay */}
            {/* Doodle Canvas Overlay */}
            <canvas
              ref={doodleCanvasRef}
              className={`doodle-canvas ${isDoodling ? 'active' : ''}`}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={(e) => {
                e.preventDefault();
                if (!isDoodling) return;
                const touch = e.touches[0];
                const rect = doodleCanvasRef.current?.getBoundingClientRect();
                if (rect) {
                  const coords = {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  };
                  isDrawingRef.current = true;
                  lastPosRef.current = {
                    x: touch.clientX - rect.left,
                    y: touch.clientY - rect.top
                  };
                }
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                if (!isDoodling || !isDrawingRef.current) return;
                const touch = e.touches[0];
                const canvas = doodleCanvasRef.current;
                if (!canvas) return;
                const rect = canvas.getBoundingClientRect();
                const coords = {
                  x: touch.clientX - rect.left,
                  y: touch.clientY - rect.top
                };
                const ctx = canvas.getContext('2d');
                ctx.beginPath();
                ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
                ctx.lineTo(coords.x, coords.y);
                ctx.stroke();
                lastPosRef.current = coords;
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopDrawing();
              }}
            />

            {/* Layer 3: Stickers (z-index: 10) */}
            {/* Render Stickers */}
            {pageData.stickers.map(sticker => (
              <DraggableElement
                key={sticker.id}
                id={sticker.id}
                x={sticker.x}
                y={sticker.y}
                className="canvas-sticker"
                onPositionChange={(newX, newY) => updateStickerPosition(sticker.id, newX, newY)}
              >
                <span className="canvas-sticker-emoji" style={{ fontSize: '3rem' }}>
                  {sticker.emoji}
                </span>
              </DraggableElement>
            ))}

            {/* Layer 4: Text Elements (z-index: 15) */}
            {/* Render Text Elements */}
            {pageData.textElements.map(text => (
              <DraggableElement
                key={text.id}
                id={text.id}
                x={text.x}
                y={text.y}
                className="canvas-text"
                onPositionChange={(newX, newY) => updateTextPosition(text.id, newX, newY)}
              >
                <span
                  className="canvas-text-content"
                  style={{
                    fontSize: `${text.fontSize}px`,
                    color: text.color
                  }}
                >
                  {text.content}
                </span>
              </DraggableElement>
            ))}
          </div>
        </main>

        {/* Right Sidebar - Action Buttons */}
        {/* Step 11: Music and Chat Bubble Buttons */}
        <aside className="action-buttons">
          <button
            className="action-btn music-btn"
            onClick={handleMusicClick}
            aria-label="Add Spotify song"
            title="Add Spotify song"
          >
            <span className="action-icon">🎵</span>
          </button>
          <button
            className="action-btn chat-btn"
            onClick={handleChatBubbleClick}
            aria-label="Generate memory prompt"
            title="Generate memory prompt"
          >
            <span className="action-icon">💬</span>
          </button>
        </aside>
      </div>

      {/* Footer/Bottom Navigation */}
      <footer className="add-page-footer">
        <button className="next-btn" onClick={() => navigate(`/journals/${journalId}/pages`)}>
          Next
        </button>
      </footer>
    </div>
  );
};

export default AddPage;
