// ===== AI CHATBOT FOR SMART KENAKATA =====
// Bengali E-commerce Chatbot

(function() {
    'use strict';

    // ===== BOT KNOWLEDGE BASE =====
    const botResponses = {
        // Greetings
        greeting: [
            'হ্যালো! 👋 স্মার্ট কেনাকাটায় স্বাগতম!',
            'আসসালামু আলাইকুম! 🙏 কীভাবে সাহায্য করতে পারি?',
            'হাই! 😊 আমি আপনাকে কীভাবে সাহায্য করতে পারি?'
        ],
        
        // Product related
        products: 'আমাদের কাছে আছে:\n📱 ইলেকট্রনিক্স\n👕 ফ্যাশন\n💄 বিউটি\n🏠 হোম ও লিভিং\n🧸 খেলনা\n📚 বই\n🛒 গ্রোসারি\n\nকোনটা দেখতে চান?',
        
        // Delivery
        delivery: '🚚 ডেলিভারি তথ্য:\n\n📍 ঢাকার ভিতরে: ২৪ ঘণ্টা (৳৬০)\n📍 ঢাকার বাইরে: ৩-৫ দিন (৳১২০)\n\n✨ ৫০০৳+ অর্ডারে ফ্রি ডেলিভারি!',
        
        // Payment
        payment: '💳 পেমেন্ট মেথড:\n\n💵 ক্যাশ অন ডেলিভারি\n📱 বিকাশ\n📱 নগদ\n🚀 রকেট\n\nসবগুলো সহজ এবং নিরাপদ!',
        
        // Order process
        howToOrder: '🛍️ অর্ডার করা খুব সহজ:\n\n1️⃣ পণ্য সিলেক্ট করুন\n2️⃣ "কার্টে যোগ করুন" ক্লিক করুন\n3️⃣ কার্ট থেকে চেকআউটে যান\n4️⃣ ঠিকানা ও পেমেন্ট দিন\n5️⃣ অর্ডার কনফার্ম!\n\nএখনই শুরু করুন 🚀',
        
        // Return policy
        returnPolicy: '↩️ রিটার্ন পলিসি:\n\n✅ ৭ দিনের মধ্যে রিটার্ন\n✅ প্যাকেজিং অক্ষত থাকতে হবে\n✅ ১০০% রিফান্ড গ্যারান্টি\n✅ দ্রুত রিফান্ড প্রসেস\n\nকোন সমস্যা? কল করুন: ০১৯৩২২১১১২৩',
        
        // Contact
        contact: '📞 যোগাযোগ:\n\n☎️ ফোন: ০১৯৩২২১১১২৩\n💬 WhatsApp: ০১৯৩২২১১১২৩\n📧 ইমেইল: info@smartkenakata.com\n📍 ঠিকানা: মিরপুর-১০, ঢাকা\n\n⏰ সময়: সকাল ৯টা - রাত ১১টা',
        
        // Discount
        discount: '🎁 ছাড় ও অফার:\n\n🔥 নতুন গ্রাহকদের ২০% ছাড়\n💰 ৫০০৳+ অর্ডারে ফ্রি ডেলিভারি\n🎯 প্রতিদিন বিশেষ অফার\n💎 প্রিমিয়াম পণ্যে বিশেষ ছাড়\n\nএখনই কেনাকাটা করুন!',
        
        // About
        about: '🏢 স্মার্ট কেনাকাটা:\n\nবাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম। ১০,০০০+ সন্তুষ্ট গ্রাহক আমাদের সাথে আছেন।\n\n✨ সেরা দাম, সেরা মান!',
        
        // Thanks
        thanks: [
            'আপনাকে ধন্যবাদ! 🙏 আরও কিছু জানতে চান?',
            'স্বাগতম! 😊 আরও কোন সাহায্য দরকার?',
            'ধন্যবাদ! ❤️ আপনার শপিং শুভ হোক!'
        ],
        
        // Bye
        bye: [
            'বিদায়! 👋 আবার আসবেন!',
            'আল্লাহ হাফেজ! 🙏 আবার দেখা হবে!',
            'ধন্যবাদ! 😊 শুভ কেনাকাটা!'
        ],
        
        // Default (unknown)
        default: 'দুঃখিত, আমি ঠিক বুঝতে পারিনি। 😅\n\nআপনি এগুলো জিজ্ঞেস করতে পারেন:\n• পণ্য সম্পর্কে\n• ডেলিভারি\n• পেমেন্ট\n• অর্ডার করার উপায়\n• রিটার্ন পলিসি\n• যোগাযোগ\n\nঅথবা সরাসরি কল করুন: ০১৯৩২২১১১২৩'
    };

    // ===== KEYWORDS =====
    const keywords = {
        greeting: ['হ্যালো', 'hi', 'hello', 'hey', 'আসসালামু', 'সালাম', 'হাই', 'hey there', 'স্বাগত'],
        products: ['পণ্য', 'product', 'কি আছে', 'কী আছে', 'ক্যাটাগরি', 'category', 'জিনিস', 'items', 'ইলেকট্রনিক্স', 'ফ্যাশন', 'বিউটি'],
        delivery: ['ডেলিভারি', 'delivery', 'কতদিন', 'কত দিন', 'পাঠাবে', 'পৌঁছাবে', 'শিপিং', 'shipping', 'ঢাকা'],
        payment: ['পেমেন্ট', 'payment', 'বিকাশ', 'নগদ', 'রকেট', 'cash', 'টাকা', 'দাম দিব', 'কিভাবে দিব'],
        howToOrder: ['অর্ডার', 'order', 'কিনব', 'কিভাবে', 'কীভাবে', 'কিনতে', 'কেনার'],
        returnPolicy: ['রিটার্ন', 'return', 'ফেরত', 'রিফান্ড', 'refund', 'পাল্টানো', 'exchange'],
        contact: ['যোগাযোগ', 'contact', 'ফোন', 'phone', 'নম্বর', 'number', 'কল', 'call', 'ইমেইল', 'email', 'address', 'ঠিকানা'],
        discount: ['ছাড়', 'discount', 'অফার', 'offer', 'কুপন', 'coupon', 'সেল', 'sale', 'কমে'],
        about: ['আপনারা কারা', 'কারা', 'about', 'সম্পর্কে', 'কোম্পানি', 'company'],
        thanks: ['ধন্যবাদ', 'thanks', 'thank you', 'thx', 'ধইন্যা'],
        bye: ['বিদায়', 'bye', 'goodbye', 'আল্লাহ হাফেজ', 'হাফেজ', 'চলি', 'পরে কথা']
    };

    // ===== GET BOT RESPONSE =====
    function getBotResponse(userMessage) {
        const msg = userMessage.toLowerCase().trim();
        
        // Check for keywords
        for (const [category, words] of Object.entries(keywords)) {
            for (const word of words) {
                if (msg.includes(word.toLowerCase())) {
                    const response = botResponses[category];
                    if (Array.isArray(response)) {
                        return response[Math.floor(Math.random() * response.length)];
                    }
                    return response;
                }
            }
        }
        
        return botResponses.default;
    }

    // ===== CREATE CHATBOT HTML =====
    const chatbotHTML = `
        <div id="chatbot-wrapper">
            <!-- Chat Button -->
            <button id="chatbot-toggle" onclick="toggleChatbot()">
                <i class="fas fa-comments" id="chat-icon-open"></i>
                <i class="fas fa-times" id="chat-icon-close" style="display:none;"></i>
                <span class="chatbot-badge" id="chatbot-badge">1</span>
            </button>

            <!-- Chat Window -->
            <div id="chatbot-window">
                <!-- Header -->
                <div class="chatbot-header">
                    <div class="chatbot-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="chatbot-info">
                        <h3>স্মার্ট সহায়ক 🤖</h3>
                        <span class="chatbot-status">
                            <span class="status-dot"></span> অনলাইন এখনই
                        </span>
                    </div>
                    <button class="chatbot-close" onclick="toggleChatbot()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Messages -->
                <div class="chatbot-messages" id="chatbot-messages">
                    <!-- Messages will appear here -->
                </div>

                <!-- Quick Replies -->
                <div class="chatbot-quick-replies" id="quickReplies">
                    <button onclick="sendQuickReply('পণ্য দেখান')">🛍️ পণ্য দেখান</button>
                    <button onclick="sendQuickReply('ডেলিভারি চার্জ কত?')">🚚 ডেলিভারি</button>
                    <button onclick="sendQuickReply('পেমেন্ট মেথড')">💳 পেমেন্ট</button>
                    <button onclick="sendQuickReply('অর্ডার কিভাবে করব?')">📦 অর্ডার</button>
                    <button onclick="sendQuickReply('যোগাযোগ')">📞 যোগাযোগ</button>
                </div>

                <!-- Input -->
                <div class="chatbot-input-wrapper">
                    <input type="text" id="chatbot-input" placeholder="আপনার প্রশ্ন লিখুন..." onkeypress="handleKeyPress(event)">
                    <button onclick="sendMessage()" class="chatbot-send">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>

                <!-- Footer -->
                <div class="chatbot-footer">
                    Powered by 🤖 AI | স্মার্ট কেনাকাটা
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
                width: 60px;
                height: 60px;
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

            #chatbot-toggle:hover {
                transform: scale(1.1);
            }

            .chatbot-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ef4444;
                color: white;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                font-size: 12px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
            }

            #chatbot-window {
                position: absolute;
                bottom: 75px;
                right: 0;
                width: 380px;
                height: 550px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                display: none;
                flex-direction: column;
                overflow: hidden;
                animation: slideUp 0.3s;
            }

            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            #chatbot-window.open {
                display: flex;
            }

            .chatbot-header {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 18px 20px;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .chatbot-avatar {
                width: 45px;
                height: 45px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 22px;
            }

            .chatbot-info {
                flex: 1;
            }

            .chatbot-info h3 {
                font-size: 17px;
                font-weight: 700;
                margin: 0;
            }

            .chatbot-status {
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 5px;
                opacity: 0.9;
            }

            .status-dot {
                width: 8px;
                height: 8px;
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
                width: 32px;
                height: 32px;
                border-radius: 50%;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s;
            }

            .chatbot-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .chatbot-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: #f8fafc;
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

            .message.user {
                justify-content: flex-end;
            }

            .message-avatar {
                width: 32px;
                height: 32px;
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
                padding: 10px 15px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.5;
                white-space: pre-line;
            }

            .message.bot .message-bubble {
                background: white;
                color: #0f172a;
                border-top-left-radius: 4px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
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
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            }

            .typing-indicator span {
                width: 8px;
                height: 8px;
                background: #94a3b8;
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
                background: #f1f5f9;
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
                background: #10b981;
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
                transition: border-color 0.3s;
            }

            #chatbot-input:focus {
                border-color: #10b981;
            }

            .chatbot-send {
                width: 42px;
                height: 42px;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.3s;
            }

            .chatbot-send:hover {
                transform: scale(1.1);
            }

            .chatbot-footer {
                padding: 8px;
                background: #f8fafc;
                text-align: center;
                font-size: 11px;
                color: #64748b;
                border-top: 1px solid #e2e8f0;
            }

            /* Scrollbar */
            .chatbot-messages::-webkit-scrollbar,
            .chatbot-quick-replies::-webkit-scrollbar {
                height: 6px;
                width: 6px;
            }

            .chatbot-messages::-webkit-scrollbar-track,
            .chatbot-quick-replies::-webkit-scrollbar-track {
                background: transparent;
            }

            .chatbot-messages::-webkit-scrollbar-thumb,
            .chatbot-quick-replies::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 10px;
            }

            /* Mobile Responsive */
            @media (max-width: 480px) {
                #chatbot-wrapper {
                    right: 20px;
                    bottom: 20px;
                }

                #chatbot-window {
                    width: calc(100vw - 30px);
                    height: 70vh;
                    right: -80px;
                    bottom: 75px;
                }

                #chatbot-toggle {
                    width: 55px;
                    height: 55px;
                    font-size: 22px;
                }
            }
        </style>
    `;

    // ===== INITIALIZE CHATBOT =====
    function initChatbot() {
        // Add CSS
        document.head.insertAdjacentHTML('beforeend', chatbotCSS);
        
        // Add HTML
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
        
        // Show welcome message after 2 seconds
        setTimeout(() => {
            addBotMessage(botResponses.greeting[0]);
            setTimeout(() => {
                addBotMessage('আমি আপনার প্রশ্নের উত্তর দিতে পারি! নিচের বাটন থেকে সিলেক্ট করুন অথবা টাইপ করুন 👇');
            }, 1000);
        }, 2000);
    }

    // ===== TOGGLE CHATBOT =====
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
        // Show typing indicator
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
        
        // Remove typing and show message after delay
        setTimeout(() => {
            typingDiv.remove();
            addMessage(text, 'bot');
        }, 1000);
    }

    // ===== SEND MESSAGE =====
    window.sendMessage = function() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        addMessage(message, 'user');
        input.value = '';
        
        // Get bot response
        setTimeout(() => {
            const response = getBotResponse(message);
            addBotMessage(response);
        }, 500);
    };

    // ===== QUICK REPLY =====
    window.sendQuickReply = function(text) {
        addMessage(text, 'user');
        setTimeout(() => {
            const response = getBotResponse(text);
            addBotMessage(response);
        }, 500);
    };

    // ===== KEY PRESS =====
    window.handleKeyPress = function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatbot);
    } else {
        initChatbot();
    }
})();
