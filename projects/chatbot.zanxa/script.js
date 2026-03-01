/* =====================================================
   ZANXA AI — Chat Logic
   Gemini API: gemini-3-flash-preview
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ── Config ── */
    const API_KEY = "AIzaSyCjCFCcFo_lX7NqKeO0eD2rqr93ydsgCjw";
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

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
    const chatHistory = document.getElementById('chat-history');

    /* ── State ── */
    let isGenerating = false;
    let conversationHistory = []; // for multi-turn context

    /* ═══════════════════════════════════════════════
       THEME
    ═══════════════════════════════════════════════ */
    const savedTheme = localStorage.getItem('zanxa-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('zanxa-theme', next);
    });

    /* ═══════════════════════════════════════════════
       SIDEBAR TOGGLE
    ═══════════════════════════════════════════════ */
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        // mobile overlay
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
       AUTO-RESIZE TEXTAREA
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

    /* ═══════════════════════════════════════════════
       CLEAR / NEW CHAT
    ═══════════════════════════════════════════════ */
    function resetChat() {
        conversationHistory = [];
        messagesList.innerHTML = '';
        welcomeScreen.style.display = 'flex';
        messageInput.value = '';
        messageInput.style.height = 'auto';
        sendBtn.disabled = true;
    }

    clearChatBtn.addEventListener('click', resetChat);
    newChatBtn.addEventListener('click', () => {
        // Save current chat to history
        if (conversationHistory.length > 0) {
            addToHistory();
        }
        resetChat();
    });

    /* ═══════════════════════════════════════════════
       SUGGESTION CARDS
    ═══════════════════════════════════════════════ */
    document.querySelectorAll('.suggestion-card').forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.getAttribute('data-prompt');
            messageInput.value = prompt;
            messageInput.dispatchEvent(new Event('input'));
            handleSend();
        });
    });

    /* ═══════════════════════════════════════════════
       MARKDOWN FORMATTER
    ═══════════════════════════════════════════════ */
    function formatMarkdown(text) {
        let html = text;

        // Escape HTML first (except we need to handle code blocks specially)
        // --- Code blocks (``` lang \n code ```)
        html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
            const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<pre><code class="language-${lang || 'plaintext'}">${escaped.trim()}</code></pre>`;
        });

        // --- Inline code
        html = html.replace(/`([^`\n]+?)`/g, '<code>$1</code>');

        // --- Headings
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // --- Bold / Italic
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
        html = html.replace(/_(.+?)_/g, '<em>$1</em>');

        // --- Blockquote
        html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

        // --- HR
        html = html.replace(/^---$/gm, '<hr>');

        // --- Unordered list
        html = html.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`);

        // --- Ordered list
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

        // --- Paragraphs (double newlines)
        html = html
            .split(/\n{2,}/)
            .map(para => {
                const trimmed = para.trim();
                if (/^<(h[1-6]|ul|ol|pre|blockquote|hr)/.test(trimmed)) return trimmed;
                if (!trimmed) return '';
                // Single newlines → <br>
                return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
            })
            .filter(Boolean)
            .join('\n');

        return html;
    }

    /* ═══════════════════════════════════════════════
       MESSAGE RENDERING
    ═══════════════════════════════════════════════ */
    function createMessageRow(text, role) {
        const row = document.createElement('div');
        row.className = `message-row ${role}`;

        // Avatar
        const avatar = document.createElement('div');
        avatar.className = 'msg-avatar';
        avatar.textContent = role === 'user' ? 'U' : '✦';

        // Bubble
        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';

        const content = document.createElement('div');
        content.className = 'msg-content';

        if (role === 'user') {
            content.textContent = text;
        } else {
            content.innerHTML = formatMarkdown(text);
        }

        bubble.appendChild(content);
        row.appendChild(avatar);
        row.appendChild(bubble);

        return row;
    }

    function appendMessage(text, role) {
        // Hide welcome screen on first message
        if (welcomeScreen.style.display !== 'none') {
            welcomeScreen.style.display = 'none';
        }

        const row = createMessageRow(text, role);
        messagesList.appendChild(row);
        scrollToBottom();
        return row;
    }

    function scrollToBottom() {
        messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
    }

    /* ── Typing indicator ── */
    function showTyping() {
        const row = document.createElement('div');
        row.className = 'message-row ai typing-row';
        row.id = 'typing-indicator';

        const avatar = document.createElement('div');
        avatar.className = 'msg-avatar';
        avatar.textContent = '✦';

        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';

        const content = document.createElement('div');
        content.className = 'msg-content';
        content.innerHTML = `
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>`;

        bubble.appendChild(content);
        row.appendChild(avatar);
        row.appendChild(bubble);
        messagesList.appendChild(row);
        scrollToBottom();
        return row;
    }

    function removeTyping() {
        const el = document.getElementById('typing-indicator');
        if (el) el.remove();
    }

    /* ═══════════════════════════════════════════════
       GEMINI API CALL
    ═══════════════════════════════════════════════ */
    async function callGemini(userText) {
        // Build multi-turn contents
        conversationHistory.push({
            role: "user",
            parts: [{ text: userText }]
        });

        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": API_KEY
            },
            body: JSON.stringify({
                contents: conversationHistory
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "(No response)";

        // Store AI reply in history
        conversationHistory.push({
            role: "model",
            parts: [{ text: aiText }]
        });

        return aiText;
    }

    /* ═══════════════════════════════════════════════
       SEND MESSAGE
    ═══════════════════════════════════════════════ */
    async function handleSend() {
        const text = messageInput.value.trim();
        if (!text || isGenerating) return;

        isGenerating = true;
        sendBtn.disabled = true;

        // Clear input
        messageInput.value = '';
        messageInput.style.height = 'auto';

        // Show user message
        appendMessage(text, 'user');

        // Show typing
        showTyping();

        try {
            const aiReply = await callGemini(text);
            removeTyping();
            appendMessage(aiReply, 'ai');
        } catch (err) {
            removeTyping();
            appendMessage(`⚠️ Error: ${err.message}. Please try again.`, 'ai');
            console.error('Gemini API error:', err);
            // Remove failed turn from history
            conversationHistory.pop();
        } finally {
            isGenerating = false;
            sendBtn.disabled = messageInput.value.trim() === '';
            messageInput.focus();
        }
    }

    /* ═══════════════════════════════════════════════
       CHAT HISTORY (sidebar)
    ═══════════════════════════════════════════════ */
    function addToHistory() {
        const historyEmpty = chatHistory.querySelector('.history-empty');
        if (historyEmpty) historyEmpty.remove();

        const firstUser = conversationHistory.find(m => m.role === 'user');
        const title = firstUser?.parts[0]?.text?.slice(0, 36) + '...' || 'Chat';

        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${title}</span>
        `;
        chatHistory.prepend(item);
    }

    /* ── Initial focus ── */
    messageInput.focus();

});