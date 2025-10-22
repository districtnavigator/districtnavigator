# District Navigator - Berea Road Guessing Game

A fun geographic guessing game where you try to locate random roads in Berea, SC on a map!

## Features

- 🎲 **Intelligent random road selection** - Uses Google Roads API to find actual roads near random points
- 🗺️ **District boundary enforcement** - All roads are constrained within the Berea Fire District boundaries
- 🟢 **Visual debugging** - Green marker shows the random point used for road selection (temporary)
- 📍 Interactive map for placing your guess
- 📏 Distance calculation showing how far your guess was from the actual road
- 🎯 Accuracy feedback based on your performance
- 🔄 Play multiple rounds with different roads
- 🧹 **Complete cleanup** - All markers and lines are properly removed when starting a new game
- 🔴 Visual display of the district boundary on the map

## How to Play

1. The game displays the name of a random road in Berea, SC
2. Click anywhere on the map to place a pin where you think the road is located
3. Click "Submit Guess" to see how close you were
4. The game shows:
   - Your guess (blue marker)
   - Actual road location (red marker)
   - Distance between them
   - A line connecting both points
   - Accuracy feedback
5. Click "New Road" to try another road

## Setup Instructions

### Prerequisites

- A Google Maps API key with the following APIs enabled:
  - Maps JavaScript API
  - Places API (for fallback)
  - Geocoding API
  - **Roads API** (for finding nearest roads)
  - Geometry API (for distance calculations)

### Getting Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (for fallback)
   - Geocoding API
   - **Roads API** (for finding nearest roads)
   - Geometry API (for distance calculations)
4. Create credentials (API key)
5. Copy your API key

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/District-Navigator/districtnavigator.git
   cd districtnavigator
   ```

2. Open `index.html` in a text editor

3. Replace `YOUR_API_KEY` with your actual Google Maps API key:
   ```html
   <script async defer
       src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places,geometry&callback=initMap">
   </script>
   ```

4. Open `index.html` in a web browser (preferably Chrome or Firefox)

### Deployment

You can deploy this application to any static hosting service:

- **GitHub Pages**: Push to a repository and enable GitHub Pages
- **Netlify**: Drag and drop the folder to Netlify
- **Vercel**: Deploy with a single command
- **Local Server**: Use a simple HTTP server:
  ```bash
  python -m http.server 8000
  # or
  npx http-server
  ```

## Technical Details

### Technologies Used

- HTML5
- CSS3 (with responsive design)
- Vanilla JavaScript (ES6+)
- Google Maps JavaScript API
- Google Places API
- Google Geocoding API

### File Structure

```
districtnavigator/
├── index.html                              # Main HTML structure
├── style.css                               # Styling and layout
├── app.js                                  # Game logic and API integration
├── berea fire district- District line.csv  # District boundary data (WKT format)
└── README.md                               # Documentation
```

### District Boundary

The application uses the Berea Fire District boundary defined in `berea fire district- District line.csv`. This CSV file contains a LINESTRING in WKT (Well-Known Text) format that defines the district's boundary polygon.

The boundary is:
- Loaded from the CSV file when the map initializes
- Displayed as a red polygon overlay on the map
- Used to filter random road selections to ensure they fall within the district

### Road Selection Algorithm

The app uses an intelligent approach to select random roads:

1. **Generate Random Point**: A random geographic point is generated inside the district boundary using:
   - Bounding box calculation from boundary coordinates
   - Rejection sampling to ensure the point falls inside the boundary
   
2. **Find Nearest Road**: The Google Roads API `nearestRoads` endpoint is called with the random point to find the closest road segment

3. **Retrieve Road Name**: Using the `placeId` returned by Roads API, the Geocoding API retrieves the road's name

4. **Visual Feedback**: A green marker temporarily shows where the random point was placed (useful for understanding the process)

This approach ensures:
- All roads are genuine roads (not businesses or landmarks)
- Roads are evenly distributed across the district
- The game uses real road data from Google Maps

### Key Functions

- `initMap()`: Initializes the Google Map, loads district boundary, and sets up event listeners
- `loadDistrictBoundary()`: Parses the CSV file and extracts boundary coordinates from WKT format
- `isPointInBoundary()`: Checks if a point is inside the district boundary using Google Maps Geometry library or ray-casting algorithm
- `generateRandomPointInBoundary()`: Generates a random point inside the district boundary using bounding box and rejection sampling
- `selectNewRoad()`: **NEW APPROACH** - Generates a random point, uses Roads API to find the nearest road, and retrieves the road name via Geocoding API
- `placeUserGuess()`: Places a marker where the user clicks
- `submitGuess()`: Calculates distance and displays results
- `resetGame()`: Clears the map (all markers and polylines) and prepares for a new round

## Customization

### Change Location

To use a different city, modify the `BEREA_CENTER` constant in `app.js`:

```javascript
const BEREA_CENTER = { lat: YOUR_LAT, lng: YOUR_LNG };
```

### Modify Search Radius

Change the search radius in the `selectNewRoad()` function:

```javascript
radius: 5000, // Change this value (in meters)
```

### Add More Fallback Roads

Edit the `BEREA_ROADS` array in `app.js` to include more local roads.

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Map not loading?
- Check that your API key is valid
- Ensure all required APIs are enabled in Google Cloud Console
- Check browser console for error messages

### No roads appearing?
- The app will fall back to a predefined list of common Berea roads
- Check your internet connection
- Verify Places API is enabled

### Distance seems incorrect?
- Ensure Geometry library is loaded in the Maps API script

## Future Enhancements

- Add scoring system
- Track best scores
- Add difficulty levels
- Include street view images
- Multi-player support
- More cities and regions

## License

MIT License - Feel free to use and modify!

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## Credits

Developed for the Berea, SC community using Google Maps Platform.
