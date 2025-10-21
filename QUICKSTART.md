# Quick Start - Get Playing in 5 Minutes!

## 🚀 Fastest Way to Start Playing

### Step 1: Get Your API Key (2 minutes)
1. Go to https://console.cloud.google.com/
2. Create/select a project
3. Go to "APIs & Services" → "Library"
4. Enable these 4 APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API  
   - Geometry API
5. Go to "Credentials" → "Create Credentials" → "API Key"
6. Copy your API key

### Step 2: Add Your Key (1 minute)
Open `index.html` and find line 48:
```html
src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places,geometry&callback=initMap">
```

Replace `YOUR_API_KEY` with your key:
```html
src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx&libraries=places,geometry&callback=initMap">
```

### Step 3: Open and Play! (1 minute)
Simply double-click `index.html` to open in your browser, or:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -S SimpleHTTPServer 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Then visit http://localhost:8000

## 🎮 How to Play

1. **See the road name** - Wait for it to load
2. **Click the map** - Place your guess pin
3. **Submit** - Click "Submit Guess"
4. **See results** - Distance and accuracy shown
5. **Try again** - Click "New Road"

## 🎯 Goal

Try to place your pin as close as possible to where the road actually is!

## 📊 Accuracy Levels

- **< 100m** → 🎯 Amazing!
- **< 500m** → 🎉 Great job!
- **< 1km** → 👍 Good guess!
- **< 2km** → 😊 Decent!
- **> 2km** → 🤔 Better luck next time!

## ❓ Problems?

### Map not loading?
- Check API key is correct
- Ensure all 4 APIs are enabled
- Check browser console (F12) for errors

### No roads appearing?
- App will use fallback roads automatically
- Check internet connection

### Still stuck?
See SETUP.md for detailed help or TESTING.md for troubleshooting.

## 📚 More Info

- **README.md** - Full documentation
- **SETUP.md** - Detailed setup guide
- **DEMO.md** - Visual guide and tips
- **TESTING.md** - Testing procedures
- **SUMMARY.md** - Technical overview

## 🎉 That's It!

You're ready to test your knowledge of Berea, SC roads!

**Have fun and good luck! 🗺️**

---

**Pro Tip**: Start with familiar roads like "Main Street" or "Highway 25" to get a feel for the game!
