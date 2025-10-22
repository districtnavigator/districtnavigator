// Game state
let map;
let currentRoad = null;
let userMarker = null;
let roadMarker = null;
let userGuessLocation = null;
let districtBoundary = null;
let districtPolygon = null;

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

// Initialize the map
async function initMap() {
    // Create map centered on Berea, SC
    map = new google.maps.Map(document.getElementById('map'), {
        center: BEREA_CENTER,
        zoom: 13,
        mapTypeId: 'roadmap'
    });

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
            fillOpacity: 0.1,
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

// Select a random road in Berea, SC
async function selectNewRoad() {
    // Reset game state
    resetGame();

    // Show loading state
    document.getElementById('currentRoadName').textContent = 'Searching for road...';

    // Generate random road type search terms
    const roadTypes = ['road', 'street', 'avenue', 'highway', 'lane', 'drive'];
    const randomType = roadTypes[Math.floor(Math.random() * roadTypes.length)];
    
    try {
        // Search for roads in Berea area using the new Places API
        const request = {
            textQuery: randomType + ' in Berea, SC',
            fields: ['displayName', 'location'],
            locationBias: {
                circle: {
                    center: BEREA_CENTER,
                    radius: 5000 // 5km radius
                }
            },
            maxResultCount: 20
        };

        const { places } = await google.maps.places.Place.searchByText(request);

        if (places && places.length > 0) {
            // Filter for actual roads/streets
            let roads = places.filter(place => {
                const name = place.displayName ? place.displayName.toLowerCase() : '';
                return (name.includes('road') || 
                        name.includes('street') || 
                        name.includes('avenue') ||
                        name.includes('highway') ||
                        name.includes('lane') ||
                        name.includes('drive') ||
                        name.includes('way') ||
                        name.includes('circle') ||
                        name.includes('boulevard')) &&
                       !name.includes('exit') &&
                       !name.includes('bridge');
            });

            // Further filter to only include roads within district boundary
            if (districtBoundary && districtBoundary.length > 0) {
                roads = roads.filter(place => {
                    if (place.location) {
                        const point = {
                            lat: place.location.lat(),
                            lng: place.location.lng()
                        };
                        return isPointInBoundary(point);
                    }
                    return false;
                });
                
                console.log('Filtered to', roads.length, 'roads within district boundary');
            }

            if (roads.length > 0) {
                // Select a random road from the results
                const randomIndex = Math.floor(Math.random() * roads.length);
                const selectedPlace = roads[randomIndex];
                currentRoad = {
                    name: selectedPlace.displayName,
                    geometry: {
                        location: selectedPlace.location
                    }
                };
                document.getElementById('currentRoadName').textContent = currentRoad.name;
            } else {
                // Fallback to predefined list if no suitable roads found
                useFallbackRoad();
            }
        } else {
            // Fallback if API request fails
            useFallbackRoad();
        }
    } catch (error) {
        console.error('Error fetching roads:', error);
        // Fallback if API request fails
        useFallbackRoad();
    }
}

// Use fallback road from predefined list
function useFallbackRoad() {
    const randomIndex = Math.floor(Math.random() * BEREA_ROADS.length);
    const roadName = BEREA_ROADS[randomIndex];
    
    // Geocode the road name to get location
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        address: roadName + ', Berea, SC'
    }, function(results, status) {
        if (status === 'OK' && results.length > 0) {
            const location = results[0].geometry.location;
            const point = {
                lat: location.lat(),
                lng: location.lng()
            };
            
            // Check if location is within boundary
            if (isPointInBoundary(point)) {
                currentRoad = {
                    name: roadName,
                    geometry: {
                        location: location
                    }
                };
                document.getElementById('currentRoadName').textContent = roadName;
            } else {
                // Try another road from the list
                console.log(roadName, 'is outside boundary, trying another road');
                useFallbackRoad();
            }
        } else {
            // Last resort fallback - use center if within boundary
            const centerPoint = { lat: BEREA_CENTER.lat, lng: BEREA_CENTER.lng };
            if (isPointInBoundary(centerPoint)) {
                currentRoad = {
                    name: roadName,
                    geometry: {
                        location: new google.maps.LatLng(BEREA_CENTER.lat, BEREA_CENTER.lng)
                    }
                };
                document.getElementById('currentRoadName').textContent = roadName;
            } else {
                console.error('Could not find a road within the district boundary');
                document.getElementById('currentRoadName').textContent = 'Error: No roads found in district';
            }
        }
    });
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

    // Get the actual road location
    const roadLocation = currentRoad.geometry.location;

    // Place marker on actual road location
    if (roadMarker) {
        roadMarker.setMap(null);
    }

    roadMarker = new google.maps.Marker({
        position: roadLocation,
        map: map,
        icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new google.maps.Size(40, 40)
        },
        title: 'Actual Location',
        animation: google.maps.Animation.DROP
    });

    // Calculate distance between guess and actual location
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
        userGuessLocation,
        roadLocation
    );

    // Convert distance to miles and feet
    const distanceInMiles = (distance * 0.000621371).toFixed(2);
    const distanceInFeet = (distance * 3.28084).toFixed(0);

    // Display results
    displayResults(distanceInMiles, distanceInFeet, distance);

    // Draw a line between guess and actual location
    const line = new google.maps.Polyline({
        path: [userGuessLocation, roadLocation],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map: map
    });

    // Adjust map bounds to show both markers
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(userGuessLocation);
    bounds.extend(roadLocation);
    map.fitBounds(bounds);

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

    // Clear all polylines (lines drawn on map)
    // Note: This is a simple approach - in production you'd want to track polylines
    
    // Reset state
    userGuessLocation = null;
    currentRoad = null;

    // Reset UI
    document.getElementById('submitGuess').disabled = true;
    document.getElementById('resultPanel').style.display = 'none';

    // Reset map view
    map.setCenter(BEREA_CENTER);
    map.setZoom(13);
}

// Make initMap globally available for Google Maps callback
window.initMap = initMap;
