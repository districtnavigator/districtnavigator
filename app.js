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

// Select a random road in Berea, SC using Roads API
async function selectNewRoad() {
    // Reset game state
    resetGame();

    // Show loading state
    document.getElementById('currentRoadName').textContent = 'Searching for road...';

    try {
        // Step 1: Generate a random point inside the district boundary
        const randomPoint = generateRandomPointInBoundary();
        console.log('Generated random point:', randomPoint);
        
        // Step 2: Show the random point with a green marker (temporary for testing)
        randomPointMarker = new google.maps.Marker({
            position: randomPoint,
            map: map,
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                scaledSize: new google.maps.Size(40, 40)
            },
            title: 'Random Point',
            animation: google.maps.Animation.DROP
        });
        
        // Step 3: Use Google Maps Roads API to find the nearest road
        const apiKey = 'AIzaSyCYmiyfib9rPjQINO44uBwpwoQjt5BV2Ao'; // Same API key from index.html
        const roadsApiUrl = `https://roads.googleapis.com/v1/nearestRoads?points=${randomPoint.lat},${randomPoint.lng}&key=${apiKey}`;
        
        const response = await fetch(roadsApiUrl);
        const data = await response.json();
        
        console.log('Roads API response:', data);
        
        if (data.snappedPoints && data.snappedPoints.length > 0) {
            const snappedPoint = data.snappedPoints[0];
            const roadLocation = snappedPoint.location;
            const placeId = snappedPoint.placeId;
            
            // Step 4: Get the road name using the placeId with Geocoding API
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ placeId: placeId }, async function(results, status) {
                if (status === 'OK' && results.length > 0) {
                    // Extract road name from the geocoded address
                    const address = results[0].address_components;
                    let roadName = results[0].formatted_address;
                    
                    // Try to get just the street name
                    for (const component of address) {
                        if (component.types.includes('route')) {
                            roadName = component.long_name;
                            break;
                        }
                    }
                    
                    // Step 5: Get the road polyline using Directions API
                    // Create a route along the road to get its polyline geometry
                    const roadPolyline = await getRoadPolyline(roadLocation, roadName);
                    
                    currentRoad = {
                        name: roadName,
                        geometry: {
                            location: new google.maps.LatLng(roadLocation.latitude, roadLocation.longitude)
                        },
                        polyline: roadPolyline, // Store the polyline path
                        placeId: placeId
                    };
                    
                    document.getElementById('currentRoadName').textContent = roadName;
                    console.log('Found road:', roadName, 'with', roadPolyline ? roadPolyline.length : 0, 'polyline points');
                } else {
                    console.error('Geocoding failed:', status);
                    useFallbackRoad();
                }
            });
        } else {
            console.warn('No roads found near the random point, using fallback');
            useFallbackRoad();
        }
    } catch (error) {
        console.error('Error in selectNewRoad:', error);
        useFallbackRoad();
    }
}

// Get road polyline using Directions API
async function getRoadPolyline(roadLocation, roadName) {
    try {
        // Create two points along the road - one slightly before and one slightly after
        // We'll use a small offset to create a route along the road
        const offset = 0.005; // About 500 meters
        
        // Create origin and destination points offset from the road location
        const origin = new google.maps.LatLng(
            roadLocation.latitude - offset,
            roadLocation.longitude - offset
        );
        const destination = new google.maps.LatLng(
            roadLocation.latitude + offset,
            roadLocation.longitude + offset
        );
        
        // Use DirectionsService to get the route
        const directionsService = new google.maps.DirectionsService();
        
        return new Promise((resolve, reject) => {
            directionsService.route(
                {
                    origin: origin,
                    destination: destination,
                    travelMode: google.maps.TravelMode.DRIVING,
                    provideRouteAlternatives: false
                },
                function(result, status) {
                    if (status === google.maps.DirectionsStatus.OK) {
                        // Extract the path from the route
                        const route = result.routes[0];
                        if (route && route.overview_path) {
                            console.log('Got polyline with', route.overview_path.length, 'points for', roadName);
                            resolve(route.overview_path);
                        } else {
                            console.warn('No overview_path in directions result for', roadName);
                            resolve(null);
                        }
                    } else {
                        console.warn('Directions request failed:', status, 'for', roadName);
                        resolve(null);
                    }
                }
            );
        });
    } catch (error) {
        console.error('Error getting road polyline:', error);
        return null;
    }
}

// Use fallback road from predefined list
async function useFallbackRoad() {
    const randomIndex = Math.floor(Math.random() * BEREA_ROADS.length);
    const roadName = BEREA_ROADS[randomIndex];
    
    // Geocode the road name to get location
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        address: roadName + ', Berea, SC'
    }, async function(results, status) {
        if (status === 'OK' && results.length > 0) {
            const location = results[0].geometry.location;
            const point = {
                lat: location.lat(),
                lng: location.lng()
            };
            
            // Check if location is within boundary
            if (isPointInBoundary(point)) {
                // Try to get polyline for fallback road too
                const roadPolyline = await getRoadPolyline(
                    { latitude: location.lat(), longitude: location.lng() },
                    roadName
                );
                
                currentRoad = {
                    name: roadName,
                    geometry: {
                        location: location
                    },
                    polyline: roadPolyline // Store polyline if available
                };
                document.getElementById('currentRoadName').textContent = roadName;
                console.log('Fallback road:', roadName, 'with', roadPolyline ? roadPolyline.length : 0, 'polyline points');
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
                    },
                    polyline: null // No polyline available for center point
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
    
    // Calculate distance using polyline if available
    let distance;
    let closestPoint = roadLocation; // Default to the single point
    
    if (currentRoad.polyline && currentRoad.polyline.length > 0) {
        // Calculate minimum distance to any point along the road polyline
        console.log('Calculating distance to', currentRoad.polyline.length, 'points on road polyline');
        
        let minDistance = Infinity;
        
        // Iterate through each point on the polyline
        for (const point of currentRoad.polyline) {
            const distanceToPoint = google.maps.geometry.spherical.computeDistanceBetween(
                userGuessLocation,
                point
            );
            
            if (distanceToPoint < minDistance) {
                minDistance = distanceToPoint;
                closestPoint = point;
            }
        }
        
        distance = minDistance;
        console.log('Minimum distance to road polyline:', distance, 'meters');
    } else {
        // Fallback to single point distance calculation
        console.log('No polyline available, using single point distance calculation');
        distance = google.maps.geometry.spherical.computeDistanceBetween(
            userGuessLocation,
            roadLocation
        );
    }

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
    const distanceInMiles = (distance * 0.000621371).toFixed(2);
    const distanceInFeet = (distance * 3.28084).toFixed(0);

    // Display results
    displayResults(distanceInMiles, distanceInFeet, distance);

    // Draw a line between guess and closest point on road
    const line = new google.maps.Polyline({
        path: [userGuessLocation, closestPoint],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map: map
    });
    
    // Track the polyline for cleanup
    polylines.push(line);

    // Adjust map bounds to show both markers
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(userGuessLocation);
    bounds.extend(closestPoint);
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
    if (randomPointMarker) {
        randomPointMarker.setMap(null);
        randomPointMarker = null;
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
}

// Make initMap globally available for Google Maps callback
window.initMap = initMap;
