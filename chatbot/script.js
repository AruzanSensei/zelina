document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.querySelector('.chat-messages');
    const messageInput = document.querySelector('.message-input');
    const sendButton = document.querySelector('.send-button');
    const themeToggle = document.querySelector('.theme-toggle');
    const emptyState = document.querySelector('.empty-state');
    const reloadButton = document.querySelector('.reload-button');

    // Gemini API configuration
    const API_KEY = "AIzaSyA5WbRpMwd7T0LTZzVMfXylJZQJ5Z1FTtc";
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent";

    // Theme handling
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = messageInput.scrollHeight + 'px';
    });

    // Collapse textarea on blur
    messageInput.addEventListener('blur', () => {
        messageInput.style.height = 'auto'; // Reset height to collapse to min-height
    });

    // Message formatting
    function formatMessage(text) {
        // Handle code blocks with language specification
        let formattedText = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
            return `<pre><code class="language-${language || 'plaintext'}">${code.trim()}</code></pre>`;
        });

        // Handle inline code
        formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

        // Handle bold text with **
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Handle italic text with __
        formattedText = formattedText.replace(/__(.*?)__/g, '<em>$1</em>');
        
        // Handle bullet points
        formattedText = formattedText.replace(/^\* (.*?)$/gm, '<li>$1</li>');
        
        // Wrap bullet points in ul if they exist
        if (formattedText.includes('<li>')) {
            formattedText = `<ul>${formattedText}</ul>`;
        }

        // Auto-paragraph formatting
        formattedText = formattedText
            .split('\n\n')
            .map(paragraph => {
                // Skip if paragraph is already wrapped in HTML tags
                if (/^<(ul|pre|p|h[1-6])>/.test(paragraph.trim())) {
                    return paragraph;
                }
                return `<p>${paragraph}</p>`;
            })
            .join('');

        return formattedText;
    }

    function createMessageElement(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = formatMessage(text);
        
        messageDiv.appendChild(messageContent);
        return messageDiv;
    }

    function addMessage(text, isUser = false) {
        const messageElement = createMessageElement(text, isUser);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Hide empty state when first message is added
        if (emptyState.style.display !== 'none') {
            emptyState.style.display = 'none';
        }
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai typing-message';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return typingDiv;
    }

    function removeTypingIndicator(typingElement) {
        if (typingElement && typingElement.parentNode) {
            typingElement.parentNode.removeChild(typingElement);
        }
    }

    async function getGeminiResponse(userText) {
        try {
            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userText }] }]
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error:', error);
            return "Sorry, I encountered an error while processing your request. Please try again.";
        }
    }

    async function handleSendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message, true);
            messageInput.value = '';
            messageInput.style.height = 'auto';
            
            // Show typing indicator
            const typingIndicator = showTypingIndicator();
            
            try {
                const aiResponse = await getGeminiResponse(message);
                // Remove typing indicator
                removeTypingIndicator(typingIndicator);
                // Add AI response
                addMessage(aiResponse, false);
            } catch (error) {
                // Remove typing indicator
                removeTypingIndicator(typingIndicator);
                // Show error message
                addMessage("Sorry, I encountered an error. Please try again.", false);
            }
        }
    }

    reloadButton.addEventListener('click', () => {
        chatMessages.innerHTML = '';
        emptyState.style.display = 'block';
    });

    sendButton.addEventListener('click', handleSendMessage);

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Handle paste events to maintain formatting
    messageInput.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        const start = messageInput.selectionStart;
        const end = messageInput.selectionEnd;
        messageInput.value = messageInput.value.substring(0, start) + text + messageInput.value.substring(end);
        messageInput.selectionStart = messageInput.selectionEnd = start + text.length;
    });

    // Focus input on load
    messageInput.focus();
}); 