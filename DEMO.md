# Application Demo & Screenshots

## What the Application Looks Like

### Initial View
When you first load the application, you'll see:
- **Header**: Purple gradient header with "Berea Road Navigator" title
- **Left Panel**: 
  - Road name display (shows the current challenge road)
  - Instructions
  - Two buttons: "Submit Guess" (disabled) and "New Road"
- **Right Panel**: Interactive Google Map centered on Berea, SC

### Game States

#### State 1: Initial Load
```
┌─────────────────────────────────────────────────────────┐
│  Berea Road Navigator                                   │
│  Can you guess where this road is?                      │
├─────────────┬───────────────────────────────────────────┤
│ Road Name:  │                                           │
│ Main Street │          [Google Map View]                │
│             │                                           │
│ Click map   │        Centered on Berea, SC              │
│ to place    │                                           │
│ your guess  │          Zoom level: 13                   │
│             │                                           │
│ [Submit]    │                                           │
│ (disabled)  │                                           │
│             │                                           │
│ [New Road]  │                                           │
└─────────────┴───────────────────────────────────────────┘
```

#### State 2: Guess Placed
After clicking on the map:
```
┌─────────────────────────────────────────────────────────┐
│  Berea Road Navigator                                   │
│  Can you guess where this road is?                      │
├─────────────┬───────────────────────────────────────────┤
│ Road Name:  │                                           │
│ Main Street │          [Google Map View]                │
│             │                                           │
│ Click map   │              📍 (Blue Pin)                │
│ to place    │         Your guess location               │
│ your guess  │                                           │
│             │                                           │
│ [Submit]    │                                           │
│ (enabled)   │                                           │
│             │                                           │
│ [New Road]  │                                           │
└─────────────┴───────────────────────────────────────────┘
```

#### State 3: Results Shown
After submitting:
```
┌─────────────────────────────────────────────────────────┐
│  Berea Road Navigator                                   │
│  Can you guess where this road is?                      │
├─────────────┬───────────────────────────────────────────┤
│ Road Name:  │                                           │
│ Main Street │          [Google Map View]                │
│             │                                           │
│ Results     │       📍 (Blue) Your Guess                │
│ Distance:   │              ╱                            │
│ 0.25 miles  │            ╱  Red line                    │
│             │          ╱                                │
│ 👍 Good     │      📍 (Red) Actual Location             │
│ guess!      │                                           │
│             │        (Map auto-zoomed)                  │
│ [Submit]    │                                           │
│ (disabled)  │                                           │
│             │                                           │
│ [New Road]  │                                           │
└─────────────┴───────────────────────────────────────────┘
```

## Color Scheme

### Header
- Background: Purple gradient (#667eea to #764ba2)
- Text: White

### Info Panel
- Background: Light gray (#f8f9fa)
- Cards: White with subtle shadow
- Primary Button: Purple gradient
- Secondary Button: Gray (#6c757d)

### Map Markers
- Your Guess: Blue pin/dot
- Actual Location: Red pin/dot
- Connection Line: Red (#FF0000)

### Feedback Colors
- 🎯 Amazing (< 100m): Green (#28a745)
- 🎉 Great (< 500m): Teal (#20c997)
- 👍 Good (< 1000m): Blue (#17a2b8)
- 😊 Decent (< 2000m): Yellow (#ffc107)
- 🤔 Try Again (> 2000m): Orange (#fd7e14)

## Responsive Layouts

### Desktop (> 968px)
- Side-by-side layout
- Info panel: 350px fixed width
- Map: Remaining space
- Map height: 600px

### Tablet (< 968px)
- Stacked layout
- Info panel on top
- Map below
- Map height: 400px

### Mobile (< 600px)
- Condensed text sizes
- Smaller padding
- Touch-friendly buttons

## User Flow Example

### Example Session 1: Close Guess
1. Load page → See "Highway 253"
2. Click on map near center
3. Blue pin appears
4. Click "Submit Guess"
5. Red pin appears 0.15 miles away
6. See: "You were 0.15 miles away! 👍 Good guess! Not too far off!"
7. Click "New Road"
8. See "Poinsett Highway"
9. Repeat...

### Example Session 2: Perfect Guess
1. Load page → See "Church Street"
2. Know exactly where it is
3. Click precisely on the location
4. Click "Submit Guess"
5. Red pin appears just 50 meters away
6. See: "You were 164 feet away! 🎯 Amazing! You nailed it!"
7. Feel accomplished!

### Example Session 3: Learning Mode
1. Load page → See "Standing Springs Road"
2. Don't know where it is
3. Make educated guess
4. Click "Submit Guess"
5. See actual location 3 miles away
6. Learn where the road actually is
7. Remember for next time

## Interactive Elements

### Clickable/Interactive
- Entire map area (for placing guesses)
- "Submit Guess" button (when guess is placed)
- "New Road" button (always active)
- All map controls (zoom, street view, etc.)

### Visual Feedback
- Button hover effects (lift animation)
- Button disabled state (opacity 0.5)
- Marker drop animation
- Map auto-zoom on result

## Technical Details

### Map Configuration
- Center: Berea, SC (34.8854°N, 82.4568°W)
- Initial Zoom: 13
- Map Type: roadmap
- Libraries: places, geometry

### API Features Used
- **Places API**: Finding roads in Berea area
- **Geocoding API**: Converting road names to coordinates
- **Geometry API**: Calculating distances between points
- **Maps JavaScript API**: Rendering the map

### Distance Calculation
Uses spherical geometry to calculate the shortest distance between two points on Earth's surface (great circle distance).

Formula: `google.maps.geometry.spherical.computeDistanceBetween()`

## Tips for Best Experience

1. **Use Chrome or Firefox** for best compatibility
2. **Allow location services** if prompted (not required but helpful)
3. **Use satellite view** for better orientation (map type control)
4. **Zoom in/out** to better understand the area
5. **Take your time** - no time limit!
6. **Learn from mistakes** - pay attention to actual locations

## Accessibility Features

- High contrast text
- Clear button labels
- Keyboard navigable (partially)
- Semantic HTML structure
- Readable font sizes
- Touch-friendly on mobile

## What Makes a Good Guess?

| Distance | Accuracy Level | Description |
|----------|---------------|-------------|
| < 100m | Excellent | You know Berea very well! |
| 100-500m | Great | Very good local knowledge |
| 500m-1km | Good | Decent understanding of the area |
| 1-2km | Fair | Some knowledge, room to improve |
| > 2km | Learning | Keep playing to learn more! |

## Common Roads in Berea, SC

The application may show any of these roads:
- Main Street (downtown)
- Greenville Highway (US-25)
- Highway 253
- Church Street
- Cedar Lane Road
- Brushy Creek Road
- Lake Cunningham Road
- Bethany Road
- Shiloh Road
- Standing Springs Road
- Poinsett Highway
- White Horse Road

## Fun Challenges

1. **Speed Run**: How many roads can you guess < 500m in 10 minutes?
2. **Perfect Score**: Try to get 5 "Amazing" ratings in a row
3. **Learning Mode**: Play 20 rounds and see improvement
4. **Local Expert**: Get all main roads within 100m

## Sharing Your Scores

Currently, scores aren't saved, but you can:
- Screenshot your results
- Track manually on paper
- Challenge friends to beat your accuracy
- Keep mental notes of your best guesses

## Future Features (Potential)

- Score tracking and leaderboards
- Difficulty levels (city roads vs rural roads)
- Multiplayer mode
- Time challenges
- Street view integration
- More cities beyond Berea
- Social sharing
- User accounts

---

**Ready to play?** Follow the SETUP.md guide to get started!
