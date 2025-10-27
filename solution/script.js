let map;

function initMap() {
  // Center on Berea, SC
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 34.8854, lng: -82.4568 },
    zoom: 13,
    gestureHandling: 'greedy'
  });
}

// Make initMap globally available for Google Maps callback
window.initMap = initMap;