// ===== AI CHATBOT WITH GROQ AI =====
// Fast & Free Bengali E-commerce Chatbot

(function() {
    'use strict';

    // ⚠️ এখানে আপনার Groq API Key বসান
    const GROQ_API_KEY = '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';
    
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
    
    // ===== BOT CONTEXT =====
    const BOT_CONTEXT = `You are "Smart Assistant" (স্মার্ট সহায়ক), a helpful AI chatbot for "Smart Kenakata" - a Bengali e-commerce platform in Bangladesh.

IMPORTANT INFO:
- Website: Smart Kenakata (স্মার্ট কেনাকাটা)
- Type: Multi-vendor Reseller E-commerce
- Categories: Electronics, Fashion, Beauty, Home & Living, Toys, Books, Grocery
- Delivery: Inside Dhaka 24 hours (৳60), Outside Dhaka 3-5 days (৳120)
- Free delivery on orders ৳500+
- Payment: bKash, Nagad, Rocket, Cash on Delivery
- Phone: 01932211123
- Email: info@smartkenakata.com
- Address: Mirpur-10, Dhaka
- Hours: 9 AM - 11 PM
- Return Policy: 7 days

RULES:
1. Be friendly and helpful
2. Use emojis
3. Keep replies short (3-5 lines)
4. If asked about products, tell them to visit homepage
5. For order status, ask them to WhatsApp
6. Reply in Bengali if user writes Bengali
7. Reply in English if user writes English
8. Reply in Hindi if user writes Hindi
9. Never say "I'm AI" - say "I'm Smart Assistant"
10. For irrelevant questions, politely bring back to shopping topics
11. You can answer general questions too like a helpful assistant`;

    let chatHistory = [];

    // ===== CHATBOT HTML =====
    const chatbotHTML = `
        <div id="chatbot-wrapper">
            <button id="chatbot-toggle" onclick="toggleChatbot()">
                <i class="fas fa-comments" id="chat-icon-open"></i>
                <i class="fas fa-times" id="chat-icon-close" style="display:none;"></i>
                <span class="chatbot-badge">
                    <i class="fas fa-sparkles"></i>
                </span>
            </button>

            <div id="chatbot-window">
                <div class="chatbot-header">
                    <div class="chatbot-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="chatbot-info">
                        <h3>স্মার্ট সহায়ক <span class="ai-badge">AI</span></h3>
                        <span class="chatbot-status">
                            <span class="status-dot"></span> Powered by Groq AI ⚡
                        </span>
                    </div>
                    <button class="chatbot-close" onclick="toggleChatbot()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="chatbot-messages" id="chatbot-messages"></div>

                <div class="chatbot-quick-replies">
                    <button onclick="sendQuickReply('হ্যালো, তুমি কে?')">👋 হ্যালো</button>
                    <button onclick="sendQuickReply('তোমাদের পণ্য কী কী আছে?')">🛍️ পণ্য</button>
                    <button onclick="sendQuickReply('ডেলিভারি চার্জ কত?')">🚚 ডেলিভারি</button>
                    <button onclick="sendQuickReply('পেমেন্ট কীভাবে করব?')">💳 পেমেন্ট</button>
                    <button onclick="sendQuickReply('কোন অফার আছে?')">🎁 অফার</button>
                </div>

                <div class="chatbot-input-wrapper">
                    <input type="text" id="chatbot-input" placeholder="আপনার প্রশ্ন লিখুন..." onkeypress="handleKeyPress(event)">
                    <button onclick="sendMessage()" class="chatbot-send" id="sendBtn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>

                <div class="chatbot-footer">
                    <i class="fas fa-bolt"></i> Ultra Fast AI • Powered by Groq
                </div>
            </div>
        </div>
    `;

    // ===== CSS =====
    const chatbotCSS = `
        <style>
            #chatbot-wrapper {
                position: fixed;
                bottom: 25px;
                right: 100px;
                z-index: 9998;
                font-family: 'Hind Siliguri', sans-serif;
            }
            #chatbot-toggle {
                width: 60px; height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                cursor: pointer;
                font-size: 26px;
                box-shadow: 0 5px 20px rgba(16, 185, 129, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                transition: transform 0.3s;
                animation: pulse-chat 2s infinite;
            }
            @keyframes pulse-chat {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            #chatbot-toggle:hover { transform: scale(1.1); }
            .chatbot-badge {
                position: absolute;
                top: -3px; right: -3px;
                background: linear-gradient(135deg, #f59e0b, #ef4444);
                color: white;
                width: 24px; height: 24px;
                border-radius: 50%;
                font-size: 11px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                animation: sparkle 2s infinite;
            }
            @keyframes sparkle {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(180deg); }
            }
            #chatbot-window {
                position: absolute;
                bottom: 75px; right: 0;
                width: 380px; height: 580px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
                display: none;
                flex-direction: column;
                overflow: hidden;
                animation: slideUp 0.3s;
            }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            #chatbot-window.open { display: flex; }
            .chatbot-header {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 18px 20px;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .chatbot-avatar {
                width: 45px; height: 45px;
                background: rgba(255, 255, 255, 0.25);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 22px;
            }
            .chatbot-info { flex: 1; }
            .chatbot-info h3 {
                font-size: 17px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .ai-badge {
                background: rgba(255,255,255,0.25);
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: 700;
            }
            .chatbot-status {
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 5px;
                opacity: 0.9;
            }
            .status-dot {
                width: 8px; height: 8px;
                background: #4ade80;
                border-radius: 50%;
                animation: pulse-dot 2s infinite;
            }
            @keyframes pulse-dot {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            .chatbot-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                width: 32px; height: 32px;
                border-radius: 50%;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .chatbot-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
            }
            .message {
                margin-bottom: 15px;
                display: flex;
                gap: 10px;
                animation: fadeIn 0.3s;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .message.user { justify-content: flex-end; }
            .message-avatar {
                width: 32px; height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                flex-shrink: 0;
            }
            .message.bot .message-avatar {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
            }
            .message.user .message-avatar {
                background: #3b82f6;
                color: white;
                order: 2;
            }
            .message-bubble {
                max-width: 75%;
                padding: 12px 15px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.6;
                white-space: pre-line;
                word-wrap: break-word;
            }
            .message.bot .message-bubble {
                background: white;
                color: #0f172a;
                border-top-left-radius: 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            }
            .message.user .message-bubble {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border-top-right-radius: 4px;
            }
            .message-time {
                font-size: 11px;
                color: #64748b;
                margin-top: 4px;
            }
            .typing-indicator {
                display: flex;
                gap: 4px;
                padding: 12px 16px;
                background: white;
                border-radius: 18px;
                border-top-left-radius: 4px;
                width: fit-content;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            }
            .typing-indicator span {
                width: 8px; height: 8px;
                background: #10b981;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }
            .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
            .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                30% { transform: translateY(-8px); opacity: 1; }
            }
            .chatbot-quick-replies {
                padding: 10px 15px;
                background: white;
                border-top: 1px solid #e2e8f0;
                display: flex;
                gap: 8px;
                overflow-x: auto;
                white-space: nowrap;
            }
            .chatbot-quick-replies button {
                background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
                border: 1px solid #e2e8f0;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 13px;
                font-family: inherit;
                cursor: pointer;
                white-space: nowrap;
                color: #334155;
                transition: all 0.3s;
            }
            .chatbot-quick-replies button:hover {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border-color: #10b981;
            }
            .chatbot-input-wrapper {
                padding: 15px;
                background: white;
                border-top: 1px solid #e2e8f0;
                display: flex;
                gap: 10px;
                align-items: center;
            }
            #chatbot-input {
                flex: 1;
                padding: 12px 15px;
                border: 2px solid #e2e8f0;
                border-radius: 25px;
                font-family: inherit;
                font-size: 14px;
                outline: none;
            }
            #chatbot-input:focus { border-color: #10b981; }
            .chatbot-send {
                width: 42px; height: 42px;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .chatbot-send:disabled { opacity: 0.5; cursor: not-allowed; }
            .chatbot-footer {
                padding: 10px;
                background: linear-gradient(90deg, #10b981, #059669);
                text-align: center;
                font-size: 11px;
                color: white;
                font-weight: 500;
            }
            @media (max-width: 480px) {
                #chatbot-wrapper { right: 20px; bottom: 20px; }
                #chatbot-window {
                    width: calc(100vw - 30px);
                    height: 75vh;
                    right: -80px;
                    bottom: 75px;
                }
            }
        </style>
    `;

    function initChatbot() {
        document.head.insertAdjacentHTML('beforeend', chatbotCSS);
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
        
        setTimeout(() => {
            addBotMessage('হ্যালো! 👋 আমি স্মার্ট সহায়ক!\n\nআমাকে যেকোনো ভাষায় প্রশ্ন করতে পারেন (বাংলা/English/Hindi)। ⚡ Ultra Fast AI দিয়ে instant reply দিব! 🤖');
        }, 1500);
    }

    window.toggleChatbot = function() {
        const window_el = document.getElementById('chatbot-window');
        const iconOpen = document.getElementById('chat-icon-open');
        const iconClose = document.getElementById('chat-icon-close');
        
        window_el.classList.toggle('open');
        
        if (window_el.classList.contains('open')) {
            iconOpen.style.display = 'none';
            iconClose.style.display = 'block';
            document.getElementById('chatbot-input').focus();
        } else {
            iconOpen.style.display = 'block';
            iconClose.style.display = 'none';
        }
    };

    function addMessage(text, sender) {
        const messagesDiv = document.getElementById('chatbot-messages');
        const time = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ' + sender;
        
        const avatar = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div>
                <div class="message-bubble">${text}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function addBotMessage(text) {
        const messagesDiv = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
        messagesDiv.appendChild(typingDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        setTimeout(() => {
            typingDiv.remove();
            addMessage(text, 'bot');
        }, 500);
    }

    function showTyping() {
        const messagesDiv = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'live-typing';
        typingDiv.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
        messagesDiv.appendChild(typingDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function hideTyping() {
        const el = document.getElementById('live-typing');
        if (el) el.remove();
    }

    // ===== CALL GROQ AI =====
    async function getAIResponse(userMessage) {
        try {
            // Build messages
            const messages = [
                { role: 'system', content: BOT_CONTEXT }
            ];

            // Add history
            chatHistory.forEach(msg => messages.push(msg));

            // Add current message
            messages.push({ role: 'user', content: userMessage });

            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            const data = await response.json();
            
            if (data.choices && data.choices[0]) {
                const reply = data.choices[0].message.content;
                
                // Save to history
                chatHistory.push({ role: 'user', content: userMessage });
                chatHistory.push({ role: 'assistant', content: reply });
                
                if (chatHistory.length > 10) {
                    chatHistory = chatHistory.slice(-10);
                }
                
                return reply;
            } else if (data.error) {
                console.error('Groq Error:', data.error);
                return '⚠️ একটু সমস্যা হচ্ছে। আবার চেষ্টা করুন অথবা কল করুন: ০১৯৩২২১১১২৩';
            } else {
                return '😅 বুঝতে পারিনি। আবার বলুন প্লিজ!';
            }
        } catch (error) {
            console.error('Error:', error);
            return '❌ ইন্টারনেট সমস্যা। একটু পর চেষ্টা করুন।';
        }
    }

    window.sendMessage = async function() {
        const input = document.getElementById('chatbot-input');
        const sendBtn = document.getElementById('sendBtn');
        const message = input.value.trim();
        
        if (!message) return;
        
        addMessage(message, 'user');
        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;
        
        showTyping();
        
        try {
            const response = await getAIResponse(message);
            hideTyping();
            addMessage(response, 'bot');
        } catch (error) {
            hideTyping();
            addMessage('❌ সমস্যা হয়েছে।', 'bot');
        }
        
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    };

    window.sendQuickReply = function(text) {
        document.getElementById('chatbot-input').value = text;
        sendMessage();
    };

    window.handleKeyPress = function(event) {
        if (event.key === 'Enter') sendMessage();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
})();
