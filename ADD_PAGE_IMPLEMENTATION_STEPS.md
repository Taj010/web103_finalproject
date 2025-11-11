# Add Page Feature - Implementation Steps

## Overview
This document breaks down the steps to implement the "Add Page" feature based on the wireframe design. The layout consists of:
- **Left Sidebar**: Editor tools (Page Color, Stickers, Doodles, Text, Upload Images)
- **Center Section**: Live preview of the journal page canvas
- **Right Sidebar**: Action buttons (Music icon, Chat bubble icon)
- **Bottom**: Navigation button (Next)

All implementation will be in vanilla JavaScript (no frameworks).

---

## Step 1: HTML Structure - Three-Column Layout
**Goal:** Create the basic HTML skeleton with left sidebar, center page, and right sidebar

### Tasks:
1. Create `add-page.html` (or the appropriate HTML file)
2. Set up the main container structure:
   - Header section (StickerStory logo, Username button, navigation arrow)
   - Main container with three sections:
     - **Left Sidebar** (`<aside>` or `<div class="editor-sidebar">`)
     - **Center Page Section** (`<main>` or `<div class="page-canvas">`)
     - **Right Sidebar** (`<aside>` or `<div class="action-buttons">`)
   - Footer/bottom section (Next button)
3. Add semantic HTML:
   - Header with logo and user info
   - Left sidebar container
   - Center page canvas container
   - Right sidebar container
   - Bottom navigation area

---

## Step 2: CSS Layout - Three-Column Grid/Flexbox
**Goal:** Create the three-column layout matching the wireframe

### Tasks:
1. Create `add-page.css` (or add to main stylesheet)
2. Set up the main layout:
   - Use CSS Grid or Flexbox for three-column layout
   - Left sidebar: Fixed or flexible width (white background)
   - Center section: Takes remaining space (light beige background)
   - Right sidebar: Narrow fixed width (for action buttons)
3. Style the header:
   - StickerStory logo (decorative serif font, top-left)
   - Username button (dark brown, top-right)
   - Navigation arrow icon
4. Style the page canvas:
   - Large white rectangle in center
   - Subtle gray shadow for depth
   - Appropriate padding/margins
5. Set background color: Light beige for main area

---

## Step 3: Left Sidebar - Page Color Section
**Goal:** Create the Page Color selector with color swatches

### Tasks:
1. Add "Page Color" section to left sidebar:
   - Heading with star icon (⭐) to the left
   - Text: "Page Color"
2. Create color swatches container:
   - Three circular color options:
     - White circle (with black border - default selected)
     - Gray circle (with black border)
     - Black circle (with black border)
3. Style the swatches:
   - Circular buttons (use `border-radius: 50%`)
   - Thin black border for all
   - Thicker border for selected state
   - Appropriate spacing between swatches
4. Add JavaScript functionality:
   - Click event listeners on each swatch
   - Update page canvas background color when clicked
   - Update selected state (thicker border)
   - Store selected color in state object

---

## Step 4: Left Sidebar - Expandable Sections Structure
**Goal:** Create the collapsible sections for Stickers, Doodles, Text, Upload Images

### Tasks:
1. Add section headers to left sidebar:
   - "Stickers" with star icon (⭐)
   - "Doodles" with star icon (⭐)
   - "Text" with star icon (⭐)
   - "Upload Images" with star icon (⭐)
2. Style the section headers:
   - Consistent styling with "Page Color"
   - Clickable appearance (cursor: pointer)
   - Hover effects
3. Create expandable content areas:
   - Initially hidden/collapsed
   - Will expand when clicked (Step 5-8)
4. Add expand/collapse functionality:
   - Toggle class on click
   - Show/hide content area
   - Optional: Add chevron icon that rotates

---

## Step 5: Left Sidebar - Stickers Section
**Goal:** Implement the Stickers expandable section

### Tasks:
1. Create stickers content area (inside expandable section):
   - Grid or list layout for sticker thumbnails
   - Each sticker as clickable image/button
2. Load sticker library:
   - Fetch stickers from API or use local assets
   - Display stickers in grid format
3. Handle sticker selection:
   - On sticker click, add sticker to page canvas
   - Store sticker data (image URL, position) in state
4. Display stickers on page canvas:
   - Render selected stickers on the center page canvas
   - Allow positioning (drag-and-drop or click-to-place)
   - Store position coordinates in state

---

## Step 6: Left Sidebar - Doodles Section
**Goal:** Implement the Doodles expandable section

### Tasks:
1. Create doodles content area (inside expandable section):
   - Button to "Start Doodling" or activate doodle mode
   - Drawing controls (color picker, brush size) - optional in sidebar
2. Activate doodle mode:
   - When clicked, enable drawing on page canvas
   - Overlay canvas element on page canvas (or use main canvas)
3. Implement drawing functionality:
   - Mouse/touch event listeners on page canvas
   - Track drawing path
   - Draw on canvas using canvas API
4. Store doodle data:
   - Convert canvas to image (base64) when done
   - Or store drawing paths as data
   - Add to state object
5. Add drawing controls (if in sidebar):
   - Color picker input
   - Brush size slider
   - Clear button
   - Done/Save button

---

## Step 7: Left Sidebar - Text Section
**Goal:** Implement the Text expandable section

### Tasks:
1. Create text content area (inside expandable section):
   - Text input or textarea
   - Font options (optional)
   - Size options (optional)
   - Color picker (optional)
2. Add text to page canvas:
   - When user types, show text on page canvas
   - Allow text positioning (click to place, drag to move)
   - Real-time preview on canvas
3. Store text data:
   - Text content
   - Position (x, y coordinates)
   - Font properties (if customizable)
   - Add to state object
4. Allow multiple text elements:
   - User can add multiple text boxes
   - Each text element independently positioned

---

## Step 8: Left Sidebar - Upload Images Section
**Goal:** Implement the Upload Images expandable section

### Tasks:
1. Create upload content area (inside expandable section):
   - File input element (hidden)
   - "Upload Image" button or drag-and-drop zone
   - Image preview thumbnail (optional in sidebar)
2. Handle file selection:
   - Click button to trigger file input
   - Validate file type (images only: jpg, png, gif, etc.)
   - Validate file size
   - Show error if invalid
3. Display image on page canvas:
   - When image selected, display on center page canvas
   - Allow image positioning/resizing (optional)
   - Show image preview
4. Store image data:
   - Convert to base64 or prepare for upload
   - Store image file/URL in state object
   - Store position if positioned

---

## Step 9: Center Section - Page Canvas Setup
**Goal:** Create the main journal page canvas/preview area

### Tasks:
1. Create page canvas container:
   - Large white rectangular area
   - Subtle shadow (box-shadow)
   - Appropriate dimensions (responsive)
2. Set up canvas structure:
   - Main container div for page canvas
   - This is where all content (images, stickers, text, doodles) will appear
   - Background color controlled by Page Color selector
3. Style the canvas:
   - White background (default)
   - Rounded corners (optional)
   - Shadow for depth
   - Centered in the center section
4. Add "Add Page" title:
   - Large decorative serif font (matching logo style)
   - Centered above or within canvas area
   - Black text color

---

## Step 10: Center Section - Canvas Content Rendering
**Goal:** Render all page elements on the canvas in real-time

### Tasks:
1. Create rendering system:
   - Function to render all canvas content
   - Called whenever state updates
   - Clears and redraws canvas
2. Render different content types:
   - **Background color**: Applied to canvas container
   - **Uploaded images**: Display as `<img>` elements (positioned absolutely)
   - **Stickers**: Display as `<img>` elements (positioned absolutely)
   - **Text elements**: Display as `<div>` or text elements (positioned absolutely)
   - **Doodles**: Display as canvas overlay or image
3. Handle layering:
   - Ensure proper z-index for elements
   - Background → Images → Doodles → Stickers → Text (or custom order)
4. Update canvas on state changes:
   - Listen for state updates
   - Re-render canvas when:
     - Color changes
     - Image uploaded
     - Sticker added
     - Text added
     - Doodle drawn

---

## Step 11: Right Sidebar - Action Buttons
**Goal:** Create the right sidebar with Music and Chat bubble buttons

### Tasks:
1. Create right sidebar container:
   - Narrow vertical sidebar
   - Positioned on the right side of center section
   - Light background or transparent
2. Add Music icon button:
   - Circular button with black outline
   - Musical note icon inside
   - Positioned towards top-right of canvas area
3. Add Chat bubble icon button:
   - Circular button with black outline
   - Speech bubble icon inside
   - Positioned below music icon
4. Style the buttons:
   - Circular shape (border-radius: 50%)
   - Black border
   - Transparent or white background
   - Hover effects
5. Add click functionality:
   - Music button: Open Spotify URL input (modal or expandable)
   - Chat bubble: Open prompt generator (modal or expandable)

---

## Step 12: Music Button - Spotify Integration
**Goal:** Handle Spotify song linking when Music button is clicked

### Tasks:
1. Create modal or expandable area for Spotify input:
   - Appears when Music button clicked
   - Input field for Spotify URL
   - Optional: Preview of song info
2. Validate Spotify URL:
   - Check if URL contains "spotify.com"
   - Extract song ID if needed
3. Store Spotify data:
   - Save URL to state object
   - Optional: Fetch and store song metadata
4. Display music indicator on page:
   - Optional: Show music icon or indicator on canvas
   - Or store silently for later use

---

## Step 13: Chat Bubble Button - Prompt Generator
**Goal:** Handle random prompt generation when Chat bubble is clicked

### Tasks:
1. Create modal or expandable area for prompts:
   - Appears when Chat bubble button clicked
   - Display area for prompt text
   - "Get New Prompt" button
2. Create prompt array:
   - Array of inspiring questions:
     - "What was the most surprising thing that happened today?"
     - "Describe a moment that made you smile"
     - "What are you grateful for?"
     - etc.
3. Generate random prompt:
   - On button click, randomly select from array
   - Display prompt in modal/area
   - Allow user to use prompt or dismiss
4. Store prompt data:
   - Save selected prompt to state
   - Optional: Auto-add prompt text to page canvas

---

## Step 14: Bottom Navigation - Next Button
**Goal:** Create the Next button for navigation

### Tasks:
1. Add Next button to bottom-right:
   - Dark brown button with white text
   - Rounded corners
   - Positioned at bottom-right of page
2. Style the button:
   - Match wireframe design (dark brown background)
   - White text
   - Appropriate padding and sizing
   - Hover effects
3. Add navigation functionality:
   - On click, collect all page data
   - Validate required fields (if any)
   - Navigate to next step (Page Details screen)
   - Or save page and redirect

---

## Step 15: State Management - Page Data Object
**Goal:** Create and manage the page data state

### Tasks:
1. Create JavaScript state object:
   ```javascript
   const pageData = {
     pageColor: 'white', // or 'gray', 'black'
     images: [], // array of image objects {file, position, etc.}
     stickers: [], // array of sticker objects {url, position, rotation}
     textElements: [], // array of text objects {content, position, style}
     doodle: null, // canvas data or image
     spotifyUrl: null,
     prompt: null
   };
   ```
2. Create functions to update state:
   - `updatePageColor(color)`
   - `addImage(imageData)`
   - `addSticker(stickerData)`
   - `addText(textData)`
   - `updateDoodle(doodleData)`
   - `setSpotifyUrl(url)`
   - `setPrompt(promptText)`
3. Sync state with canvas rendering:
   - Call render function whenever state updates
   - Ensure canvas reflects current state

---

## Step 16: JavaScript Event Listeners Setup
**Goal:** Wire up all interactive elements

### Tasks:
1. Set up DOM element references:
   - Query selectors for all interactive elements
   - Store in variables for easy access
2. Add event listeners:
   - Page Color swatches: click events
   - Section headers (Stickers, Doodles, Text, Upload): click to expand/collapse
   - Sticker items: click to add to canvas
   - Upload button: change event on file input
   - Text input: input events
   - Doodle controls: various events
   - Music button: click event
   - Chat bubble button: click event
   - Next button: click event
3. Organize event listeners:
   - Group by functionality
   - Use named functions for handlers
   - Keep code organized and readable

---

## Step 17: Form Submission & Data Collection
**Goal:** Collect all data and prepare for API submission

### Tasks:
1. Create data collection function:
   - Gather all data from state object
   - Format according to backend API expectations
2. Handle file uploads:
   - Convert images to base64 or FormData
   - Prepare for multipart/form-data if needed
3. Structure data for API:
   - Page color
   - Images (files or URLs)
   - Stickers array with positions
   - Text elements array
   - Doodle (image data)
   - Spotify URL
   - Prompt (if used)
4. Validate data:
   - Check required fields
   - Validate file types and sizes
   - Validate URLs

---

## Step 18: API Integration - Save Page
**Goal:** Send page data to backend

### Tasks:
1. Create API call function:
   - Use `fetch()` to POST to backend endpoint
   - Include journal ID in request
   - Send formatted page data
2. Handle async operation:
   - Use async/await or promises
   - Show loading state during request
3. Handle response:
   - Success: Navigate to next page or show success message
   - Error: Display error message to user
   - Handle network errors gracefully

---

## Implementation Order Recommendation:

### Phase 1: Layout & Structure
1. **Step 1**: HTML Structure - Three-column layout
2. **Step 2**: CSS Layout - Grid/Flexbox setup
3. **Step 9**: Center Section - Page Canvas setup

### Phase 2: Left Sidebar - Basic Features
4. **Step 3**: Page Color Section
5. **Step 4**: Expandable Sections Structure
6. **Step 8**: Upload Images Section (simplest to start)

### Phase 3: Left Sidebar - Advanced Features
7. **Step 7**: Text Section
8. **Step 5**: Stickers Section
9. **Step 6**: Doodles Section

### Phase 4: Right Sidebar & Integration
10. **Step 11**: Action Buttons (Music & Chat)
11. **Step 12**: Music Button - Spotify
12. **Step 13**: Chat Bubble - Prompts

### Phase 5: Canvas Rendering & State
13. **Step 15**: State Management
14. **Step 10**: Canvas Content Rendering
15. **Step 16**: Event Listeners Setup

### Phase 6: Final Integration
16. **Step 14**: Next Button
17. **Step 17**: Form Submission
18. **Step 18**: API Integration

---

## JavaScript File Structure:
```javascript
// add-page.js

// 1. State Management
const pageData = { ... };

// 2. DOM Element References
const elements = {
  pageCanvas: document.querySelector('.page-canvas'),
  colorSwatches: document.querySelectorAll('.color-swatch'),
  // ... etc
};

// 3. Page Color Functions
function updatePageColor(color) { ... }

// 4. Sticker Functions
function addSticker(stickerUrl) { ... }

// 5. Doodle Functions
function initDoodleTool() { ... }

// 6. Text Functions
function addTextElement(text) { ... }

// 7. Image Upload Functions
function handleImageUpload(file) { ... }

// 8. Canvas Rendering
function renderCanvas() { ... }

// 9. Event Listeners
function setupEventListeners() { ... }

// 10. API Functions
async function savePage() { ... }

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  renderCanvas();
});
```

---

## Notes:
- Keep all JavaScript in separate `.js` file(s)
- Use vanilla JavaScript (no frameworks)
- Test each feature incrementally
- The page canvas should update in real-time as user makes changes
- Consider using CSS Grid for the three-column layout
- Use absolute positioning for elements on the canvas
- Keep state management simple and centralized
