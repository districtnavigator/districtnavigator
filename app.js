// Game state
let map;
let currentRoad = null;
let userMarker = null;
let roadMarker = null;
let randomPointMarker = null; // Green marker for random point (temporary)
let userGuessLocation = null;
let districtBoundary = null;
let districtPolygon = null;
let polylines = []; // Track all polylines for cleanup
let roadsData = null; // Store loaded GeoJSON roads data
let roadPolyline = null; // Track the currently displayed road polyline

// Berea, SC coordinates
const BEREA_CENTER = { lat: 34.8854, lng: -82.4568 };

// Common roads in Berea, SC area for fallback
const BEREA_ROADS = [
    'Main Street',
    'Greenville Highway',
    'Highway 25',
    'Highway 253',
    'Church Street',
    'Cedar Lane Road',
    'Brushy Creek Road',
    'Lake Cunningham Road',
    'Bethany Road',
    'Shiloh Road',
    'Standing Springs Road',
    'Poinsett Highway',
    'White Horse Road'
];

// Load and parse the district boundary from CSV
async function loadDistrictBoundary() {
    try {
        const response = await fetch('berea fire district- District line.csv');
        const csvText = await response.text();
        
        // Parse CSV - skip header, get second line
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            console.error('Invalid CSV format');
            return null;
        }
        
        // Extract WKT LINESTRING from the second line
        const dataLine = lines[1];
        const wktMatch = dataLine.match(/LINESTRING\s*\(([^)]+)\)/);
        
        if (!wktMatch) {
            console.error('Could not extract LINESTRING from CSV');
            return null;
        }
        
        // Parse coordinate pairs from WKT
        const coordString = wktMatch[1];
        const coordPairs = coordString.split(',').map(pair => {
            const [lng, lat] = pair.trim().split(/\s+/).map(parseFloat);
            return { lat, lng };
        });
        
        return coordPairs;
    } catch (error) {
        console.error('Error loading district boundary:', error);
        return null;
    }
}

// Load roads from GeoJSON file
async function loadRoadsData() {
    try {
        const response = await fetch('roads_by_name.geojson');
        const data = await response.json();
        
        if (data && data.features && Array.isArray(data.features)) {
            console.log('Loaded', data.features.length, 'roads from GeoJSON');
            return data.features;
        } else {
            console.error('Invalid GeoJSON format');
            return null;
        }
    } catch (error) {
        console.error('Error loading roads GeoJSON:', error);
        return null;
    }
}

// Check if a point is inside the district boundary polygon
function isPointInBoundary(point) {
    if (!districtBoundary || districtBoundary.length === 0) {
        // If no boundary is loaded, allow all points
        return true;
    }
    
    // Use Google Maps Geometry library to check if point is in polygon
    if (districtPolygon && google.maps.geometry.poly.containsLocation) {
        const latLng = new google.maps.LatLng(point.lat, point.lng);
        return google.maps.geometry.poly.containsLocation(latLng, districtPolygon);
    }
    
    // Fallback: simple ray-casting algorithm
    let inside = false;
    const x = point.lng;
    const y = point.lat;
    
    for (let i = 0, j = districtBoundary.length - 1; i < districtBoundary.length; j = i++) {
        const xi = districtBoundary[i].lng;
        const yi = districtBoundary[i].lat;
        const xj = districtBoundary[j].lng;
        const yj = districtBoundary[j].lat;
        
        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
}

// Generate a random point inside the district boundary
function generateRandomPointInBoundary() {
    if (!districtBoundary || districtBoundary.length === 0) {
        // If no boundary, use area around Berea center
        const offset = 0.05; // About 5km
        return {
            lat: BEREA_CENTER.lat + (Math.random() - 0.5) * offset,
            lng: BEREA_CENTER.lng + (Math.random() - 0.5) * offset
        };
    }
    
    // Find bounding box of the district boundary
    let minLat = districtBoundary[0].lat;
    let maxLat = districtBoundary[0].lat;
    let minLng = districtBoundary[0].lng;
    let maxLng = districtBoundary[0].lng;
    
    for (const point of districtBoundary) {
        minLat = Math.min(minLat, point.lat);
        maxLat = Math.max(maxLat, point.lat);
        minLng = Math.min(minLng, point.lng);
        maxLng = Math.max(maxLng, point.lng);
    }
    
    // Generate random points until we find one inside the boundary
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
        const randomPoint = {
            lat: minLat + Math.random() * (maxLat - minLat),
            lng: minLng + Math.random() * (maxLng - minLng)
        };
        
        if (isPointInBoundary(randomPoint)) {
            return randomPoint;
        }
        
        attempts++;
    }
    
    // Fallback: return center if we couldn't find a point
    console.warn('Could not generate random point in boundary, using center');
    return { lat: BEREA_CENTER.lat, lng: BEREA_CENTER.lng };
}

// Initialize the map
async function initMap() {
    // Create map centered on Berea, SC
    map = new google.maps.Map(document.getElementById('map'), {
        center: BEREA_CENTER,
        zoom: 13,
        mapTypeId: 'roadmap',
        // Start with labels visible - we'll hide them when a new road is selected
        styles: []
    });

    // Load roads data from GeoJSON
    roadsData = await loadRoadsData();
    if (!roadsData || roadsData.length === 0) {
        console.error('Failed to load roads data');
        document.getElementById('currentRoadName').textContent = 'Error: Could not load roads data';
        return;
    }

    // Load district boundary
    districtBoundary = await loadDistrictBoundary();
    
    // Display boundary on map if loaded successfully
    if (districtBoundary && districtBoundary.length > 0) {
        // Create polygon to display on map
        districtPolygon = new google.maps.Polygon({
            paths: districtBoundary,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0,
            clickable: false,
            map: map
        });
        
        console.log('District boundary loaded with', districtBoundary.length, 'points');
    } else {
        console.warn('Could not load district boundary - will use entire Berea area');
    }

    // Add click listener for user guesses
    map.addListener('click', function(event) {
        placeUserGuess(event.latLng);
    });

    // Set up button handlers
    document.getElementById('submitGuess').addEventListener('click', submitGuess);
    document.getElementById('newRoad').addEventListener('click', selectNewRoad);

    // Select initial road
    selectNewRoad();
}

// Select a random road from the GeoJSON data
async function selectNewRoad() {
    // Reset game state
    resetGame();

    // Show loading state
    document.getElementById('currentRoadName').textContent = 'Selecting road...';

    if (!roadsData || roadsData.length === 0) {
        document.getElementById('currentRoadName').textContent = 'Error: No roads available';
        return;
    }

    // Pick a random road from the GeoJSON features
    const randomIndex = Math.floor(Math.random() * roadsData.length);
    const roadFeature = roadsData[randomIndex];
    
    // Extract road name and geometry
    const roadName = roadFeature.properties.name;
    const geometry = roadFeature.geometry;
    
    console.log('Selected road:', roadName, 'Type:', geometry.type);
    
    // Store the current road with its complete GeoJSON data
    currentRoad = {
        name: roadName,
        feature: roadFeature,
        geometry: geometry
    };
    
    // Display the road name
    document.getElementById('currentRoadName').textContent = roadName;
    
    // Hide map labels so user can't cheat
    hideMapLabels();
}

// Hide map labels to prevent cheating
function hideMapLabels() {
    const styles = [
        {
            featureType: 'all',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
        }
    ];
    map.setOptions({ styles: styles });
    console.log('Map labels hidden');
}

// Show map labels again
function showMapLabels() {
    map.setOptions({ styles: [] });
    console.log('Map labels shown');
}

// Convert GeoJSON coordinates to Google Maps LatLng array
function convertGeoJsonToLatLng(geometry) {
    const coordinates = [];
    
    if (geometry.type === 'LineString') {
        // Single line: coordinates is an array of [lng, lat] pairs
        for (const coord of geometry.coordinates) {
            coordinates.push(new google.maps.LatLng(coord[1], coord[0]));
        }
    } else if (geometry.type === 'MultiLineString') {
        // Multiple lines: coordinates is an array of arrays of [lng, lat] pairs
        for (const lineString of geometry.coordinates) {
            for (const coord of lineString) {
                coordinates.push(new google.maps.LatLng(coord[1], coord[0]));
            }
        }
    }
    
    return coordinates;
}

// Place user's guess on the map
function placeUserGuess(location) {
    // Remove previous marker if exists
    if (userMarker) {
        userMarker.setMap(null);
    }

    // Create new marker for user's guess
    userMarker = new google.maps.Marker({
        position: location,
        map: map,
        icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(40, 40)
        },
        title: 'Your Guess',
        animation: google.maps.Animation.DROP
    });

    // Store the guess location
    userGuessLocation = location;

    // Enable submit button
    document.getElementById('submitGuess').disabled = false;

    // Hide previous results
    document.getElementById('resultPanel').style.display = 'none';
}

// Submit the user's guess and calculate distance
function submitGuess() {
    if (!userGuessLocation || !currentRoad) {
        alert('Please place a guess on the map first!');
        return;
    }

    // Convert GeoJSON geometry to LatLng coordinates
    const roadCoordinates = convertGeoJsonToLatLng(currentRoad.geometry);
    
    if (roadCoordinates.length === 0) {
        alert('Error: Could not load road coordinates');
        return;
    }
    
    console.log('Road has', roadCoordinates.length, 'coordinate points');
    
    // Draw the road on the map using a red polyline
    roadPolyline = new google.maps.Polyline({
        path: roadCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 4,
        map: map
    });
    
    // Calculate minimum distance to any point on the road
    let minDistance = Infinity;
    let closestPoint = roadCoordinates[0];
    
    for (const point of roadCoordinates) {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
            userGuessLocation,
            point
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
        }
    }
    
    console.log('Minimum distance to road:', minDistance, 'meters');

    // Place marker on the closest point of the road
    if (roadMarker) {
        roadMarker.setMap(null);
    }

    roadMarker = new google.maps.Marker({
        position: closestPoint,
        map: map,
        icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new google.maps.Size(40, 40)
        },
        title: 'Closest Point on Road',
        animation: google.maps.Animation.DROP
    });

    // Convert distance to miles and feet
    const distanceInMiles = (minDistance * 0.000621371).toFixed(2);
    const distanceInFeet = (minDistance * 3.28084).toFixed(0);

    // Display results
    displayResults(distanceInMiles, distanceInFeet, minDistance);

    // Draw a line between guess and closest point on road
    const line = new google.maps.Polyline({
        path: [userGuessLocation, closestPoint],
        geodesic: true,
        strokeColor: '#0000FF',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map: map
    });
    
    // Track the polyline for cleanup
    polylines.push(line);

    // Adjust map bounds to show both markers and the road
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(userGuessLocation);
    bounds.extend(closestPoint);
    
    // Extend bounds to include all road coordinates for better view
    for (const coord of roadCoordinates) {
        bounds.extend(coord);
    }
    
    map.fitBounds(bounds);

    // Show map labels again
    showMapLabels();

    // Disable submit button after submission
    document.getElementById('submitGuess').disabled = true;
}

// Display the results
function displayResults(miles, feet, meters) {
    const resultPanel = document.getElementById('resultPanel');
    const distanceResult = document.getElementById('distanceResult');
    const accuracyMessage = document.getElementById('accuracyMessage');

    resultPanel.style.display = 'block';

    // Format distance message
    let distanceText;
    if (parseFloat(miles) < 0.1) {
        distanceText = `You were ${feet} feet away!`;
    } else {
        distanceText = `You were ${miles} miles away!`;
    }
    distanceResult.textContent = distanceText;

    // Generate accuracy message based on distance
    let message;
    if (meters < 100) {
        message = '🎯 Amazing! You nailed it!';
        accuracyMessage.style.color = '#28a745';
    } else if (meters < 500) {
        message = '🎉 Great job! Very close!';
        accuracyMessage.style.color = '#20c997';
    } else if (meters < 1000) {
        message = '👍 Good guess! Not too far off!';
        accuracyMessage.style.color = '#17a2b8';
    } else if (meters < 2000) {
        message = '😊 Decent attempt! Keep practicing!';
        accuracyMessage.style.color = '#ffc107';
    } else {
        message = '🤔 Better luck next time!';
        accuracyMessage.style.color = '#fd7e14';
    }
    accuracyMessage.textContent = message;
}

// Reset the game
function resetGame() {
    // Clear markers
    if (userMarker) {
        userMarker.setMap(null);
        userMarker = null;
    }
    if (roadMarker) {
        roadMarker.setMap(null);
        roadMarker = null;
    }
    if (randomPointMarker) {
        randomPointMarker.setMap(null);
        randomPointMarker = null;
    }

    // Clear the road polyline
    if (roadPolyline) {
        roadPolyline.setMap(null);
        roadPolyline = null;
    }

    // Clear all polylines (lines drawn on map)
    for (const polyline of polylines) {
        polyline.setMap(null);
    }
    polylines = [];
    
    // Reset state
    userGuessLocation = null;
    currentRoad = null;

    // Reset UI
    document.getElementById('submitGuess').disabled = true;
    document.getElementById('resultPanel').style.display = 'none';

    // Reset map view
    map.setCenter(BEREA_CENTER);
    map.setZoom(13);
    
    // Show labels again (in case user clicks "New Road" without submitting)
    showMapLabels();
}

// Make initMap globally available for Google Maps callback
window.initMap = initMap;
