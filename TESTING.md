# Testing Guide

## Application Features to Test

### 1. Initial Load
- [ ] Page loads without errors
- [ ] Map displays centered on Berea, SC
- [ ] A random road name appears in the info panel
- [ ] "Submit Guess" button is disabled
- [ ] "New Road" button is enabled
- [ ] Result panel is hidden

### 2. User Interaction - Placing a Guess
- [ ] Click anywhere on the map
- [ ] Blue marker appears at clicked location
- [ ] "Submit Guess" button becomes enabled
- [ ] Clicking again moves the marker to the new location
- [ ] Previous marker is removed

### 3. Submitting a Guess
- [ ] Click "Submit Guess" button
- [ ] Red marker appears showing actual road location
- [ ] Blue line connects your guess to the actual location
- [ ] Distance is calculated and displayed
- [ ] Accuracy feedback message appears with appropriate emoji
- [ ] Map zooms to show both markers
- [ ] "Submit Guess" button becomes disabled

### 4. Distance Calculations
Test that distances are displayed correctly:
- [ ] < 100m shows "🎯 Amazing! You nailed it!"
- [ ] < 500m shows "🎉 Great job! Very close!"
- [ ] < 1000m shows "👍 Good guess! Not too far off!"
- [ ] < 2000m shows "😊 Decent attempt! Keep practicing!"
- [ ] > 2000m shows "🤔 Better luck next time!"
- [ ] Distances < 0.1 miles shown in feet
- [ ] Distances >= 0.1 miles shown in miles

### 5. New Road Functionality
- [ ] Click "New Road" button
- [ ] Previous markers are cleared
- [ ] Previous line is removed (may persist - known limitation)
- [ ] New road name appears
- [ ] Map recenters on Berea
- [ ] Result panel is hidden
- [ ] "Submit Guess" button is disabled
- [ ] Can place a new guess

### 6. Responsive Design
Test on different screen sizes:
- [ ] Desktop (> 968px): Side-by-side layout
- [ ] Tablet (< 968px): Stacked layout
- [ ] Mobile (< 600px): Optimized text sizes
- [ ] Map remains interactive on all sizes

### 7. Error Handling
- [ ] If Places API fails, fallback roads are used
- [ ] If geocoding fails, fallback location is used
- [ ] No JavaScript errors in console

## Known Limitations

1. **Polyline Persistence**: When clicking "New Road", the red line connecting guess to actual location may persist on the map. This is a minor visual issue and doesn't affect gameplay.

2. **API Dependency**: The application requires an active internet connection and valid Google Maps API key.

3. **Road Selection**: The random road selection depends on Google Places API results, which may vary. The fallback list ensures functionality even if API calls fail.

## Manual Testing Procedure

### Test Case 1: Complete Game Flow
1. Open the application
2. Wait for a road name to load (e.g., "Main Street")
3. Click somewhere on the map (e.g., near the center)
4. Verify blue marker appears
5. Click "Submit Guess"
6. Verify:
   - Red marker appears
   - Red line connects markers
   - Distance is shown
   - Feedback message appears
7. Click "New Road"
8. Verify new road name loads
9. Repeat steps 3-7

### Test Case 2: Multiple Guesses Before Submitting
1. Click on the map
2. Verify blue marker appears
3. Click on a different location
4. Verify marker moves to new location
5. Click "Submit Guess"
6. Verify results are based on the final location

### Test Case 3: Edge Cases
1. Try placing guess very far from Berea (should work but show large distance)
2. Try placing guess very close to center (should work)
3. Try clicking "Submit Guess" without placing a guess first (should be disabled)

## Performance Testing

- [ ] Page loads in < 3 seconds
- [ ] Map interactions are smooth
- [ ] No memory leaks on repeated plays
- [ ] API calls complete in < 2 seconds

## Browser Compatibility Testing

Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

## API Testing

### Places API
- [ ] Returns roads in Berea area
- [ ] Filters out non-road results (exits, etc.)
- [ ] Handles empty results gracefully

### Geocoding API
- [ ] Successfully geocodes fallback roads
- [ ] Handles failed geocoding requests

### Geometry API
- [ ] Correctly calculates distances
- [ ] Handles edge cases (same location, very far locations)

## Security Testing

- [x] CodeQL scan completed with no vulnerabilities
- [ ] No API key exposed in git history
- [ ] No XSS vulnerabilities
- [ ] No injection vulnerabilities
- [ ] HTTPS recommended for production

## Accessibility Testing

- [ ] Can navigate with keyboard
- [ ] Screen reader friendly
- [ ] Color contrast meets WCAG standards
- [ ] Interactive elements have appropriate ARIA labels

## Example Test Scenarios

### Scenario 1: Local Player
**User Story**: "As a Berea resident, I want to test my knowledge of local roads"

1. Load application
2. See "Highway 253"
3. Think: "That's the main highway through town"
4. Click near the center of Berea
5. See distance: 0.15 miles
6. Get feedback: "👍 Good guess!"
7. Try another road

### Scenario 2: Learning the Area
**User Story**: "As a new resident, I want to learn the road layout"

1. Load application
2. See "Standing Springs Road"
3. Not sure where it is, guess randomly
4. See distance: 2.5 miles
5. Get feedback: "🤔 Better luck next time!"
6. Make a mental note of actual location
7. Try more roads to learn

### Scenario 3: Challenge Mode
**User Story**: "As a competitive player, I want to get as close as possible"

1. Load application
2. Study the map carefully
3. Make precise guess
4. Achieve < 100m distance
5. Get "🎯 Amazing! You nailed it!"
6. Try to repeat the achievement

## Automated Testing (Future Enhancement)

Consider adding:
- Unit tests for distance calculations
- Integration tests for API calls
- E2E tests for user flows
- Visual regression tests

## Bug Reporting

If you find issues, please report:
1. Browser and version
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable
6. Console errors

## Test Results Log

Date: ___________
Tester: ___________
Browser: ___________
API Key Valid: Yes / No

| Test Case | Pass | Fail | Notes |
|-----------|------|------|-------|
| Initial Load | ⬜ | ⬜ | |
| Place Guess | ⬜ | ⬜ | |
| Submit Guess | ⬜ | ⬜ | |
| Distance Calc | ⬜ | ⬜ | |
| New Road | ⬜ | ⬜ | |
| Responsive | ⬜ | ⬜ | |
| Error Handling | ⬜ | ⬜ | |

Overall Status: ___________
