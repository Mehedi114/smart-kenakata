// ===== AI CHATBOT WITH GEMINI AI =====
// Real AI-powered Bengali E-commerce Chatbot

(function() {
    'use strict';

    // ⚠️ এখানে আপনার Gemini API Key বসান
    const GEMINI_API_KEY = 'AQ.Ab8RN6JeK4f8K293umKBNdXJHMeUfxddPu33yUYmSTLqszsUaQ';
    
    // Gemini API URL
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    // ===== BOT CONTEXT (আপনার সাইটের information) =====
    const BOT_CONTEXT = `তুমি "স্মার্ট কেনাকাটা" নামে একটি বাংলাদেশী অনলাইন শপিং প্ল্যাটফর্মের AI সহায়ক। তোমার নাম "স্মার্ট সহায়ক"।

গুরুত্বপূর্ণ তথ্য:
- ওয়েবসাইট: স্মার্ট কেনাকাটা (Smart Kenakata)
- ভাষা: বাংলা প্রাধান্য, তবে ইংরেজি/হিন্দি সব ভাষায় reply দিতে পারো
- ধরন: Multi-vendor Reseller E-commerce
- ক্যাটাগরি: ইলেকট্রনিক্স, ফ্যাশন, বিউটি, হোম ও লিভিং, খেলনা, বই, গ্রোসারি
- ডেলিভারি: ঢাকায় ২৪ ঘণ্টা (৳৬০), ঢাকার বাইরে ৩-৫ দিন (৳১২০)
- ৫০০৳+ অর্ডারে ফ্রি ডেলিভারি
- পেমেন্ট: বিকাশ, নগদ, রকেট, ক্যাশ অন ডেলিভারি
- ফোন: ০১৯৩২২১১১২৩
- ইমেইল: info@smartkenakata.com
- ঠিকানা: মিরপুর-১০, ঢাকা
- সময়: সকাল ৯টা - রাত ১১টা
- রিটার্ন পলিসি: ৭ দিন

নিয়ম:
1. Friendly এবং helpful ভাবে reply দাও
2. Emoji ব্যবহার করো
3. Reply সংক্ষিপ্ত রাখো (৩-৫ লাইন)
4. যদি product সম্পর্কে জিজ্ঞেস করে, homepage visit করতে বলো
5. যদি order status জিজ্ঞেস করে, WhatsApp এ যোগাযোগ করতে বলো
6. Bengali তে reply দাও যদি user Bengali তে লেখে
7. English এ reply দাও যদি user English এ লেখে
8. কখনো "আমি AI" বলবে না - "স্মার্ট সহায়ক" বলবে
9. যদি অপ্রাসঙ্গিক প্রশ্ন হয়, ভদ্রভাবে shopping related কথা বলতে বলো`;

    let chatHistory = [];

    // ===== CREATE CHATBOT HTML =====
    const chatbotHTML = `
        <div id="chatbot-wrapper">
            <button id="chatbot-toggle" onclick="toggleChatbot()">
                <i class="fas fa-comments" id="chat-icon-open"></i>
                <i class="fas fa-times" id="chat-icon-close" style="display:none;"></i>
                <span class="chatbot-badge" id="chatbot-badge">
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
                            <span class="status-dot"></span> Powered by Gemini AI
                        </span>
                    </div>
                    <button class="chatbot-close" onclick="toggleChatbot()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="chatbot-messages" id="chatbot-messages"></div>

                <div class="chatbot-quick-replies" id="quickReplies">
                    <button onclick="sendQuickReply('হ্যালো, তুমি কে?')">👋 হ্যালো</button>
                    <button onclick="sendQuickReply('তোমাদের পণ্য কী কী আছে?')">🛍️ পণ্য</button>
                    <button onclick="sendQuickReply('ডেলিভারি চার্জ কত?')">🚚 ডেলিভারি</button>
                    <button onclick="sendQuickReply('পেমেন্ট কীভাবে করব?')">💳 পেমেন্ট</button>
                    <button onclick="sendQuickReply('কোন অফার আছে?')">🎁 অফার</button>
                </div>

                <div class="chatbot-input-wrapper">
                    <input type="text" id="chatbot-input" placeholder="আপনার প্রশ্ন লিখুন (যেকোনো ভাষায়)..." onkeypress="handleKeyPress(event)">
                    <button onclick="sendMessage()" class="chatbot-send" id="sendBtn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>

                <div class="chatbot-footer">
                    <i class="fas fa-bolt"></i> Powered by Google Gemini AI
                </div>
            </div>
        </div>
    `;

    // ===== CSS STYLES =====
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
                0%, 100% { transform: rotate(0deg) scale(1); }
                50% { transform: rotate(180deg) scale(1.1); }
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
                position: relative;
                overflow: hidden;
            }

            .chatbot-header::before {
                content: '';
                position: absolute;
                top: -50%;
                right: -20%;
                width: 200px;
                height: 200px;
                background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
                border-radius: 50%;
            }

            .chatbot-avatar {
                width: 45px; height: 45px;
                background: rgba(255, 255, 255, 0.25);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 22px;
                position: relative;
            }

            .chatbot-info { flex: 1; position: relative; }
            .chatbot-info h3 {
                font-size: 17px;
                font-weight: 700;
                margin: 0;
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
                letter-spacing: 1px;
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
                position: relative;
            }

            .chatbot-close:hover { background: rgba(255, 255, 255, 0.3); }

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
                font-weight: 500;
            }

            .chatbot-quick-replies button:hover {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border-color: #10b981;
                transform: translateY(-2px);
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
                transition: border-color 0.3s;
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
                transition: all 0.3s;
            }

            .chatbot-send:hover:not(:disabled) { transform: scale(1.1); }
            .chatbot-send:disabled { opacity: 0.5; cursor: not-allowed; }

            .chatbot-footer {
                padding: 10px;
                background: linear-gradient(90deg, #10b981, #059669);
                text-align: center;
                font-size: 11px;
                color: white;
                font-weight: 500;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
            }

            .chatbot-messages::-webkit-scrollbar,
            .chatbot-quick-replies::-webkit-scrollbar {
                height: 6px; width: 6px;
            }

            .chatbot-messages::-webkit-scrollbar-thumb,
            .chatbot-quick-replies::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 10px;
            }

            @media (max-width: 480px) {
                #chatbot-wrapper { right: 20px; bottom: 20px; }
                #chatbot-window {
                    width: calc(100vw - 30px);
                    height: 75vh;
                    right: -80px;
                    bottom: 75px;
                }
                #chatbot-toggle {
                    width: 55px; height: 55px;
                    font-size: 22px;
                }
            }
        </style>
    `;

    // ===== INITIALIZE =====
    function initChatbot() {
        document.head.insertAdjacentHTML('beforeend', chatbotCSS);
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
        
        // Welcome message
        setTimeout(() => {
            addBotMessage('হ্যালো! 👋 আমি স্মার্ট সহায়ক, স্মার্ট কেনাকাটার AI সহায়ক!\n\nআমাকে যেকোনো ভাষায় (বাংলা/English/Hindi) প্রশ্ন করতে পারেন। আমি সব কিছুতে সাহায্য করব! 🤖✨');
        }, 1500);
    }

    // ===== TOGGLE =====
    window.toggleChatbot = function() {
        const window_el = document.getElementById('chatbot-window');
        const iconOpen = document.getElementById('chat-icon-open');
        const iconClose = document.getElementById('chat-icon-close');
        const badge = document.getElementById('chatbot-badge');
        
        window_el.classList.toggle('open');
        
        if (window_el.classList.contains('open')) {
            iconOpen.style.display = 'none';
            iconClose.style.display = 'block';
            badge.style.display = 'none';
            document.getElementById('chatbot-input').focus();
        } else {
            iconOpen.style.display = 'block';
            iconClose.style.display = 'none';
        }
    };

    // ===== ADD MESSAGE =====
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
        }, 800);
    }

    // ===== SHOW TYPING =====
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

    // ===== CALL GEMINI AI =====
    async function getAIResponse(userMessage) {
        try {
            // Build conversation history
            const contents = [
                {
                    role: 'user',
                    parts: [{ text: BOT_CONTEXT }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'বুঝেছি! আমি স্মার্ট সহায়ক হিসেবে গ্রাহকদের সাহায্য করব।' }]
                }
            ];

            // Add previous conversation
            chatHistory.forEach(msg => {
                contents.push({
                    role: msg.role,
                    parts: [{ text: msg.text }]
                });
            });

            // Add current message
            contents.push({
                role: 'user',
                parts: [{ text: userMessage }]
            });

            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: contents,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 500
                    }
                })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0]) {
                const reply = data.candidates[0].content.parts[0].text;
                
                // Save to history
                chatHistory.push({ role: 'user', text: userMessage });
                chatHistory.push({ role: 'model', text: reply });
                
                // Keep only last 10 messages
                if (chatHistory.length > 10) {
                    chatHistory = chatHistory.slice(-10);
                }
                
                return reply;
            } else if (data.error) {
                console.error('Gemini API Error:', data.error);
                return '⚠️ দুঃখিত, একটু সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন অথবা সরাসরি কল করুন: ০১৯৩২২১১১২৩';
            } else {
                return '😅 বুঝতে পারিনি। আবার বলুন প্লিজ!';
            }
        } catch (error) {
            console.error('Error:', error);
            return '❌ ইন্টারনেট সমস্যা মনে হচ্ছে। একটু পর আবার চেষ্টা করুন।';
        }
    }

    // ===== SEND MESSAGE =====
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
            addMessage('❌ সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'bot');
        }
        
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    };

    // ===== QUICK REPLY =====
    window.sendQuickReply = function(text) {
        document.getElementById('chatbot-input').value = text;
        sendMessage();
    };

    // ===== KEY PRESS =====
    window.handleKeyPress = function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
})();
