# GitHub Copilot – District Navigator Project Instructions

## Project Overview

District Navigator is a client-side geographic guessing game focused on roads in Berea, SC. The application is built with vanilla JavaScript, HTML5, and CSS3, with no build process or dependencies beyond the Google Maps Platform APIs.

## Architecture & Technology Stack

- **Frontend**: Pure HTML5, CSS3, and vanilla JavaScript (ES6+)
- **APIs**: Google Maps JavaScript API, Places API, Geocoding API, Geometry API
- **Deployment**: Static hosting (GitHub Pages, Netlify, Vercel)
- **No Build Process**: Files are served directly without transpilation or bundling

## Coding Standards

### JavaScript Style

- Use ES6+ features (const/let, arrow functions, template literals)
- Use `const` for immutable variables, `let` for mutable ones
- Never use `var`
- Use meaningful variable names (e.g., `userGuessLocation` not `loc`)
- Follow camelCase for variables and functions
- Use JSDoc comments for complex functions
- End statements with semicolons
- Use single quotes for strings

### HTML Style

- Use semantic HTML5 elements
- Include proper meta tags for responsive design
- Keep structure clean and accessible
- Use descriptive IDs and classes

### CSS Style

- Use modern CSS (Grid, Flexbox)
- Group related styles together
- Use CSS custom properties for colors/themes if adding new styles
- Maintain responsive design with media queries
- Follow mobile-first approach for new responsive features

### Code Organization

- Keep all JavaScript logic in `app.js`
- Keep all styles in `style.css`
- Keep HTML structure in `index.html`
- Don't create additional files unless absolutely necessary
- Maintain separation of concerns (structure/style/behavior)

## API Integration

### Google Maps APIs

- Always use the existing global `map` object
- Use Google Maps API callbacks appropriately
- Handle API failures gracefully with fallback mechanisms
- Log errors to console for debugging
- Never expose API keys in code (use HTML script src only)

### Error Handling

- Implement fallback mechanisms for API failures
- Use `console.log()` for debugging (project doesn't have a custom logger)
- Display user-friendly error messages
- Gracefully degrade when services are unavailable

## State Management

- Use simple global variables for game state
- State variables are declared at the top of `app.js`:
  - `map`: Google Map instance
  - `currentRoad`: Current road object
  - `userMarker`: User's guess marker
  - `roadMarker`: Actual road location marker
  - `userGuessLocation`: User's guess coordinates
- Reset state appropriately when starting a new game

## UI/UX Guidelines

- Maintain the existing color scheme:
  - Primary: #667eea (purple)
  - Secondary: #6c757d (gray)
  - Success: #28a745 (green)
  - Warning: #ffc107 (yellow)
  - Danger: #fd7e14 (orange)
- Keep the playful, engaging tone (emojis in feedback messages)
- Ensure all changes are responsive across desktop, tablet, and mobile
- Maintain accessibility standards (ARIA labels, keyboard navigation)

## Testing Requirements

- **No automated testing framework** exists in this project
- Test manually in multiple browsers (Chrome, Firefox, Safari, Edge)
- Test responsive design on different screen sizes
- Verify API integrations work correctly
- Check console for errors before committing
- Follow the testing checklist in `TESTING.md`

## Documentation

- Update `README.md` if adding new features or changing setup
- Update `ARCHITECTURE.md` if modifying the application architecture
- Keep code comments minimal but meaningful
- Document complex algorithms or business logic

## Security Best Practices

- Never commit API keys or secrets
- Recommend API key restrictions in documentation
- Use HTTPS for production deployments
- Validate user input appropriately
- Avoid XSS vulnerabilities (use DOM methods, not innerHTML for user content)

## Performance Considerations

- Keep the application lightweight (no heavy dependencies)
- Lazy load Google Maps API
- Minimize DOM manipulations
- Use efficient event listeners
- Don't add libraries unless absolutely necessary

## Git & Version Control

- Keep commits focused and atomic
- Write clear commit messages
- Don't commit:
  - API keys or secrets
  - `node_modules/` (if any tools are added)
  - Build artifacts
  - Temporary files
  - OS-specific files (.DS_Store, Thumbs.db)

## Project-Specific Guidelines

### Location Configuration

- Default location: Berea, SC (34.8854, -82.4568)
- Fallback roads are defined in `BEREA_ROADS` array
- When adding roads, include them in the fallback list

### Distance Calculations

- Use Google Maps Geometry API for accuracy
- Display distances in feet (< 0.1 miles) or miles (>= 0.1 miles)
- Maintain the existing accuracy feedback thresholds:
  - < 100m: "🎯 Amazing! You nailed it!"
  - < 500m: "🎉 Great job! Very close!"
  - < 1000m: "👍 Good guess! Not too far off!"
  - < 2000m: "😊 Decent attempt! Keep practicing!"
  - > 2000m: "🤔 Better luck next time!"

### Map Interactions

- User clicks place a single marker (remove previous on new click)
- Submit button should be disabled until a guess is placed
- Clear markers and state when starting a new game
- Fit map bounds to show both markers after submission

## Known Limitations

- Polyline may persist when clicking "New Road" (minor visual issue)
- Depends on active internet connection and valid API key
- Random road selection varies based on Places API results
- No scoring system or persistence (stateless application)

## Extension Guidelines

### Easy to Add (Acceptable Changes)

- Additional cities/regions (update `BEREA_CENTER`)
- More fallback roads (update `BEREA_ROADS`)
- Different difficulty levels (adjust search radius)
- Theme/color customizations (CSS updates)
- UI improvements maintaining current architecture

### Requires Discussion (Major Changes)

- User accounts or authentication
- Backend services or databases
- Persistent storage or cookies
- External dependencies or frameworks
- Build process or transpilation
- Multiplayer features

## When to Ask for Guidance

- If proposing architecture changes
- If adding external dependencies
- If changing the core game mechanics
- If uncertain about API usage or quotas
- If considering a breaking change to existing functionality

## Resources

- Main docs: `README.md`, `ARCHITECTURE.md`, `TESTING.md`
- Google Maps API: [developers.google.com/maps](https://developers.google.com/maps)
- Project is in: `/home/runner/work/districtnavigator/districtnavigator`
