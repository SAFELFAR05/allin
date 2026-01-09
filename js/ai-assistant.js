(function() {
    // Add styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .ai-assistant-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            font-family: 'Inter', sans-serif;
        }
        .ai-toggle-btn {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 2px solid rgba(255,255,255,0.2);
        }
        .ai-toggle-btn:hover {
            transform: scale(1.1);
        }
        .ai-toggle-btn svg {
            color: white;
        }
        .ai-chat-window {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 450px;
            background: #1e1e2e;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            display: none;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .ai-chat-window.show {
            display: flex;
            animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .ai-chat-header {
            padding: 15px 20px;
            background: rgba(255,255,255,0.05);
            border-bottom: 1px solid rgba(255,255,255,0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .ai-chat-header h3 {
            margin: 0;
            font-size: 16px;
            color: white;
            font-family: 'Space Grotesk', sans-serif;
        }
        .ai-close-btn {
            cursor: pointer;
            color: #94a3b8;
        }
        .ai-chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .ai-message {
            max-width: 80%;
            padding: 10px 14px;
            border-radius: 15px;
            font-size: 14px;
            line-height: 1.4;
        }
        .ai-message.user {
            align-self: flex-end;
            background: #6366f1;
            color: white;
            border-bottom-right-radius: 2px;
        }
        .ai-message.bot {
            align-self: flex-start;
            background: rgba(255,255,255,0.1);
            color: #e2e8f0;
            border-bottom-left-radius: 2px;
        }
        .ai-chat-input {
            padding: 15px;
            background: rgba(0,0,0,0.2);
            display: flex;
            gap: 10px;
        }
        .ai-chat-input input {
            flex: 1;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 10px 15px;
            color: white;
            outline: none;
            font-size: 16px; /* Prevent mobile zoom */
        }
        .ai-chat-input button {
            background: #6366f1;
            border: none;
            color: white;
            border-radius: 50%;
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
        .ai-typing {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 5px;
            display: none;
        }
    `;
    document.head.appendChild(style);

    // Create UI elements
    const container = document.createElement('div');
    container.className = 'ai-assistant-container';
    container.innerHTML = `
        <div class="ai-chat-window" id="aiChatWindow">
            <div class="ai-chat-header">
                <h3>AI Assistant</h3>
                <div class="ai-close-btn" id="aiCloseBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </div>
            </div>
            <div class="ai-chat-messages" id="aiMessages">
                <div class="ai-message bot">Halo! Saya AI asisten AIODownloader. Ada yang bisa saya bantu?</div>
            </div>
            <div class="ai-typing" id="aiTyping" style="padding: 0 20px 10px;">AI sedang mengetik...</div>
            <form class="ai-chat-input" id="aiForm">
                <input type="text" id="aiInput" placeholder="Tanya sesuatu..." autocomplete="off">
                <button type="submit">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </form>
        </div>
        <div class="ai-toggle-btn" id="aiToggleBtn">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <circle cx="9" cy="10" r="1"></circle>
                <circle cx="15" cy="10" r="1"></circle>
            </svg>
        </div>
    `;
    document.body.appendChild(container);

    const toggleBtn = document.getElementById('aiToggleBtn');
    const chatWindow = document.getElementById('aiChatWindow');
    const closeBtn = document.getElementById('aiCloseBtn');
    const aiForm = document.getElementById('aiForm');
    const aiInput = document.getElementById('aiInput');
    const aiMessages = document.getElementById('aiMessages');
    const aiTyping = document.getElementById('aiTyping');

    // Load cached messages
    const cachedMessages = JSON.parse(localStorage.getItem('ai_messages') || '[]');
    if (cachedMessages.length > 0) {
        aiMessages.innerHTML = '';
        cachedMessages.forEach(msg => {
            const msgEl = document.createElement('div');
            msgEl.className = `ai-message ${msg.sender}`;
            msgEl.textContent = msg.text;
            aiMessages.appendChild(msgEl);
        });
        aiMessages.scrollTop = aiMessages.scrollHeight;
    }

    toggleBtn.onclick = () => chatWindow.classList.toggle('show');
    closeBtn.onclick = () => chatWindow.classList.remove('show');

    function addMessage(text, sender) {
        const msg = document.createElement('div');
        msg.className = `ai-message ${sender}`;
        msg.textContent = text;
        aiMessages.appendChild(msg);
        aiMessages.scrollTop = aiMessages.scrollHeight;

        // Update cache
        const messages = JSON.parse(localStorage.getItem('ai_messages') || '[]');
        messages.push({ text, sender });
        // Keep only last 50 messages
        if (messages.length > 50) messages.shift();
        localStorage.setItem('ai_messages', JSON.stringify(messages));
    }

    aiForm.onsubmit = async (e) => {
        e.preventDefault();
        const text = aiInput.value.trim();
        if (!text) return;

        aiInput.value = '';
        addMessage(text, 'user');
        
        aiTyping.style.display = 'block';

        try {
            const response = await fetch(`https://aioo.elfar.my.id/api/proxy?prompt=${encodeURIComponent(text)}&logic=Kamu adalah AI asisten untuk website AIODownloader. Pembuat website ini adalah ELFAR.DEV (https://elfar.my.id). Website ini adalah layanan download video dan audio gratis dari berbagai platform. Platform yang didukung meliputi: TikTok (tanpa watermark), Instagram (Reels/Video/Photo), Facebook, YouTube, Twitter (X), Spotify (Download lagu/playlist), CapCut, Threads, Pinterest, Reddit, SoundCloud, dan 50+ platform lainnya. Jawablah hanya pertanyaan yang berkaitan dengan website ini, cara download, atau platform yang didukung. Jika user bertanya tentang Spotify, katakan ya kita mendukung download dari Spotify. Jika user bertanya link download atau meminta file, jelaskan bahwa mereka harus menempelkan link video/audio di kotak input neon hijau di halaman utama.`);
            const data = await response.json();
            
            aiTyping.style.display = 'none';
            if (data && data.success && data.message) {
                addMessage(data.message, 'bot');
            } else if (data && data.data) {
                addMessage(data.data, 'bot');
            } else {
                addMessage('Maaf, saya sedang mengalami gangguan. Coba lagi nanti.', 'bot');
            }
        } catch (error) {
            aiTyping.style.display = 'none';
            addMessage('Gagal terhubung ke AI. Pastikan koneksi internet stabil.', 'bot');
        }
    };
})();
