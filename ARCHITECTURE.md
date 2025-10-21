# Application Architecture

## Overview

A client-side web application for a geographic guessing game focused on roads in Berea, SC.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐   │
│  │  index.html   │  │   style.css   │  │    app.js    │   │
│  │               │  │               │  │              │   │
│  │  Structure    │  │   Styling     │  │ Game Logic   │   │
│  │  & Layout     │  │   & Design    │  │ & API Calls  │   │
│  └───────────────┘  └───────────────┘  └──────┬───────┘   │
│                                                 │            │
└─────────────────────────────────────────────────┼───────────┘
                                                  │
                                                  │ API Calls
                                                  │
                              ┌───────────────────▼───────────────────┐
                              │    Google Maps Platform APIs          │
                              ├───────────────────────────────────────┤
                              │                                       │
                              │  ┌─────────────────────────────────┐ │
                              │  │  Maps JavaScript API            │ │
                              │  │  - Renders interactive map      │ │
                              │  │  - Handles user interactions    │ │
                              │  └─────────────────────────────────┘ │
                              │                                       │
                              │  ┌─────────────────────────────────┐ │
                              │  │  Places API                     │ │
                              │  │  - Searches for roads/routes    │ │
                              │  │  - Returns place details        │ │
                              │  └─────────────────────────────────┘ │
                              │                                       │
                              │  ┌─────────────────────────────────┐ │
                              │  │  Geocoding API                  │ │
                              │  │  - Converts addresses to coords │ │
                              │  │  - Used for fallback roads      │ │
                              │  └─────────────────────────────────┘ │
                              │                                       │
                              │  ┌─────────────────────────────────┐ │
                              │  │  Geometry API                   │ │
                              │  │  - Calculates distances         │ │
                              │  │  - Spherical computations       │ │
                              │  └─────────────────────────────────┘ │
                              │                                       │
                              └───────────────────────────────────────┘
```

## Component Breakdown

### 1. Frontend Layer (Client-Side)

#### index.html
**Purpose**: Application structure and container
**Key Elements**:
- Header with title and subtitle
- Info panel with road name display
- Game controls (buttons)
- Result panel
- Map container
- Script imports

**Dependencies**:
- style.css (styling)
- app.js (logic)
- Google Maps API script

#### style.css
**Purpose**: Visual design and responsive layout
**Key Features**:
- CSS Grid for layout
- Flexbox for components
- Gradient backgrounds
- Responsive breakpoints (@media queries)
- Button animations
- Color-coded feedback

**Design Tokens**:
- Primary: #667eea (purple)
- Secondary: #6c757d (gray)
- Success: #28a745 (green)
- Warning: #ffc107 (yellow)
- Danger: #fd7e14 (orange)

#### app.js
**Purpose**: Game logic and API orchestration
**Architecture Pattern**: Event-driven
**Main Components**:

```javascript
// State Management
{
  map: GoogleMap,
  currentRoad: Object | null,
  userMarker: Marker | null,
  roadMarker: Marker | null,
  userGuessLocation: LatLng | null
}

// Configuration
BEREA_CENTER = { lat: 34.8854, lng: -82.4568 }
BEREA_ROADS = [Array of fallback roads]

// Core Functions
initMap()           // Initializes map and event listeners
selectNewRoad()     // Fetches random road
useFallbackRoad()   // Uses predefined road list
placeUserGuess()    // Handles map clicks
submitGuess()       // Processes submission
displayResults()    // Shows feedback
resetGame()         // Clears state
```

### 2. API Layer (Google Maps Platform)

#### Maps JavaScript API
**Usage**: Primary map interface
**Functions Used**:
- `google.maps.Map()` - Create map instance
- `google.maps.Marker()` - Create markers
- `google.maps.Polyline()` - Draw lines
- `map.addListener()` - Handle events
- `map.fitBounds()` - Auto-zoom

#### Places API
**Usage**: Find roads in area
**Endpoint**: `nearbySearch`
**Parameters**:
```javascript
{
  location: LatLng,
  radius: 5000,
  type: ['route']
}
```
**Filtering**: Client-side filter for road keywords

#### Geocoding API
**Usage**: Fallback road location
**Endpoint**: `geocode`
**Input**: "Road Name, Berea, SC"
**Output**: LatLng coordinates

#### Geometry API
**Usage**: Distance calculation
**Function**: `computeDistanceBetween()`
**Algorithm**: Spherical geometry (great circle)
**Output**: Distance in meters

## Data Flow

### Game Initialization Flow
```
1. User opens index.html
2. Browser loads HTML/CSS/JS
3. Google Maps API script loads
4. initMap() callback executes
5. Map rendered on page
6. selectNewRoad() called
7. Places API query sent
8. Road selected and displayed
9. Event listeners active
10. Ready for user input
```

### Guess Submission Flow
```
1. User clicks map
2. placeUserGuess() triggered
3. Blue marker placed
4. User clicks "Submit Guess"
5. submitGuess() triggered
6. Geometry API calculates distance
7. Red marker placed at actual location
8. Line drawn between markers
9. displayResults() called
10. Feedback shown to user
```

### New Road Flow
```
1. User clicks "New Road"
2. resetGame() called
3. Markers cleared
4. State reset
5. selectNewRoad() called
6. New road fetched/selected
7. Map recentered
8. Ready for new guess
```

## State Management

### Application State
```javascript
{
  // Core game state
  currentRoad: {
    name: String,
    geometry: { location: LatLng }
  },
  
  // User interaction state
  userGuessLocation: LatLng | null,
  
  // Visual state
  userMarker: Marker | null,
  roadMarker: Marker | null,
  
  // Map state
  map: GoogleMap
}
```

### UI State
- Submit button: disabled/enabled based on guess placement
- Result panel: hidden/visible based on submission
- Road name: updates on new road selection

## Error Handling

### API Failures
```
Places API fails
    ↓
useFallbackRoad()
    ↓
Geocoding API called
    ↓
If fails: use default coordinates
```

### Network Issues
- Graceful degradation to fallback roads
- User-friendly error messages
- Console logging for debugging

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Google Maps script loaded async
2. **Event Delegation**: Minimal event listeners
3. **State Management**: Efficient state updates
4. **Caching**: Fallback road list prevents repeated API calls
5. **Responsive Images**: Map tiles loaded on-demand

### Performance Metrics
- Initial Load: < 3 seconds
- API Response: < 2 seconds
- Map Interaction: < 100ms
- Distance Calculation: < 50ms

## Security Architecture

### Client-Side Security
- No sensitive data stored client-side
- API key should be restricted (domain/IP)
- Input validation on user interactions
- XSS prevention through DOM methods

### API Security
- API key restrictions recommended:
  - HTTP referrer restrictions
  - API restrictions (only needed APIs)
  - Usage quotas
- HTTPS required for production

### Data Privacy
- No user data collected
- No cookies or tracking
- No backend database
- Stateless application

## Scalability

### Current Limitations
- Single city (Berea, SC)
- Client-side only
- No user accounts
- No score persistence

### Scaling Options
1. **Geographic**: Add more cities/regions
2. **Backend**: Add server for scores/leaderboards
3. **Database**: Store user progress
4. **CDN**: Serve static assets globally
5. **Caching**: Cache API responses

## Deployment Architecture

### Static Hosting (Current)
```
GitHub Pages / Netlify / Vercel
    ↓
index.html (entry point)
    ↓
Loads: style.css, app.js
    ↓
Fetches: Google Maps APIs
    ↓
Runs entirely in browser
```

### Production Deployment (Recommended)
```
CDN (CloudFlare/AWS CloudFront)
    ↓
Static Assets (HTML/CSS/JS)
    ↓
API Gateway (for key management)
    ↓
Google Maps APIs
```

## Testing Architecture

### Manual Testing
- Browser compatibility testing
- UI/UX testing
- API integration testing

### Automated Testing (Future)
```
Unit Tests (Jest)
    ↓
Integration Tests (Testing Library)
    ↓
E2E Tests (Cypress/Playwright)
    ↓
Performance Tests (Lighthouse)
```

## Monitoring & Analytics (Future)

### Potential Metrics
- User engagement (games played)
- Average accuracy
- API usage
- Error rates
- Load times

### Tools (Suggestions)
- Google Analytics for usage
- Sentry for error tracking
- Google Cloud Monitoring for API usage

## Extension Points

### Easy to Add
1. More cities/regions (update BEREA_CENTER)
2. More fallback roads (update BEREA_ROADS)
3. Different difficulty levels (radius variation)
4. Themes/styling (CSS updates)

### Requires Refactoring
1. User accounts
2. Leaderboards
3. Multiplayer mode
4. Backend integration

## Technology Stack

### Core Technologies
- **HTML5**: Structure
- **CSS3**: Styling
- **JavaScript ES6+**: Logic
- **Google Maps Platform**: APIs

### Development Tools
- Git: Version control
- GitHub: Repository hosting
- Text Editor: VS Code/etc.
- Browser DevTools: Debugging

### No Build Process Required
- Vanilla JavaScript (no transpilation)
- Direct CSS (no preprocessor)
- Static HTML (no templating)

## File Dependencies

```
index.html
  ├── requires → style.css
  ├── requires → app.js
  └── requires → Google Maps API script
                      ↓
  app.js
  ├── depends on → Google Maps API loaded
  ├── depends on → DOM elements from index.html
  └── exports → window.initMap (callback)

  style.css
  └── independent (no dependencies)
```

## Browser Compatibility

### Minimum Requirements
- ES6 support
- Google Maps JavaScript API support
- Modern CSS (Grid, Flexbox)

### Tested Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Support
- iOS Safari 14+
- Chrome Mobile 90+
- Responsive design

## Conclusion

This is a **client-side, stateless, API-driven** web application with a clean separation of concerns:
- **Presentation**: HTML/CSS
- **Logic**: JavaScript
- **Data**: Google APIs

The architecture is simple, maintainable, and easily extensible while providing a complete gaming experience.
