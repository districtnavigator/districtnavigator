# Quick Start: Deploying to GitHub Pages

This is a quick reference guide for deploying the District Navigator website to GitHub Pages.

## ⚡ 3-Step Deployment

### Step 1: Add Your API Key Secret (2 minutes)

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `GOOGLE_MAPS_API_KEY`
5. Value: Paste your Google Maps API key
6. Click **Add secret**

**Getting an API Key:**
- Visit: https://console.cloud.google.com/
- Enable: Maps JavaScript API, Places API, Geocoding API, Geometry API
- Create API key and copy it

### Step 2: Enable GitHub Pages (1 minute)

1. Go to **Settings** → **Pages**
2. Under **Source**, select: **GitHub Actions**
3. Click **Save** (if prompted)

### Step 3: Deploy! (30 seconds)

The website will automatically deploy when you:
- Push to the `main` branch
- Or manually trigger the workflow in the **Actions** tab

That's it! Your website will be live at:
```
https://[your-username].github.io/districtnavigator/
```

## 🔒 Security Best Practices

After deployment, secure your API key in Google Cloud Console:

1. **Add HTTP Referrer Restrictions:**
   ```
   https://[your-username].github.io/*
   ```

2. **Restrict APIs:**
   - Only enable: Maps JavaScript, Places, Geocoding, Geometry

3. **Set Billing Alerts:**
   - $50, $100, $150 thresholds

## 🧪 Testing

After deployment:
1. Visit your GitHub Pages URL
2. Check if map loads
3. Try placing a guess
4. Test "New Road" button

## ❓ Troubleshooting

**Map not loading?**
- Check browser console (F12) for errors
- Verify API key secret is set correctly
- Ensure APIs are enabled in Google Cloud Console

**"This page can't load Google Maps correctly"?**
- Check API key restrictions in Google Cloud
- Ensure billing is set up (free tier available)

**Deployment failed?**
- Check GitHub Actions logs in the Actions tab
- Verify workflow file is present
- Check repository permissions

## 📚 More Help

For detailed instructions, see:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [PAGES_READY_SUMMARY.md](PAGES_READY_SUMMARY.md) - Full assessment
- [GITHUB_PAGES_READY.md](GITHUB_PAGES_READY.md) - Readiness checklist

## 💡 Local Development

To test locally before deploying:

```bash
# Configure your API key
./setup.sh

# Start local server
python3 -m http.server 8000

# Visit http://localhost:8000
```

---

**Need help?** Check the documentation files or open an issue on GitHub.

**Ready to deploy?** Follow the 3 steps above! 🚀
