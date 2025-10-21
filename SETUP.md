# Quick Setup Guide

## Step 1: Get a Google Maps API Key

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to "APIs & Services" > "Library"
4. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Geometry API
5. Go to "APIs & Services" > "Credentials"
6. Click "Create Credentials" > "API Key"
7. Copy your API key

## Step 2: Configure the Application

Open `index.html` and find this line (near the bottom):

```html
<script async defer
    src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places,geometry&callback=initMap">
</script>
```

Replace `YOUR_API_KEY` with your actual API key:

```html
<script async defer
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&libraries=places,geometry&callback=initMap">
</script>
```

## Step 3: Run the Application

### Option 1: Open Directly in Browser
Simply double-click `index.html` to open it in your default browser.

### Option 2: Use a Local Web Server (Recommended)

**Using Python:**
```bash
python -m http.server 8000
```
Then visit: http://localhost:8000

**Using Node.js:**
```bash
npx http-server
```
Then visit: http://localhost:8080

**Using PHP:**
```bash
php -S localhost:8000
```
Then visit: http://localhost:8000

## Step 4: Play the Game!

1. Wait for a road name to appear
2. Click on the map where you think the road is
3. Click "Submit Guess" to see how close you were
4. Click "New Road" to try another one

## Troubleshooting

### "This page can't load Google Maps correctly"
- Check that your API key is correct
- Verify all required APIs are enabled
- Make sure billing is set up (Google requires it, but free tier is generous)

### Roads not appearing
- Check browser console (F12) for errors
- Ensure you have internet connection
- The app includes fallback roads if API fails

### Map shows but is gray
- API key may not be valid
- Check API restrictions in Google Cloud Console

## Security Note

For production deployment, restrict your API key:
1. In Google Cloud Console, go to your API key
2. Set "Application restrictions" (HTTP referrers for web apps)
3. Add your domain(s) to allowed referrers
4. Set "API restrictions" to only the APIs you need

## Need Help?

Open an issue on GitHub or check the full README.md for more details.
