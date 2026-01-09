// Set current year
document.getElementById('year').textContent = new Date().getFullYear();

// Get URL from query parameter
const urlParams = new URLSearchParams(window.location.search);
const videoUrl = urlParams.get('url');

// DOM elements
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const noUrlState = document.getElementById('noUrlState');
const resultsState = document.getElementById('resultsState');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const downloadAnotherBtn = document.getElementById('downloadAnotherBtn');

if (downloadAnotherBtn) {
    downloadAnotherBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// Show appropriate state based on URL
if (!videoUrl) {
    showNoUrlState();
} else {
    fetchVideoData(videoUrl);
}

async function fetchVideoData(url) {
    try {
        loadingState.style.display = 'flex';
        errorState.style.display = 'none';
        noUrlState.style.display = 'none';
        resultsState.style.display = 'none';

        const apiUrl = `https://aioo.elfar.my.id/api/resolve?link=${encodeURIComponent(url)}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("Failed to fetch download links. Please check the URL and try again.");
        }

        const data = await response.json();
        
        if (!data.success || !data.data) {
            throw new Error(data.message || "No data found for this link.");
        }

        // Add to recent downloads
        const result = data.data;
        const recent = JSON.parse(localStorage.getItem('recent_downloads') || '[]');
        const newItem = {
            originalUrl: url,
            title: result.title,
            thumbnail: result.thumbnail,
            source: result.source,
            timestamp: Date.now()
        };
        
        // Remove duplicate and add to start
        const filtered = recent.filter(item => item.originalUrl !== url);
        filtered.unshift(newItem);
        if (filtered.length > 10) filtered.pop();
        localStorage.setItem('recent_downloads', JSON.stringify(filtered));
        window.dispatchEvent(new Event('recentUpdate'));

        displayResults(result);
    } catch (error) {
        showError(error.message);
    }
}

async function forceDownloadBlob(url, filename = "download.mp4") {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;color:white;flex-direction:column;gap:15px;';
    loadingOverlay.innerHTML = '<div class="spinner-ring" style="width:50px;height:50px;border:5px solid #22c55e;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></div><span>Downloading to device...</span>';
    document.body.appendChild(loadingOverlay);

    try {
        // Try to use a CORS proxy to bypass restrictions
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error('Proxy fetch failed');

        const blob = await res.blob();
        const blobURL = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = blobURL;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(blobURL);
        document.body.removeChild(loadingOverlay);
    } catch (error) {
        console.warn("Proxy download failed, trying direct fetch:", error);
        
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const blobURL = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = blobURL;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(blobURL);
            document.body.removeChild(loadingOverlay);
        } catch (directError) {
            console.error("All download methods failed:", directError);
            document.body.removeChild(loadingOverlay);
            
            // Final fallback: open in new tab
            const a = document.createElement("a");
            a.href = url;
            a.target = "_blank";
            a.click();
        }
    }
}

function displayResults(data) {
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    resultsState.style.display = 'block';
    downloadAnotherBtn.style.display = 'flex';
    document.getElementById('adSpaceBottom').style.display = 'block';

    const { title, thumbnail, author, medias, url, duration, ...rest } = data;

    // Display video card if we have metadata
    if (title || thumbnail || author || duration) {
        const videoCard = document.getElementById('videoCard');
        videoCard.style.display = 'block';

        if (thumbnail) {
            const thumbnailSection = document.getElementById('thumbnailSection');
            thumbnailSection.style.display = 'block';
            document.getElementById('thumbnail').src = thumbnail;
        }

        if (title) {
            document.getElementById('videoTitle').textContent = title;
        }

        // Display metadata
        const videoMeta = document.getElementById('videoMeta');
        videoMeta.innerHTML = '';

        if (author) {
            videoMeta.innerHTML += `
                <div class="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>${escapeHtml(author)}</span>
                </div>
            `;
        }

        if (duration) {
            videoMeta.innerHTML += `
                <div class="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>${escapeHtml(duration)}</span>
                </div>
            `;
        }
    }

    // Process download links
    let downloadLinks = [];

    if (medias && Array.isArray(medias)) {
        downloadLinks = medias.map((media, i) => ({
            url: media.url,
            label: media.quality || `Download ${i + 1}`,
            size: media.formattedSize || (media.size ? formatFileSize(media.size) : ''),
            extension: media.extension || getExtensionFromUrl(media.url),
            id: i
        }));
    } else if (Array.isArray(url)) {
        downloadLinks = url.map((item, i) => ({
            url: item.url,
            label: item.quality || `Download ${i + 1}`,
            extension: item.ext || getExtensionFromUrl(item.url),
            id: i
        }));
    } else if (typeof url === 'string') {
        downloadLinks = [{
            url: url,
            label: 'Download',
            extension: getExtensionFromUrl(url),
            id: 0
        }];
    }

    // Remove duplicates
    downloadLinks = downloadLinks.filter((link, index, self) =>
        index === self.findIndex((t) => t.url === link.url)
    );

    // Display download links
    const downloadLinksContainer = document.getElementById('downloadLinks');
    downloadLinksContainer.innerHTML = '';

    downloadLinks.forEach((link, index) => {
        const icon = getMediaIcon(link.extension);
        const safeUrl = escapeAttr(link.url);
        const safeTitle = escapeAttr(title || "download");
        const safeExt = escapeAttr(link.extension || "mp4");
        
        const html = `
            <div class="download-link-item">
                <div class="link-info">
                    <svg class="link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        ${icon}
                    </svg>
                    <div class="link-details">
                        <div class="link-label">${escapeHtml(link.label)}</div>
                        ${link.size ? `<div class="link-size">${escapeHtml(link.size)}</div>` : ''}
                    </div>
                </div>
                <div class="link-actions">
                    <button class="copy-btn" onclick="copyLink('${safeUrl}', this)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                        </svg>
                        Copy
                    </button>
                    <button class="download-link-btn" onclick="forceDownloadBlob('${safeUrl}', '${safeTitle}.${safeExt}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download
                    </button>
                </div>
            </div>
        `;
        downloadLinksContainer.innerHTML += html;
    });

    // Display dynamic details
    const dynamicDetails = Object.entries(rest).filter(([key, value]) => {
        if (['status', 'code', 'success', 'message', 'medias', 'url', 'thumbnail', 'title', 'author', 'duration'].includes(key)) return false;
        if (typeof value === 'object' && value !== null) return false;
        if (!value || (Array.isArray(value) && value.length === 0)) return false;
        return true;
    });

    if (dynamicDetails.length > 0) {
        document.getElementById('detailsSection').style.display = 'block';
        const detailsGrid = document.getElementById('dynamicDetails');
        detailsGrid.innerHTML = '';

        dynamicDetails.forEach(([key, value]) => {
            const label = formatLabel(key);
            const isUrl = typeof value === 'string' && value.startsWith('http');

            const html = `
                <div class="detail-item">
                    <div class="detail-label">${escapeHtml(label)}</div>
                    <div class="detail-value">
                        ${isUrl ? `<a href="${escapeAttr(value)}" target="_blank" rel="noreferrer">View Link</a>` : escapeHtml(String(value))}
                    </div>
                </div>
            `;
            detailsGrid.innerHTML += html;
        });
    }
}

function showError(message) {
    loadingState.style.display = 'none';
    noUrlState.style.display = 'none';
    resultsState.style.display = 'none';
    errorState.style.display = 'flex';
    errorMessage.textContent = message;
    downloadAnotherBtn.style.display = 'flex';

    retryBtn.onclick = () => {
        fetchVideoData(videoUrl);
    };
}

function showNoUrlState() {
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    resultsState.style.display = 'none';
    noUrlState.style.display = 'flex';
}

// Helper functions
function copyLink(url, button) {
    navigator.clipboard.writeText(url).then(() => {
        const originalHtml = button.innerHTML;
        button.textContent = 'Copied!';
        button.classList.add('copied');

        setTimeout(() => {
            button.innerHTML = originalHtml;
            button.classList.remove('copied');
        }, 2000);
    });
}

function formatFileSize(bytes) {
    if (!bytes) return '';
    const mb = bytes / 1024 / 1024;
    return mb.toFixed(2) + ' MB';
}

function getExtensionFromUrl(url) {
    const match = url.split('.').pop()?.split('?')[0]?.toLowerCase();
    return match || '';
}

function getMediaIcon(extension) {
    const ext = extension.toLowerCase();

    if (['mp3', 'm4a', 'wav', 'aac', 'ogg'].includes(ext)) {
        return '<path d="M9 18V5l12-2v13A4 4 0 1 1 15 15M9 9h12M9 13h12"></path>';
    }

    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic'].includes(ext)) {
        return '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>';
    }

    return '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>';
}

function formatLabel(key) {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^\w/, c => c.toUpperCase())
        .trim();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeAttr(text) {
    return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
