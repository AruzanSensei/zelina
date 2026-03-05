/* =====================================================
   ZANXA AI — Chat Logic
   Gemini API: gemini-3-flash-preview
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ── Config ── */
    const PROXY_URL = "https://api.zanxa.site";
    const SITE_TOKEN = "zanxa-web-client-v1";

    /* ── DOM refs ── */
    const messagesList = document.getElementById('messages-list');
    const messagesContainer = document.getElementById('messages-container');
    const welcomeScreen = document.getElementById('welcome-screen');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const chatHistoryList = document.getElementById('chat-history');
    const usernameModal = document.getElementById('username-modal');
    const usernameForm = document.getElementById('username-form');
    const usernameInput = document.getElementById('username-input');

    /* ── State ── */
    let isGenerating = false;
    let conversationHistory = [];
    let username = localStorage.getItem('zanxa-username') || '';
    let hasSavedToHistory = false;

    // Config marked.js
    if (window.marked) {
        marked.setOptions({
            breaks: true,
            gfm: true
        });
    }

    /* ═══════════════════════════════════════════════
       USERNAME SETUP
    ═══════════════════════════════════════════════ */
    if (!username) {
        usernameModal.classList.add('visible');
    }

    usernameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = usernameInput.value.trim();
        if (val) {
            username = val;
            localStorage.setItem('zanxa-username', username);
            usernameModal.classList.remove('visible');
            appendMessage(`Halo **${username}**! Ada yang bisa saya bantu hari ini?`, 'ai');
        }
    });

    /* ═══════════════════════════════════════════════
       THEME & SIDEBAR
    ═══════════════════════════════════════════════ */
    const savedTheme = localStorage.getItem('zanxa-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('zanxa-theme', next);
    });

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', closeSidebar);
        }
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            sidebar.classList.toggle('open');
            sidebar.classList.remove('collapsed');
            overlay.classList.toggle('visible');
        }
    });

    function closeSidebar() {
        sidebar.classList.remove('open');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('visible');
    }

    /* ═══════════════════════════════════════════════
       AUTO-SAVE & LOAD
    ═══════════════════════════════════════════════ */
    function saveChat() {
        localStorage.setItem('zanxa-chat-history', JSON.stringify(conversationHistory));
    }

    function loadChat() {
        const saved = localStorage.getItem('zanxa-chat-history');
        if (saved) {
            conversationHistory = JSON.parse(saved);
            if (conversationHistory.length > 0) {
                welcomeScreen.style.display = 'none';
                hasSavedToHistory = true;
                conversationHistory.forEach(msg => {
                    appendMessage(msg.parts[0].text, msg.role === 'user' ? 'user' : 'ai', false);
                });
            }
        }
    }

    /* ═══════════════════════════════════════════════
       MESSAGE RENDERING
    ═══════════════════════════════════════════════ */
    function formatMarkdown(text) {
        if (window.marked) {
            return marked.parse(text);
        }
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    function createMessageRow(text, role) {
        const row = document.createElement('div');
        row.className = `message-row ${role}`;

        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';

        const content = document.createElement('div');
        content.className = 'msg-content';

        if (role === 'user') {
            content.textContent = text;
        } else {
            content.innerHTML = formatMarkdown(text);
            addCopyButtons(content);
        }

        bubble.appendChild(content);
        row.appendChild(bubble);

        return row;
    }

    function addCopyButtons(container) {
        const pres = container.querySelectorAll('pre');
        pres.forEach(pre => {
            if (pre.querySelector('.code-header')) return;

            const header = document.createElement('div');
            header.className = 'code-header';

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg> 
                <p>  Salin</p>
            `;

            copyBtn.addEventListener('click', () => {
                const code = pre.querySelector('code').innerText;
                navigator.clipboard.writeText(code).then(() => {
                    copyBtn.innerHTML = 'Tersalin!';
                    setTimeout(() => {
                        copyBtn.innerHTML = `
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg> 
                            <p>  Salin</p>
                        `;
                    }, 2000);
                });
            });

            header.appendChild(copyBtn);
            pre.prepend(header);
        });
    }

    function appendMessage(text, role, shouldSave = true) {
        if (welcomeScreen.style.display !== 'none') {
            welcomeScreen.style.display = 'none';
        }

        const row = createMessageRow(text, role);
        messagesList.appendChild(row);
        scrollToBottom();

        if (shouldSave) {
            saveChat();
        }
        return row;
    }

    function scrollToBottom() {
        messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
    }

    /* ═══════════════════════════════════════════════
       WELCOME TEXT ANIMATION
    ═══════════════════════════════════════════════ */
    const welcomeHeading = welcomeScreen.querySelector('h1');
    const welcomePhrases = [
        "Ada yang bisa dibantu?",
        "Mau ngobrol apa hari ini?",
        "Tanya apa saja ke saya...",
        "Siap membantu tugasmu!",
        "Lagi nyari ide apa nih?",
        "Yuk, mulai percakapan baru!"
    ];
    let phraseIndex = 0;

    async function typeWriter(text, element) {
        element.textContent = '';
        for (let i = 0; i < text.length; i++) {
            if (welcomeScreen.style.display === 'none') return;
            element.textContent += text.charAt(i);
            await new Promise(resolve => setTimeout(resolve, 70));
        }
    }

    async function rotateWelcomePhrases() {
        if (welcomeScreen.style.display === 'none') return;

        phraseIndex = (phraseIndex + 1) % welcomePhrases.length;
        await typeWriter(welcomePhrases[phraseIndex], welcomeHeading);

        setTimeout(rotateWelcomePhrases, 5000);
    }

    async function startWelcomeAnimation() {
        if (welcomeScreen.style.display === 'none') return;
        phraseIndex = 0;
        await typeWriter(welcomePhrases[0], welcomeHeading);
        setTimeout(rotateWelcomePhrases, 5000);
    }

    // Start rotation if on welcome screen
    if (welcomeScreen.style.display !== 'none') {
        startWelcomeAnimation();
    }

    /* ── Funny Typing indicator ── */
    let typingInterval;
    const funnyMessages = [
        "Sebentar ya...",
        "Lagi mikir keras nih...",
        "Sabar, orang sabar disayang Tuhan...",
        "Bentar, lagi buka primbon...",
        "Lagi ngetik, jangan diintip...",
        "Tunggu ya, lagi cari jawaban di awan...",
        "Bentar bos, lagi loading...",
        "Dikit lagi selesai nih..."
    ];

    function showTyping() {
        const row = document.createElement('div');
        row.className = 'message-row ai typing-row';
        row.id = 'typing-indicator';

        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';

        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.textContent = funnyMessages[0];

        const content = document.createElement('div');
        content.className = 'msg-content';
        content.innerHTML = `
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>`;

        bubble.appendChild(loadingText);
        bubble.appendChild(content);
        row.appendChild(bubble);
        messagesList.appendChild(row);
        scrollToBottom();

        let msgIndex = 0;
        typingInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % funnyMessages.length;
            loadingText.style.opacity = '0';
            setTimeout(() => {
                loadingText.textContent = funnyMessages[msgIndex];
                loadingText.style.opacity = '1';
            }, 300);
        }, 3000);

        return row;
    }

    function removeTyping() {
        const el = document.getElementById('typing-indicator');
        if (el) el.remove();
        clearInterval(typingInterval);
    }

    /* ═══════════════════════════════════════════════
       API CALL
    ═══════════════════════════════════════════════ */
    async function callGeminiProxy(userText) {
        conversationHistory.push({
            role: "user",
            parts: [{ text: userText }]
        });

        const response = await fetch(PROXY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-site-token": SITE_TOKEN,
                "x-turnstile-token": "turnstile-placeholder-token"
            },
            body: JSON.stringify({
                contents: conversationHistory
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.message || err?.error?.message || `Error ${response.status}`);
        }

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) return "(Tidak ada respon)";

        conversationHistory.push({
            role: "model",
            parts: [{ text: aiText }]
        });

        saveChat();
        return aiText;
    }

    async function handleSend() {
        const text = messageInput.value.trim();
        if (!text || isGenerating) return;

        isGenerating = true;
        sendBtn.disabled = true;
        messageInput.value = '';
        messageInput.style.height = 'auto';

        appendMessage(text, 'user');
        showTyping();

        // Auto-save to history on first message
        if (!hasSavedToHistory) {
            // Delay slightly to ensure conversationHistory has the first message
            setTimeout(() => {
                addToHistory();
                hasSavedToHistory = true;
            }, 500);
        }

        try {
            const aiReply = await callGeminiProxy(text);
            removeTyping();
            appendMessage(aiReply, 'ai');
        } catch (err) {
            removeTyping();
            appendMessage(`⚠️ Waduh, ada error: ${err.message}. Coba lagi ya!`, 'ai');
            conversationHistory.pop();
        } finally {
            isGenerating = false;
            sendBtn.disabled = messageInput.value.trim() === '';
            messageInput.focus();
        }
    }

    /* ═══════════════════════════════════════════════
       CONTROLS
    ═══════════════════════════════════════════════ */
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 200) + 'px';
        sendBtn.disabled = messageInput.value.trim() === '' || isGenerating;
    });

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendBtn.disabled) handleSend();
        }
    });

    sendBtn.addEventListener('click', handleSend);

    clearChatBtn.addEventListener('click', () => {
        if (confirm('Hapus semua obrolan ini?')) {
            conversationHistory = [];
            localStorage.removeItem('zanxa-chat-history');
            messagesList.innerHTML = '';
            welcomeScreen.style.display = 'flex';
            hasSavedToHistory = false;
            // Restart rotation if welcome screen is shown
            startWelcomeAnimation();
        }
    });

    newChatBtn.addEventListener('click', () => {
        if (conversationHistory.length > 0) {
            if (!hasSavedToHistory) addToHistory();
            conversationHistory = [];
            localStorage.removeItem('zanxa-chat-history');
            messagesList.innerHTML = '';
            welcomeScreen.style.display = 'flex';
            hasSavedToHistory = false;
            // Restart rotation if welcome screen is shown
            startWelcomeAnimation();
        }
    });

    function addToHistory() {
        const firstUser = conversationHistory.find(m => m.role === 'user');
        const title = firstUser?.parts[0]?.text?.slice(0, 30) + '...' || 'Chat';

        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>${title}</span>
        `;
        chatHistoryList.prepend(item);
    }

    // Init
    loadChat();
    messageInput.focus();

});