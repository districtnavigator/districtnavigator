# GitHub Pages Deployment Guide

## ⚠️ IMPORTANT: API Key Configuration Required

This application requires a Google Maps API key to function. **DO NOT** commit your API key to the repository.

## Pre-Deployment Checklist

- [ ] Get a Google Maps API key (see below)
- [ ] Configure API key restrictions
- [ ] Add API key to index.html (locally, not committed)
- [ ] Test the website locally
- [ ] Enable GitHub Pages in repository settings

## Step 1: Get Your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Geometry API
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. **IMPORTANT**: Restrict your API key (see Step 2)

## Step 2: Secure Your API Key

### Set HTTP Referrer Restrictions
1. In Google Cloud Console, go to your API key settings
2. Under "Application restrictions", select "HTTP referrers (websites)"
3. Add your allowed referrers:
   ```
   https://yourusername.github.io/*
   https://your-custom-domain.com/*
   http://localhost:8000/*  (for local testing)
   ```

### Set API Restrictions
1. Under "API restrictions", select "Restrict key"
2. Select only the APIs you need:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Geometry API

## Step 3: Configure Your Local Copy

### Option A: Modify index.html directly (NOT recommended for commits)
1. Open `index.html`
2. Find the line with `YOUR_GOOGLE_MAPS_API_KEY`
3. Replace it with your actual API key
4. **DO NOT** commit this change to git

### Option B: Use a separate configuration file (Recommended)
1. Copy `index.html.template` to `index.html`
2. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your API key
3. Add `index.html` to `.gitignore` if you want to keep it local

### Option C: Use environment variables with a build process
For advanced users, you can set up a build process that injects the API key at build time.

## Step 4: Test Locally

```bash
# Start a local web server
python3 -m http.server 8000

# Or use Node.js
npx http-server

# Visit http://localhost:8000
```

Verify that:
- The map loads correctly
- Road names appear
- You can place markers and get results
- No console errors appear

## Step 5: Deploy to GitHub Pages

### Option 1: Deploy from a branch
1. Go to your repository settings
2. Navigate to "Pages" section
3. Under "Source", select your branch (usually `main` or `gh-pages`)
4. Select the root folder `/` or `/docs` if you moved files there
5. Click "Save"

### Option 2: Deploy using GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

## Step 6: Configure API Key for GitHub Pages

### Important: Managing API Keys in Production

Since you cannot commit API keys to a public repository, you have these options:

### Option 1: Manual Update After Deployment
1. After GitHub Pages deploys, the site will not work initially
2. Clone the `gh-pages` branch
3. Update the API key in that branch only
4. Push changes to `gh-pages`
5. **Note**: This will be overwritten on next deployment from main

### Option 2: Use GitHub Secrets with Actions (Recommended)
1. Add your API key as a repository secret:
   - Go to Settings → Secrets and variables → Actions
   - Create secret named `GOOGLE_MAPS_API_KEY`
   
2. Modify the deployment workflow to inject the key:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Insert API Key
        run: |
          sed -i "s/YOUR_GOOGLE_MAPS_API_KEY/${{ secrets.GOOGLE_MAPS_API_KEY }}/g" index.html
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

### Option 3: Backend Proxy (Most Secure)
Set up a backend service to proxy API requests, keeping your key server-side.

## Security Best Practices

1. **Never commit API keys to your repository**
2. **Always use API key restrictions** in Google Cloud Console
3. **Monitor your API usage** regularly
4. **Rotate keys** if they become exposed
5. **Set up billing alerts** to avoid unexpected charges
6. **Use the principle of least privilege** - only enable required APIs

## Troubleshooting

### Map not loading
- Check browser console for errors
- Verify API key is correctly inserted
- Ensure all required APIs are enabled
- Check that your domain is in the allowed referrers list

### "This page can't load Google Maps correctly"
- API key may be invalid
- Billing may not be set up in Google Cloud
- Required APIs may not be enabled

### 403 Forbidden errors
- Check API restrictions in Google Cloud Console
- Verify HTTP referrer restrictions allow your domain

## Testing Your Deployment

After deployment, verify:
1. Visit your GitHub Pages URL
2. Check that the map loads
3. Test placing a guess
4. Verify distance calculations work
5. Try the "New Road" feature
6. Check browser console for errors

## Monitoring

Set up monitoring for:
- API usage in Google Cloud Console
- GitHub Pages build status
- Website functionality
- User feedback

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review Google Cloud Console for API issues
3. Verify GitHub Pages deployment status
4. Check repository Issues for similar problems

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Securing API Keys Best Practices](https://cloud.google.com/docs/authentication/api-keys)
