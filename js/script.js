// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Form submission
const downloadForm = document.getElementById('downloadForm');
const urlInput = document.getElementById('urlInput');
const submitBtn = document.getElementById('submitBtn');
const errorMessage = document.getElementById('errorMessage');

// Simple URL validation
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

downloadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = urlInput.value.trim();
    
    // Clear previous error
    errorMessage.classList.remove('show');
    
    // Validate URL
    if (!url) {
        showError('Please enter a URL');
        return;
    }
    
    if (!isValidUrl(url)) {
        showError('Please enter a valid URL');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span style="display: inline-block; animation: spin 1s linear infinite; width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%;"></span>';
    
    try {
        // Send to backend (this will be implemented in download page)
        // For now, just redirect to download page
        const encodedUrl = encodeURIComponent(url);
        window.location.href = `/download.html?url=${encodedUrl}`;
    } catch (error) {
        showError('An error occurred. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg><span>Download</span>';
    }
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

// Add spin animation to styles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const element = document.querySelector(href);
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Platform cards hover effect
document.querySelectorAll('.platform-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
    });
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});
