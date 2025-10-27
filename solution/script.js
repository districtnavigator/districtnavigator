let map;
let userMarker;
let connectingLine;
let infoWindow;

async function initMap() {
  const { Map, InfoWindow } = await google.maps.importLibrary("maps");
  const { LatLngBounds } = await google.maps.importLibrary("core");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  await google.maps.importLibrary("geometry");

  map = new Map(document.getElementById("map"), {
    center: { lat: 39.8283, lng: -98.5795 },
    zoom: 4,
    mapId: 'DEMO_MAP_ID',
    gestureHandling: 'greedy'
  });

  infoWindow = new InfoWindow();
  userMarker = new AdvancedMarkerElement({ map: null });

  const lineSymbol = {
    path: 'M 0,-1 0,1',
    strokeOpacity: 1,
    scale: 2
  };

  connectingLine = new google.maps.Polyline({
      map: map,
      strokeColor: '#0000FF',
      strokeOpacity: 0,
      icons: [{
          icon: lineSymbol,
          offset: '0',
          repeat: '10px'
      }]
  });

  map.data.setStyle({
    strokeColor: '#FF0000',
    strokeWeight: 3
  });

  map.addListener('click', (e) => {
      if (e.placeId) return;
      userMarker.position = e.latLng;
      userMarker.map = map;
      connectingLine.setPath([]);
      infoWindow.close();
  });

  document.getElementById('highlight-button').addEventListener('click', drawFromGeoJson);
  document.getElementById('find-nearest-button').addEventListener('click', findAndDrawNearestLine);
  
  drawFromGeoJson();
}

function drawFromGeoJson() {
  const geoJsonText = document.getElementById('geojson-data').value;
  const errorMessage = document.getElementById('error-message');

  map.data.forEach(feature => {
    map.data.remove(feature);
  });

  try {
    const geoJson = JSON.parse(geoJsonText);
    if (!geoJson.type) {
        throw new Error('Invalid GeoJSON: Missing "type" property.');
    }
    map.data.addGeoJson(geoJson);

    const bounds = new google.maps.LatLngBounds();
    map.data.forEach(feature => {
        const geometry = feature.getGeometry();
        processPoints(geometry, bounds.extend, bounds);
    });
    map.fitBounds(bounds);

    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';

  } catch (error) {
    console.error('Failed to parse GeoJSON:', error);
    errorMessage.textContent = 'Error: Invalid GeoJSON data format.';
    errorMessage.classList.remove('hidden');
  }
}

function findAndDrawNearestLine() {
    const errorMessage = document.getElementById('error-message');
    if (!userMarker.position) {
        errorMessage.textContent = 'Please place a marker on the map first.';
        errorMessage.classList.remove('hidden');
        return;
    }

    let minDistance = Infinity;
    let closestVertex = null;
    const allVertices = [];

    map.data.forEach(feature => {
        const geometry = feature.getGeometry();
        processPoints(geometry, (latlng) => {
            allVertices.push(latlng);
        });
    });

    if (allVertices.length === 0) {
        errorMessage.textContent = 'No road coordinate data found. Please highlight a road from GeoJSON first.';
        errorMessage.classList.remove('hidden');
        return;
    }

    allVertices.forEach(vertex => {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(userMarker.position, vertex);
        if (distance < minDistance) {
            minDistance = distance;
            closestVertex = vertex;
        }
    });

    if (closestVertex) {
        connectingLine.setPath([userMarker.position, closestVertex]);
        const distanceInMeters = minDistance.toFixed(2);
        infoWindow.setContent(`Distance: ${distanceInMeters} meters`);
        infoWindow.open({map: map, anchor: userMarker});
        errorMessage.classList.add('hidden');
    } else {
        errorMessage.textContent = 'Could not find the nearest vertex on the road.';
        errorMessage.classList.remove('hidden');
    }
}

function processPoints(geometry, callback, thisArg) {
  if (geometry instanceof google.maps.LatLng) {
    callback.call(thisArg, geometry);
  } else if (geometry instanceof google.maps.Data.Point) {
    callback.call(thisArg, geometry.get());
  } else {
    geometry.getArray().forEach(g => {
      processPoints(g, callback, thisArg);
    });
  }
}

initMap();