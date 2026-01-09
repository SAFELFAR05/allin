(function() {
    // Add styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .recent-downloads-container {
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 9998;
            font-family: 'Inter', sans-serif;
        }
        .recent-toggle-btn {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: rgba(30, 30, 46, 0.8);
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid rgba(255,255,255,0.1);
            color: white;
        }
        .recent-toggle-btn:hover {
            background: rgba(45, 45, 65, 0.9);
            transform: translateY(-2px);
        }
        .recent-window {
            position: absolute;
            bottom: 65px;
            left: 0;
            width: 280px;
            max-height: 400px;
            background: #1e1e2e;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            display: none;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .recent-window.show {
            display: flex;
            animation: slideUpRecent 0.3s ease-out;
        }
        @keyframes slideUpRecent {
            from { transform: translateY(10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .recent-header {
            padding: 12px 15px;
            background: rgba(255,255,255,0.05);
            border-bottom: 1px solid rgba(255,255,255,0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .recent-header h4 {
            margin: 0;
            font-size: 14px;
            color: white;
            font-family: 'Space Grotesk', sans-serif;
        }
        .recent-delete-all {
            cursor: pointer;
            color: #94a3b8;
            transition: color 0.2s;
        }
        .recent-delete-all:hover {
            color: #f87171;
        }
        .recent-list {
            flex: 1;
            padding: 10px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .recent-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px;
            background: rgba(255,255,255,0.03);
            border-radius: 10px;
            text-decoration: none;
            transition: background 0.2s;
        }
        .recent-item:hover {
            background: rgba(255,255,255,0.08);
        }
        .recent-thumb {
            width: 40px;
            height: 40px;
            border-radius: 6px;
            object-fit: cover;
        }
        .recent-info {
            flex: 1;
            min-width: 0;
        }
        .recent-title {
            font-size: 12px;
            color: #e2e8f0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 2px;
        }
        .recent-platform {
            font-size: 10px;
            color: #94a3b8;
            text-transform: uppercase;
        }
        .no-recent {
            padding: 20px;
            text-align: center;
            color: #94a3b8;
            font-size: 13px;
        }
    `;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.className = 'recent-downloads-container';
    container.innerHTML = `
        <div class="recent-window" id="recentWindow">
            <div class="recent-header">
                <h4>Recent Downloads</h4>
                <div class="recent-delete-all" id="recentDeleteBtn" title="Hapus Semua">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </div>
            </div>
            <div class="recent-list" id="recentList">
                <div class="no-recent">No recent downloads yet</div>
            </div>
        </div>
        <div class="recent-toggle-btn" id="recentToggleBtn" title="Recent Downloads">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 8v4l3 3"></path>
                <circle cx="12" cy="12" r="9"></circle>
            </svg>
        </div>
    `;
    document.body.appendChild(container);

    const toggleBtn = document.getElementById('recentToggleBtn');
    const windowEl = document.getElementById('recentWindow');
    const listEl = document.getElementById('recentList');
    const deleteBtn = document.getElementById('recentDeleteBtn');

    toggleBtn.onclick = () => windowEl.classList.toggle('show');
    deleteBtn.onclick = () => {
        if (confirm('Hapus semua riwayat download?')) {
            localStorage.removeItem('recent_downloads');
            updateRecentList();
        }
    };

    function updateRecentList() {
        const recent = JSON.parse(localStorage.getItem('recent_downloads') || '[]');
        if (recent.length === 0) {
            listEl.innerHTML = '<div class="no-recent">No recent downloads yet</div>';
            return;
        }

        listEl.innerHTML = '';
        recent.forEach(item => {
            const a = document.createElement('a');
            a.className = 'recent-item';
            a.href = `download.html?url=${encodeURIComponent(item.originalUrl)}`;
            a.innerHTML = `
                <img src="${item.thumbnail || 'favicon.png'}" class="recent-thumb" onerror="this.src='favicon.png'">
                <div class="recent-info">
                    <div class="recent-title">${item.title || 'Untitled Video'}</div>
                    <div class="recent-platform">${item.source || 'Video'}</div>
                </div>
            `;
            listEl.appendChild(a);
        });
    }

    updateRecentList();

    // Listen for storage changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'recent_downloads') updateRecentList();
    });

    // Custom event for internal updates
    window.addEventListener('recentUpdate', updateRecentList);
})();
