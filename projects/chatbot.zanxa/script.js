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
    const newChatBtn = document.getElementById('new-chat-btn');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const themeToggleTop = document.getElementById('theme-toggle');
    const sidebar = document.getElementById('sidebar');
    const chatHistoryList = document.getElementById('chat-history');
    const usernameModal = document.getElementById('username-modal');
    const usernameForm = document.getElementById('username-form');
    const usernameInput = document.getElementById('username-input');

    /* ── State ── */
    let isGenerating = false;
    let conversationHistory = [];
    let savedSessions = JSON.parse(localStorage.getItem('zanxa-sessions') || '[]');
    let currentSessionId = Date.now().toString();
    let hasSavedToHistory = false;

    // Config marked.js
    if (window.marked) {
        marked.setOptions({
            breaks: true,
            gfm: true
        });
    }

    /* ═══════════════════════════════════════════════
       INITIALIZATION
    ═══════════════════════════════════════════════ */
    function init() {
        loadChat();
        startWelcomeAnimation();
    }

    /* ═══════════════════════════════════════════════
       THEME & SIDEBAR
    ═══════════════════════════════════════════════ */
    const themes = ['dark', 'light', 'cream', 'pink', 'blue', 'green'];

    themeToggleTop.addEventListener('click', () => {
        let currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        let nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
        let nextTheme = themes[nextIndex];

        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('zanxa-theme', nextTheme);
    });

    // Set initial theme
    const savedTheme = localStorage.getItem('zanxa-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

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
        // Update the current session in savedSessions if it exists
        const sessionIdx = savedSessions.findIndex(s => s.id === currentSessionId);
        if (sessionIdx !== -1) {
            savedSessions[sessionIdx].history = conversationHistory;
            localStorage.setItem('zanxa-sessions', JSON.stringify(savedSessions));
        }
    }

    function loadChat() {
        // Load sidebar items first
        renderSidebar();

        const saved = localStorage.getItem('zanxa-chat-history');
        if (saved) {
            const rawHistory = JSON.parse(saved);
            // Conversion logic for old history format if exists
            conversationHistory = rawHistory.map(node => {
                if (node.versions) return node;
                // Convert old flat format
                return {
                    role: node.role === 'model' ? 'ai' : 'user',
                    activeVersion: 0,
                    versions: [{ text: node.parts[0].text }]
                };
            });

            if (conversationHistory.length > 0) {
                renderActiveHistory();
            }
        }
    }

    function renderSidebar() {
        chatHistoryList.innerHTML = '';
        if (savedSessions.length === 0) {
            chatHistoryList.innerHTML = '<div class="history-empty">Belum ada percakapan</div>';
            return;
        }

        savedSessions.forEach(session => {
            const item = createHistoryItem(session);
            chatHistoryList.appendChild(item);
        });
    }

    function createHistoryItem(session) {
        const item = document.createElement('div');
        item.className = `history-item ${session.id === currentSessionId ? 'active' : ''}`;

        // Find first user message text
        const firstNode = session.history.find(n => n.role === 'user');
        const activeText = firstNode?.versions[firstNode.activeVersion]?.text || 'Percakapan Baru';
        const title = activeText.slice(0, 30) + (activeText.length > 30 ? '...' : '');

        item.innerHTML = `
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>${title}</span>
            <button class="history-delete-btn" title="Hapus chat">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
        `;

        item.addEventListener('click', (e) => {
            if (e.target.closest('.history-delete-btn')) return;
            if (isGenerating) return;
            loadSession(session.id);
            if (window.innerWidth <= 768) closeSidebar();
        });

        // Delete button listener
        const deleteBtn = item.querySelector('.history-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Hapus percakapan ini secara permanen?')) {
                deleteSession(session.id);
            }
        });

        // Long press for mobile
        let touchTimeout;
        item.addEventListener('touchstart', () => {
            touchTimeout = setTimeout(() => {
                item.classList.add('show-delete');
            }, 500);
        });
        item.addEventListener('touchend', () => clearTimeout(touchTimeout));
        item.addEventListener('touchmove', () => clearTimeout(touchTimeout));

        return item;
    }

    function deleteSession(id) {
        savedSessions = savedSessions.filter(s => s.id !== id);
        localStorage.setItem('zanxa-sessions', JSON.stringify(savedSessions));

        if (currentSessionId === id) {
            newChatBtn.click();
        } else {
            renderSidebar();
        }
    }

    function loadSession(id) {
        const session = savedSessions.find(s => s.id === id);
        if (!session) return;

        currentSessionId = id;
        conversationHistory = session.history;
        localStorage.setItem('zanxa-chat-history', JSON.stringify(conversationHistory));
        renderActiveHistory();
        renderSidebar();
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

    function createMessageRow(text, role, index) {
        const row = document.createElement('div');
        row.className = `message-row ${role}`;
        row.dataset.index = index;

        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';

        // Add Branch Selector for User messages if they have forks
        if (role === 'user' && conversationHistory[index]?.versions?.length > 1) {
            bubble.appendChild(createBranchSelector(index));
        }

        const content = document.createElement('div');
        content.className = 'msg-content';

        if (role === 'user') {
            content.textContent = text;
        } else {
            content.innerHTML = formatMarkdown(text);
            addCopyButtons(content);
        }

        const actions = document.createElement('div');
        actions.className = 'msg-actions';

        // Copy Button (All)
        const copyBtn = createActionBtn('copy', () => {
            const textToCopy = role === 'user' ? text : content.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Visual feedback for copy
                const originalIcon = copyBtn.innerHTML;
                copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                setTimeout(() => {
                    copyBtn.innerHTML = originalIcon;
                }, 2000);
            });
        });
        actions.appendChild(copyBtn);

        // Edit Button (User only)
        if (role === 'user') {
            const editBtn = createActionBtn('edit', () => enterEditMode(row, text, index));
            actions.appendChild(editBtn);
        }

        bubble.appendChild(content);
        bubble.appendChild(actions);
        row.appendChild(bubble);

        return row;
    }

    function createActionBtn(type, onClick) {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        if (type === 'copy') {
            btn.title = 'Salin pesan';
            btn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        } else if (type === 'edit') {
            btn.title = 'Edit pesan';
            btn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
        }
        btn.onclick = (e) => {
            e.stopPropagation();
            onClick();
        };
        return btn;
    }

    function addCopyButtons(container) {
        const pres = container.querySelectorAll('pre');
        pres.forEach(pre => {
            const codeEl = pre.querySelector('code');
            if (codeEl && !codeEl.dataset.highlighted) {
                hljs.highlightElement(codeEl);
                codeEl.dataset.highlighted = 'true';
            }

            if (pre.querySelector('.code-header')) return;

            // Extract language
            let lang = 'code';
            if (codeEl) {
                const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
                if (langClass) lang = langClass.replace('language-', '');
                else {
                    const classes = Array.from(codeEl.classList);
                    const otherClass = classes.find(c => c !== 'hljs' && c !== 'hljs-ln');
                    if (otherClass) lang = otherClass;
                }
            }

            const header = document.createElement('div');
            header.className = 'code-header';
            header.innerHTML = `
                <div class="code-header-left">
                    <div class="mac-btn"></div>
                    <div class="mac-btn yellow"></div>
                    <div class="mac-btn green"></div>
                    <span class="code-lang">${lang}</span>
                </div>
                <button class="copy-btn">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Salin</span>
                </button>
            `;

            const copyBtn = header.querySelector('.copy-btn');
            copyBtn.onclick = (e) => {
                e.stopPropagation();
                const code = codeEl?.innerText || pre.innerText;
                navigator.clipboard.writeText(code).then(() => {
                    const span = copyBtn.querySelector('span');
                    const originalText = span.textContent;
                    span.textContent = 'Tersalin!';
                    setTimeout(() => {
                        span.textContent = originalText;
                    }, 2000);
                });
            };

            pre.prepend(header);
        });
    }

    function createBranchSelector(index) {
        const msg = conversationHistory[index];
        const selector = document.createElement('div');
        selector.className = 'branch-selector';
        selector.innerHTML = `
            <div class="branch-nav">
                <button class="branch-nav-btn prev" ${msg.activeVersion === 0 ? 'disabled' : ''}>&lt;</button>
                <span class="branch-counter">${msg.activeVersion + 1} / ${msg.versions.length}</span>
                <button class="branch-nav-btn next" ${msg.activeVersion === msg.versions.length - 1 ? 'disabled' : ''}>&gt;</button>
            </div>
        `;

        selector.querySelector('.prev').onclick = () => switchBranch(index, msg.activeVersion - 1);
        selector.querySelector('.next').onclick = () => switchBranch(index, msg.activeVersion + 1);
        return selector;
    }

    function enterEditMode(row, originalText, index) {
        const bubble = row.querySelector('.msg-bubble');
        const originalContent = bubble.querySelector('.msg-content');
        const actions = bubble.querySelector('.msg-actions');
        const branchSelector = bubble.querySelector('.branch-selector');

        originalContent.style.display = 'none';
        actions.style.display = 'none';
        if (branchSelector) branchSelector.style.display = 'none';

        const textarea = document.createElement('textarea');
        textarea.className = 'msg-edit-area';
        textarea.value = originalText;
        textarea.rows = Math.max(3, originalText.split('\n').length); // Adjust rows based on content

        const controls = document.createElement('div');
        controls.className = 'edit-controls';
        controls.innerHTML = `
            <button class="sidebar-btn" style="width: auto; padding: 4px 12px; border: 1px solid var(--border-color)">Batal</button>
            <button class="btn-primary" style="width: auto; padding: 4px 12px">Kirim</button>
        `;

        controls.querySelectorAll('button')[0].onclick = () => {
            textarea.remove();
            controls.remove();
            originalContent.style.display = 'block';
            actions.style.display = 'block';
            if (branchSelector) branchSelector.style.display = 'block';
        };

        controls.querySelectorAll('button')[1].onclick = () => {
            const newText = textarea.value.trim();
            if (newText && newText !== originalText) {
                processEdit(index, newText);
            } else {
                controls.querySelectorAll('button')[0].click();
            }
        };

        bubble.appendChild(textarea);
        bubble.appendChild(controls);
        textarea.focus();
    }

    function processEdit(index, newText) {
        const msg = conversationHistory[index];
        // Add new version
        msg.versions.push({
            text: newText,
            tail: [] // To store history of this branch if we want, but let's keep it simple: truncate
        });
        msg.activeVersion = msg.versions.length - 1;

        // Truncate history after this message
        conversationHistory = conversationHistory.slice(0, index + 1);

        // Re-render and trigger AI
        renderActiveHistory();
        triggerAIResponse(newText);
    }

    function switchBranch(index, versionIndex) {
        const msg = conversationHistory[index];
        msg.activeVersion = versionIndex;

        // In a real branching system, we'd restore the 'tail' of this version
        // For now, we'll just truncate and let the user re-generate or keep it simple
        conversationHistory = conversationHistory.slice(0, index + 1);
        renderActiveHistory();

        // If it's a version switch, we might want to automatically re-generate if there's no tail
        // But let's just show the state.
    }

    function renderActiveHistory() {
        messagesList.innerHTML = '';
        welcomeScreen.style.display = 'none';
        conversationHistory.forEach((node, idx) => {
            const activeMsg = node.versions[node.activeVersion];
            appendMessageUI(activeMsg.text, node.role, idx);
        });
        saveChat();
        scrollToBottom(); // Always scroll to bottom after re-rendering history
    }

    function appendMessageUI(text, role, index) {
        const row = createMessageRow(text, role, index);
        messagesList.appendChild(row);
        return row;
    }

    function appendMessage(text, role, shouldSave = true, shouldScroll = true) {
        if (welcomeScreen.style.display !== 'none') {
            welcomeScreen.style.display = 'none';
        }

        // Add to history state as a new node
        const node = {
            role: role,
            activeVersion: 0,
            versions: [{ text: text }]
        };
        conversationHistory.push(node);
        const index = conversationHistory.length - 1;

        const row = appendMessageUI(text, role, index);

        if (shouldScroll) {
            scrollToBottom();
        }

        if (shouldSave) {
            saveChat();
        }
        return row;
    }

    function scrollToBottom() {
        // Only scroll if already near bottom or forced
        const threshold = 150;
        const isNearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < threshold;

        if (isNearBottom) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
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
        // Map conversationHistory nodes to simple AI structure
        const contents = conversationHistory.map(node => ({
            role: node.role === 'user' ? 'user' : 'model',
            parts: [{ text: node.versions[node.activeVersion].text }]
        }));

        const response = await fetch(PROXY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-site-token": SITE_TOKEN,
                "x-turnstile-token": "turnstile-placeholder-token"
            },
            body: JSON.stringify({
                contents: contents
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.message || err?.error?.message || `Error ${response.status}`);
        }

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) return "(Tidak ada respon)";

        saveChat();
        return aiText;
    }

    async function triggerAIResponse(text) {
        isGenerating = true;
        sendBtn.disabled = true;
        showTyping();

        try {
            const aiReply = await callGeminiProxy(text);
            removeTyping();
            appendMessage(aiReply, 'ai', true, false);
        } catch (err) {
            removeTyping();
            appendMessage(`⚠️ Waduh ada error: ${err.message}`, 'ai');
        } finally {
            isGenerating = false;
            sendBtn.disabled = false;
        }
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
            setTimeout(() => {
                addToHistory();
                hasSavedToHistory = true;
            }, 500);
        }

        try {
            const aiReply = await callGeminiProxy(text);
            removeTyping();
            // User requested NO direct scroll-to-bottom for AI output
            appendMessage(aiReply, 'ai', true, false);
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

    newChatBtn.addEventListener('click', () => {
        if (conversationHistory.length > 0 || hasSavedToHistory) {
            if (!hasSavedToHistory && conversationHistory.length > 0) addToHistory();

            currentSessionId = Date.now().toString();
            conversationHistory = [];
            localStorage.removeItem('zanxa-chat-history');
            messagesList.innerHTML = '';
            welcomeScreen.style.display = 'flex';
            hasSavedToHistory = false;
            startWelcomeAnimation();
            renderSidebar();
        }
    });

    function addToHistory() {
        const session = {
            id: currentSessionId,
            history: conversationHistory,
            timestamp: Date.now()
        };

        const existingIdx = savedSessions.findIndex(s => s.id === currentSessionId);
        if (existingIdx !== -1) {
            savedSessions[existingIdx] = session;
        } else {
            savedSessions.unshift(session);
        }

        localStorage.setItem('zanxa-sessions', JSON.stringify(savedSessions));
        renderSidebar();
    }

    /* ═══════════════════════════════════════════════
       MOBILE FIXES
    ═══════════════════════════════════════════════ */
    // Handle visual viewport (keyboard)
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            const layout = document.querySelector('.app-layout');
            layout.style.height = `${window.visualViewport.height}px`;

            // Auto-scroll to bottom to keep input/last message visible
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        });
    }

    // Model Selector Logic (UI only)
    const modelSelector = document.getElementById('model-selector');
    const modelName = modelSelector.querySelector('.model-name');
    const options = modelSelector.querySelectorAll('.model-option:not(.locked)');
    const prankAudio = new Audio('assets/sound/hidup-jokowi.mp3');

    options.forEach(opt => {
        opt.addEventListener('click', () => {
            options.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            const selectedName = opt.querySelector('.opt-name').textContent;
            modelName.textContent = selectedName;

            // Sawit AI Prank
            if (selectedName === 'Sawit AI') {
                prankAudio.play().catch(e => console.log("Audio play blocked: " + e.message));
            } else {
                prankAudio.pause();
                prankAudio.currentTime = 0;
            }
        });
    });

    // Init
    loadChat();
    messageInput.focus();

});