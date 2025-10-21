// Game state
let map;
let currentRoad = null;
let userMarker = null;
let roadMarker = null;
let userGuessLocation = null;

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

// Initialize the map
function initMap() {
    // Create map centered on Berea, SC
    map = new google.maps.Map(document.getElementById('map'), {
        center: BEREA_CENTER,
        zoom: 13,
        mapTypeId: 'roadmap'
    });

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
function selectNewRoad() {
    // Reset game state
    resetGame();

    // Show loading state
    document.getElementById('currentRoadName').textContent = 'Searching for road...';

    // Use Places API to find roads in Berea, SC
    const service = new google.maps.places.PlacesService(map);
    
    // Generate random road type search terms
    const roadTypes = ['road', 'street', 'avenue', 'highway', 'lane', 'drive'];
    const randomType = roadTypes[Math.floor(Math.random() * roadTypes.length)];
    
    // Search for roads in Berea area using textSearch
    const request = {
        query: randomType + ' in Berea, SC',
        location: BEREA_CENTER,
        radius: 5000 // 5km radius
    };

    service.textSearch(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
            // Filter for actual roads/streets
            const roads = results.filter(place => {
                const name = place.name.toLowerCase();
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

            if (roads.length > 0) {
                // Select a random road from the results
                const randomIndex = Math.floor(Math.random() * roads.length);
                currentRoad = roads[randomIndex];
                document.getElementById('currentRoadName').textContent = currentRoad.name;
            } else {
                // Fallback to predefined list if no suitable roads found
                useFallbackRoad();
            }
        } else {
            // Fallback if API request fails
            useFallbackRoad();
        }
    });
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
            currentRoad = {
                name: roadName,
                geometry: {
                    location: results[0].geometry.location
                }
            };
            document.getElementById('currentRoadName').textContent = roadName;
        } else {
            // Last resort fallback
            currentRoad = {
                name: roadName,
                geometry: {
                    location: new google.maps.LatLng(BEREA_CENTER.lat, BEREA_CENTER.lng)
                }
            };
            document.getElementById('currentRoadName').textContent = roadName;
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
