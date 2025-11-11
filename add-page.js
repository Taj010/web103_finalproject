// State Management
const pageData = {
    pageColor: 'white', // default color
    images: [],
    stickers: [],
    textElements: [],
    doodle: null,
    spotifyUrl: null,
    prompt: null
};

// Sticker Library (can be replaced with API call or actual image URLs)
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

// DOM Element References
const elements = {
    pageCanvas: document.querySelector('.page-canvas'),
    colorSwatches: document.querySelectorAll('.color-swatch'),
    expandableHeaders: document.querySelectorAll('.section-header.clickable'),
    stickersGrid: document.getElementById('stickers-grid'),
    doodleCanvas: document.getElementById('doodle-canvas'),
    startDoodleBtn: document.getElementById('start-doodle-btn'),
    doodleOptions: document.getElementById('doodle-options'),
    doodleColorPicker: document.getElementById('doodle-color'),
    doodleBrushSize: document.getElementById('doodle-brush-size'),
    brushSizeValue: document.getElementById('brush-size-value'),
    clearDoodleBtn: document.getElementById('clear-doodle-btn'),
    doneDoodleBtn: document.getElementById('done-doodle-btn'),
    textInput: document.getElementById('text-input'),
    textSize: document.getElementById('text-size'),
    textSizeValue: document.getElementById('text-size-value'),
    textColor: document.getElementById('text-color'),
    addTextBtn: document.getElementById('add-text-btn'),
    imageInput: document.getElementById('image-input'),
    uploadArea: document.getElementById('upload-area'),
    uploadPreview: document.getElementById('upload-preview'),
    previewImage: document.getElementById('preview-image'),
    removeImageBtn: document.getElementById('remove-image-btn')
};

// Doodle State
let isDoodling = false;
let doodleContext = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Page Color Functions
function updatePageColor(color) {
    // Update state
    pageData.pageColor = color;
    
    // Update canvas background color
    const colorMap = {
        'white': '#ffffff',
        'gray': '#808080',
        'black': '#000000'
    };
    
    if (elements.pageCanvas) {
        elements.pageCanvas.style.backgroundColor = colorMap[color] || '#ffffff';
        
        // Adjust text color for readability
        if (color === 'black') {
            elements.pageCanvas.style.color = '#ffffff';
        } else {
            elements.pageCanvas.style.color = '#000000';
        }
    }
    
    // Update selected state on swatches
    elements.colorSwatches.forEach(swatch => {
        swatch.classList.remove('selected');
        if (swatch.dataset.color === color) {
            swatch.classList.add('selected');
        }
    });
}

// Expandable Sections Functions
function toggleSection(sectionName) {
    const section = document.querySelector(`[data-section="${sectionName}"]`).closest('.editor-section');
    const content = section.querySelector('.section-content');
    const isExpanded = section.classList.contains('expanded');
    
    if (isExpanded) {
        // Collapse
        section.classList.remove('expanded');
        content.classList.remove('expanded');
        content.classList.add('collapsed');
    } else {
        // Expand
        section.classList.add('expanded');
        content.classList.remove('collapsed');
        content.classList.add('expanded');
        
        // Load stickers when section is first expanded
        if (sectionName === 'stickers' && elements.stickersGrid && elements.stickersGrid.children.length === 0) {
            loadStickers();
        }
    }
}

// Sticker Functions
function loadStickers() {
    if (!elements.stickersGrid) return;
    
    elements.stickersGrid.innerHTML = '';
    
    stickerLibrary.forEach(sticker => {
        const stickerItem = document.createElement('div');
        stickerItem.className = 'sticker-item';
        stickerItem.dataset.stickerId = sticker.id;
        stickerItem.title = sticker.name;
        
        // Use emoji for now (can be replaced with <img> tag for actual images)
        const emojiSpan = document.createElement('span');
        emojiSpan.className = 'sticker-emoji';
        emojiSpan.textContent = sticker.emoji;
        stickerItem.appendChild(emojiSpan);
        
        // Add click handler
        stickerItem.addEventListener('click', () => {
            addStickerToCanvas(sticker);
        });
        
        elements.stickersGrid.appendChild(stickerItem);
    });
}

function addStickerToCanvas(sticker) {
    // Create unique ID for this sticker instance
    const stickerId = `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate center position on canvas
    const canvasRect = elements.pageCanvas.getBoundingClientRect();
    const centerX = canvasRect.width / 2 - 40; // 40 is half of sticker width
    const centerY = canvasRect.height / 2 - 40;
    
    // Create sticker data
    const stickerData = {
        id: stickerId,
        stickerId: sticker.id,
        emoji: sticker.emoji,
        name: sticker.name,
        x: centerX,
        y: centerY,
        rotation: 0
    };
    
    // Add to state
    pageData.stickers.push(stickerData);
    
    // Render on canvas
    renderStickerOnCanvas(stickerData);
}

function renderStickerOnCanvas(stickerData) {
    // Create sticker element
    const stickerElement = document.createElement('div');
    stickerElement.className = 'canvas-sticker';
    stickerElement.id = stickerData.id;
    stickerElement.style.left = `${stickerData.x}px`;
    stickerElement.style.top = `${stickerData.y}px`;
    stickerElement.style.transform = `rotate(${stickerData.rotation}deg)`;
    
    // Add emoji or image
    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'sticker-emoji';
    emojiSpan.textContent = stickerData.emoji;
    emojiSpan.style.fontSize = '3rem';
    stickerElement.appendChild(emojiSpan);
    
    // Make draggable
    makeStickerDraggable(stickerElement, stickerData);
    
    // Add click to select
    stickerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        selectSticker(stickerData.id);
    });
    
    // Add to canvas
    elements.pageCanvas.appendChild(stickerElement);
}

function makeStickerDraggable(element, stickerData) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = element.getBoundingClientRect();
        initialX = rect.left - elements.pageCanvas.getBoundingClientRect().left;
        initialY = rect.top - elements.pageCanvas.getBoundingClientRect().top;
        
        element.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        const newX = initialX + deltaX;
        const newY = initialY + deltaY;
        
        // Keep within canvas bounds
        const canvasRect = elements.pageCanvas.getBoundingClientRect();
        const maxX = canvasRect.width - 80;
        const maxY = canvasRect.height - 80;
        
        stickerData.x = Math.max(0, Math.min(newX, maxX));
        stickerData.y = Math.max(0, Math.min(newY, maxY));
        
        element.style.left = `${stickerData.x}px`;
        element.style.top = `${stickerData.y}px`;
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'move';
        }
    });
}

function selectSticker(stickerId) {
    // Remove previous selection
    document.querySelectorAll('.canvas-sticker.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Select new sticker
    const stickerElement = document.getElementById(stickerId);
    if (stickerElement) {
        stickerElement.classList.add('selected');
    }
}

function renderAllStickers() {
    // Clear existing stickers from canvas (but keep other content)
    document.querySelectorAll('.canvas-sticker').forEach(el => el.remove());
    
    // Re-render all stickers
    pageData.stickers.forEach(stickerData => {
        renderStickerOnCanvas(stickerData);
    });
}

// Doodle Functions
function setupDoodleCanvas() {
    if (!elements.doodleCanvas || !elements.pageCanvas) return;
    
    const canvas = elements.doodleCanvas;
    const container = elements.pageCanvas;
    
    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Get 2D context
    doodleContext = canvas.getContext('2d');
    
    // Set default drawing styles
    doodleContext.strokeStyle = elements.doodleColorPicker.value;
    doodleContext.lineWidth = parseInt(elements.doodleBrushSize.value);
    doodleContext.lineCap = 'round';
    doodleContext.lineJoin = 'round';
}

function startDoodling() {
    if (!elements.doodleCanvas) return;
    
    isDoodling = true;
    setupDoodleCanvas();
    
    // Show options, hide start button
    elements.doodleOptions.style.display = 'flex';
    elements.startDoodleBtn.style.display = 'none';
    
    // Activate canvas
    elements.doodleCanvas.classList.add('active');
    
    // Disable sticker dragging while doodling
    document.querySelectorAll('.canvas-sticker').forEach(sticker => {
        sticker.style.pointerEvents = 'none';
    });
}

function stopDoodling() {
    if (!elements.doodleCanvas) return;
    
    isDoodling = false;
    isDrawing = false;
    
    // Deactivate canvas
    elements.doodleCanvas.classList.remove('active');
    
    // Re-enable sticker dragging
    document.querySelectorAll('.canvas-sticker').forEach(sticker => {
        sticker.style.pointerEvents = 'auto';
    });
    
    // Save doodle to state
    saveDoodle();
    
    // Show start button, hide options
    elements.doodleOptions.style.display = 'none';
    elements.startDoodleBtn.style.display = 'block';
}

function getCanvasCoordinates(e) {
    const canvas = elements.doodleCanvas;
    const rect = canvas.getBoundingClientRect();
    
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function startDrawing(e) {
    if (!isDoodling) return;
    
    isDrawing = true;
    const coords = getCanvasCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
}

function draw(e) {
    if (!isDoodling || !isDrawing || !doodleContext) return;
    
    const coords = getCanvasCoordinates(e);
    
    doodleContext.beginPath();
    doodleContext.moveTo(lastX, lastY);
    doodleContext.lineTo(coords.x, coords.y);
    doodleContext.stroke();
    
    lastX = coords.x;
    lastY = coords.y;
}

function stopDrawing() {
    isDrawing = false;
}

function clearDoodle() {
    if (!doodleContext || !elements.doodleCanvas) return;
    
    const canvas = elements.doodleCanvas;
    doodleContext.clearRect(0, 0, canvas.width, canvas.height);
}

function saveDoodle() {
    if (!elements.doodleCanvas) return;
    
    // Convert canvas to base64 image
    const imageData = elements.doodleCanvas.toDataURL('image/png');
    pageData.doodle = imageData;
}

function loadDoodle() {
    if (!pageData.doodle || !elements.doodleCanvas || !doodleContext) return;
    
    const img = new Image();
    img.onload = function() {
        setupDoodleCanvas();
        doodleContext.drawImage(img, 0, 0);
    };
    img.src = pageData.doodle;
}

function updateBrushSize() {
    if (doodleContext && elements.brushSizeValue) {
        const size = parseInt(elements.doodleBrushSize.value);
        doodleContext.lineWidth = size;
        elements.brushSizeValue.textContent = size;
    }
}

function updateBrushColor() {
    if (doodleContext) {
        doodleContext.strokeStyle = elements.doodleColorPicker.value;
    }
}

// Text Functions
function addTextToCanvas() {
    if (!elements.textInput || !elements.pageCanvas) return;
    
    const textContent = elements.textInput.value.trim();
    if (!textContent) {
        alert('Please enter some text');
        return;
    }
    
    // Create unique ID for this text element
    const textId = `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate center position on canvas
    const canvasRect = elements.pageCanvas.getBoundingClientRect();
    const centerX = canvasRect.width / 2;
    const centerY = canvasRect.height / 2;
    
    // Get text properties
    const fontSize = parseInt(elements.textSize.value);
    const textColor = elements.textColor.value;
    
    // Create text data
    const textData = {
        id: textId,
        content: textContent,
        x: centerX,
        y: centerY,
        fontSize: fontSize,
        color: textColor
    };
    
    // Add to state
    pageData.textElements.push(textData);
    
    // Render on canvas
    renderTextOnCanvas(textData);
    
    // Clear input
    elements.textInput.value = '';
}

function renderTextOnCanvas(textData) {
    // Create text element
    const textElement = document.createElement('div');
    textElement.className = 'canvas-text';
    textElement.id = textData.id;
    textElement.style.left = `${textData.x}px`;
    textElement.style.top = `${textData.y}px`;
    textElement.style.fontSize = `${textData.fontSize}px`;
    textElement.style.color = textData.color;
    
    // Add text content
    const textContent = document.createElement('span');
    textContent.className = 'canvas-text-content';
    textContent.textContent = textData.content;
    textElement.appendChild(textContent);
    
    // Make draggable
    makeTextDraggable(textElement, textData);
    
    // Add click to select
    textElement.addEventListener('click', (e) => {
        e.stopPropagation();
        selectText(textData.id);
    });
    
    // Add double-click to edit (optional)
    textElement.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        editText(textData);
    });
    
    // Add to canvas
    elements.pageCanvas.appendChild(textElement);
}

function makeTextDraggable(element, textData) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    element.addEventListener('mousedown', (e) => {
        // Don't start dragging if clicking on text content
        if (e.target.classList.contains('canvas-text-content')) {
            return;
        }
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = element.getBoundingClientRect();
        initialX = rect.left - elements.pageCanvas.getBoundingClientRect().left;
        initialY = rect.top - elements.pageCanvas.getBoundingClientRect().top;
        
        element.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        const newX = initialX + deltaX;
        const newY = initialY + deltaY;
        
        // Keep within canvas bounds (approximate)
        const canvasRect = elements.pageCanvas.getBoundingClientRect();
        const maxX = canvasRect.width - 50;
        const maxY = canvasRect.height - 50;
        
        textData.x = Math.max(0, Math.min(newX, maxX));
        textData.y = Math.max(0, Math.min(newY, maxY));
        
        element.style.left = `${textData.x}px`;
        element.style.top = `${textData.y}px`;
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'move';
        }
    });
}

function selectText(textId) {
    // Remove previous selection
    document.querySelectorAll('.canvas-text.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Select new text
    const textElement = document.getElementById(textId);
    if (textElement) {
        textElement.classList.add('selected');
    }
}

function editText(textData) {
    // Populate input fields with current text data
    if (elements.textInput) {
        elements.textInput.value = textData.content;
    }
    if (elements.textSize) {
        elements.textSize.value = textData.fontSize;
        updateTextSizeDisplay();
    }
    if (elements.textColor) {
        elements.textColor.value = textData.color;
    }
    
    // Remove old text element
    const oldElement = document.getElementById(textData.id);
    if (oldElement) {
        oldElement.remove();
    }
    
    // Remove from state
    const index = pageData.textElements.findIndex(t => t.id === textData.id);
    if (index > -1) {
        pageData.textElements.splice(index, 1);
    }
}

function updateTextSizeDisplay() {
    if (elements.textSizeValue && elements.textSize) {
        elements.textSizeValue.textContent = elements.textSize.value;
    }
}

function renderAllTextElements() {
    // Clear existing text elements from canvas
    document.querySelectorAll('.canvas-text').forEach(el => el.remove());
    
    // Re-render all text elements
    pageData.textElements.forEach(textData => {
        renderTextOnCanvas(textData);
    });
}

// Image Upload Functions
function validateImageFile(file) {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.');
        return false;
    }
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
        alert('File size too large. Please upload an image smaller than 10MB.');
        return false;
    }
    
    return true;
}

function handleImageUpload(file) {
    if (!validateImageFile(file)) {
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const imageData = e.target.result; // base64 string
        
        // Show preview in sidebar
        if (elements.previewImage) {
            elements.previewImage.src = imageData;
        }
        if (elements.uploadArea) {
            elements.uploadArea.style.display = 'none';
        }
        if (elements.uploadPreview) {
            elements.uploadPreview.style.display = 'flex';
        }
        
        // Add image to canvas
        addImageToCanvas(imageData, file.name);
    };
    
    reader.onerror = function() {
        alert('Error reading file. Please try again.');
    };
    
    reader.readAsDataURL(file);
}

function addImageToCanvas(imageData, fileName) {
    // Create unique ID for this image
    const imageId = `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate center position on canvas
    const canvasRect = elements.pageCanvas.getBoundingClientRect();
    const centerX = canvasRect.width / 2 - 150; // 150 is half of max width
    const centerY = canvasRect.height / 2 - 150;
    
    // Create image data
    const imageDataObj = {
        id: imageId,
        data: imageData,
        fileName: fileName,
        x: centerX,
        y: centerY,
        width: 300,
        height: 300
    };
    
    // Add to state
    pageData.images.push(imageDataObj);
    
    // Render on canvas
    renderImageOnCanvas(imageDataObj);
}

function renderImageOnCanvas(imageData) {
    // Create image element
    const imageElement = document.createElement('div');
    imageElement.className = 'canvas-image';
    imageElement.id = imageData.id;
    imageElement.style.left = `${imageData.x}px`;
    imageElement.style.top = `${imageData.y}px`;
    imageElement.style.width = `${imageData.width}px`;
    imageElement.style.height = `${imageData.height}px`;
    
    // Create img tag
    const img = document.createElement('img');
    img.src = imageData.data;
    img.alt = imageData.fileName || 'Uploaded image';
    imageElement.appendChild(img);
    
    // Make draggable
    makeImageDraggable(imageElement, imageData);
    
    // Add click to select
    imageElement.addEventListener('click', (e) => {
        e.stopPropagation();
        selectImage(imageData.id);
    });
    
    // Add to canvas
    elements.pageCanvas.appendChild(imageElement);
}

function makeImageDraggable(element, imageData) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = element.getBoundingClientRect();
        initialX = rect.left - elements.pageCanvas.getBoundingClientRect().left;
        initialY = rect.top - elements.pageCanvas.getBoundingClientRect().top;
        
        element.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        const newX = initialX + deltaX;
        const newY = initialY + deltaY;
        
        // Keep within canvas bounds
        const canvasRect = elements.pageCanvas.getBoundingClientRect();
        const maxX = canvasRect.width - imageData.width;
        const maxY = canvasRect.height - imageData.height;
        
        imageData.x = Math.max(0, Math.min(newX, maxX));
        imageData.y = Math.max(0, Math.min(newY, maxY));
        
        element.style.left = `${imageData.x}px`;
        element.style.top = `${imageData.y}px`;
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'move';
        }
    });
}

function selectImage(imageId) {
    // Remove previous selection
    document.querySelectorAll('.canvas-image.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Select new image
    const imageElement = document.getElementById(imageId);
    if (imageElement) {
        imageElement.classList.add('selected');
    }
}

function removeImage() {
    // Remove from sidebar preview
    if (elements.uploadArea) {
        elements.uploadArea.style.display = 'block';
    }
    if (elements.uploadPreview) {
        elements.uploadPreview.style.display = 'none';
    }
    if (elements.previewImage) {
        elements.previewImage.src = '';
    }
    
    // Clear file input
    if (elements.imageInput) {
        elements.imageInput.value = '';
    }
    
    // Find and remove the most recently added image from canvas
    if (pageData.images.length > 0) {
        const lastImage = pageData.images[pageData.images.length - 1];
        const imageElement = document.getElementById(lastImage.id);
        if (imageElement) {
            imageElement.remove();
        }
        pageData.images.pop();
    }
}

function renderAllImages() {
    // Clear existing images from canvas
    document.querySelectorAll('.canvas-image').forEach(el => el.remove());
    
    // Re-render all images
    pageData.images.forEach(imageData => {
        renderImageOnCanvas(imageData);
    });
}

// Event Listeners Setup
function setupEventListeners() {
    // Color swatch click handlers
    elements.colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const color = swatch.dataset.color;
            updatePageColor(color);
        });
    });
    
    // Expandable section click handlers
    elements.expandableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const sectionName = header.dataset.section;
            toggleSection(sectionName);
            
            // Setup doodle canvas when section is expanded
            if (sectionName === 'doodles' && elements.doodleCanvas) {
                setupDoodleCanvas();
            }
        });
    });
    
    // Doodle event listeners
    if (elements.startDoodleBtn) {
        elements.startDoodleBtn.addEventListener('click', startDoodling);
    }
    
    if (elements.doneDoodleBtn) {
        elements.doneDoodleBtn.addEventListener('click', stopDoodling);
    }
    
    if (elements.clearDoodleBtn) {
        elements.clearDoodleBtn.addEventListener('click', clearDoodle);
    }
    
    if (elements.doodleBrushSize) {
        elements.doodleBrushSize.addEventListener('input', updateBrushSize);
    }
    
    if (elements.doodleColorPicker) {
        elements.doodleColorPicker.addEventListener('input', updateBrushColor);
    }
    
    // Text event listeners
    if (elements.addTextBtn) {
        elements.addTextBtn.addEventListener('click', addTextToCanvas);
    }
    
    if (elements.textSize) {
        elements.textSize.addEventListener('input', updateTextSizeDisplay);
    }
    
    // Allow Enter key to add text (Ctrl+Enter or Shift+Enter)
    if (elements.textInput) {
        elements.textInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.shiftKey) && e.key === 'Enter') {
                e.preventDefault();
                addTextToCanvas();
            }
        });
    }
    
    // Image upload event listeners
    if (elements.uploadArea) {
        // Click to upload
        elements.uploadArea.addEventListener('click', () => {
            if (elements.imageInput) {
                elements.imageInput.click();
            }
        });
        
        // Drag and drop
        elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.uploadArea.classList.add('drag-over');
        });
        
        elements.uploadArea.addEventListener('dragleave', () => {
            elements.uploadArea.classList.remove('drag-over');
        });
        
        elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.uploadArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleImageUpload(files[0]);
            }
        });
    }
    
    if (elements.imageInput) {
        elements.imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleImageUpload(file);
            }
        });
    }
    
    if (elements.removeImageBtn) {
        elements.removeImageBtn.addEventListener('click', removeImage);
    }
    
    // Drawing event listeners
    if (elements.doodleCanvas) {
        elements.doodleCanvas.addEventListener('mousedown', startDrawing);
        elements.doodleCanvas.addEventListener('mousemove', draw);
        elements.doodleCanvas.addEventListener('mouseup', stopDrawing);
        elements.doodleCanvas.addEventListener('mouseleave', stopDrawing);
        
        // Touch support for mobile
        elements.doodleCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            elements.doodleCanvas.dispatchEvent(mouseEvent);
        });
        
        elements.doodleCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            elements.doodleCanvas.dispatchEvent(mouseEvent);
        });
        
        elements.doodleCanvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            elements.doodleCanvas.dispatchEvent(mouseEvent);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    
    // Set initial color
    updatePageColor(pageData.pageColor);
    
    // Render any existing stickers (if loading from saved state)
    if (pageData.stickers.length > 0) {
        renderAllStickers();
    }
    
    // Render any existing text elements (if loading from saved state)
    if (pageData.textElements.length > 0) {
        renderAllTextElements();
    }
    
    // Render any existing images (if loading from saved state)
    if (pageData.images.length > 0) {
        renderAllImages();
    }
    
    // Initialize text size display
    if (elements.textSizeValue && elements.textSize) {
        elements.textSizeValue.textContent = elements.textSize.value;
    }
    
    // Load existing doodle if any
    if (pageData.doodle) {
        loadDoodle();
    }
    
    // Initialize brush size display
    if (elements.brushSizeValue && elements.doodleBrushSize) {
        elements.brushSizeValue.textContent = elements.doodleBrushSize.value;
    }
    
    // Handle window resize to update canvas size
    window.addEventListener('resize', () => {
        if (elements.doodleCanvas && isDoodling) {
            setupDoodleCanvas();
            // Reload existing doodle if any
            if (pageData.doodle) {
                loadDoodle();
            }
        }
    });
});

