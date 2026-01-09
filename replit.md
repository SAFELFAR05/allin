# AIODownloader

## Overview
A static HTML/CSS/JS website for an all-in-one video downloader service. Users can paste video URLs from platforms like TikTok, Instagram, Facebook, YouTube, and Twitter to download videos.

## Project Structure
- `index.html` - Main homepage
- `index-id.html` - Indonesian language version
- `about.html`, `about-id.html` - About pages
- `contact.html`, `contact-id.html` - Contact pages
- `download.html` - Download page
- `privacy.html`, `terms.html` - Legal pages
- `css/` - Stylesheets
- `js/` - JavaScript files
- `_redirects` - URL redirect configuration

## Technology Stack
- Pure HTML/CSS/JavaScript (no build system)
- Static file hosting

## Running Locally
Uses Python's built-in HTTP server on port 5000:
```
python3 -m http.server 5000 --bind 0.0.0.0
```

## Deployment
Configured as a static site deployment serving files from the root directory.
