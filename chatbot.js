// ===== AI CHATBOT WITH BACKUP KEYS =====
(function() {
    'use strict';
    const GROQ_API_KEYS = [
        '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',
        'gsk_2nd_KEY_HERE',
        'gsk_3rd_KEY_HERE'
    ];
    let currentKeyIndex = parseInt(localStorage.getItem('groq_key_index') || '0');
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
        const BOT_CONTEXT = `You are "Smart Assistant" for Smart Kenakata.

OWNER INFO (NEVER MAKE UP OTHER NAMES):
- Owner: Md Mahedul Islam Mehedi (মেহেদি ভাই)
- Email: mdmahedulislammehedi@gmail.com
- Phone: 01932211123
- If anyone asks "owner ke?" "tomar malik ke?" "ai shop er owner k?" ALWAYS answer: Owner is Md Mahedul Islam Mehedi. Never say Rahat, Sakib, or any other name.

WEBSITE INFO:
- Website: Smart Kenakata (স্মার্ট কেনাকাটা)
- Type: Bangladesh trusted online shop
- Categories: Electronics, Fashion, Beauty, Home & Living, Toys, Books, Grocery
- Delivery: Inside Dhaka ৳60 (24h), Outside ৳120 (3-5 days), Free delivery on ৳500+
- Payment: bKash, Nagad, Rocket, Cash on Delivery
- Address: Mirpur-10, Dhaka
- Hours: 9 AM - 11 PM
- Return: 7 days

RULES:
- Owner name is ALWAYS Mehedi, never hallucinate
- If you don't know product price, say "Website e dekhen" don't make up price
- Be friendly, short, use emojis
- Reply in user's language (Bengali/English)
- Never say "I am AI" say "I am Smart Assistant of Smart Kenakata owned by Mehedi vai"
`;
    let chatHistory = [];

    const chatbotHTML = `
        <div id="chatbot-wrapper">
            <button id="chatbot-toggle" onclick="toggleChatbot()">
                <i class="fas fa-comments" id="chat-icon-open"></i>
                <i class="fas fa-times" id="chat-icon-close" style="display:none;"></i>
                <span class="chatbot-badge"><i class="fas fa-sparkles"></i></span>
            </button>
            <div id="chatbot-window">
                <div class="chatbot-header">
                    <div class="chatbot-avatar"><i class="fas fa-robot"></i></div>
                    <div class="chatbot-info"><h3>স্মার্ট সহায়ক <span class="ai-badge">AI</span></h3><span class="chatbot-status"><span class="status-dot"></span> Online</span></div>
                    <button class="chatbot-close" onclick="toggleChatbot()"><i class="fas fa-times"></i></button>
                </div>
                <div class="chatbot-messages" id="chatbot-messages"></div>
                <div class="chatbot-quick-replies">
                    <button onclick="sendQuickReply('হ্যালো')">👋 হ্যালো</button>
                    <button onclick="sendQuickReply('পণ্য')">🛍️ পণ্য</button>
                    <button onclick="sendQuickReply('ডেলিভারি')">🚚 ডেলিভারি</button>
                </div>
                <div class="chatbot-input-wrapper">
                    <input type="text" id="chatbot-input" placeholder="প্রশ্ন লিখুন..." onkeypress="handleKeyPress(event)">
                    <button onclick="sendMessage()" class="chatbot-send"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>`;

    const chatbotCSS = `<style>
        #chatbot-wrapper{position:fixed;bottom:25px;right:100px;z-index:9998;font-family:'Hind Siliguri',sans-serif}
        #chatbot-toggle{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);color:white;border:none;cursor:pointer;font-size:26px;display:flex;align-items:center;justify-content:center;box-shadow:0 5px 20px rgba(16,185,129,0.4)}
        .chatbot-badge{position:absolute;top:-3px;right:-3px;background:#f59e0b;color:white;width:24px;height:24px;border-radius:50%;font-size:11px;display:flex;align-items:center;justify-content:center;border:2px solid white}
        #chatbot-window{position:absolute;bottom:75px;right:0;width:380px;height:520px;background:white;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.25);display:none;flex-direction:column;overflow:hidden}
        #chatbot-window.open{display:flex}
        .chatbot-header{background:linear-gradient(135deg,#10b981,#059669);color:white;padding:15px;display:flex;align-items:center;gap:10px}
        .chatbot-avatar{width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center}
        .chatbot-info{flex:1}
        .chatbot-messages{flex:1;overflow-y:auto;padding:15px;background:#f8fafc}
        .message{margin-bottom:12px;display:flex;gap:8px}
        .message.user{justify-content:flex-end}
        .message-bubble{max-width:75%;padding:10px 14px;border-radius:18px;font-size:14px}
        .message.bot .message-bubble{background:white;color:#0f172a}
        .message.user .message-bubble{background:#10b981;color:white}
        .chatbot-quick-replies{padding:10px;display:flex;gap:6px;overflow-x:auto}
        .chatbot-quick-replies button{background:#f1f5f9;border:1px solid #e2e8f0;padding:6px 12px;border-radius:20px;font-size:13px;cursor:pointer}
        .chatbot-input-wrapper{padding:12px;background:white;border-top:1px solid #e2e8f0;display:flex;gap:8px}
        #chatbot-input{flex:1;padding:10px 12px;border:2px solid #e2e8f0;border-radius:20px;outline:none}
        .chatbot-send{width:38px;height:38px;background:#10b981;color:white;border:none;border-radius:50%;cursor:pointer}
        @media(max-width:480px){#chatbot-wrapper{right:20px}#chatbot-window{width:calc(100vw - 30px);right:-80px}}
    </style>`;

    function initChatbot(){document.head.insertAdjacentHTML('beforeend',chatbotCSS);document.body.insertAdjacentHTML('beforeend',chatbotHTML);setTimeout(()=>{addBotMessage('হ্যালো! 👋 আমি স্মার্ট সহায়ক!');},1000);}
    window.toggleChatbot=function(){const w=document.getElementById('chatbot-window');const o=document.getElementById('chat-icon-open');const c=document.getElementById('chat-icon-close');w.classList.toggle('open');if(w.classList.contains('open')){o.style.display='none';c.style.display='block';}else{o.style.display='block';c.style.display='none';}};
    function addMessage(t,s){const m=document.getElementById('chatbot-messages');const d=document.createElement('div');d.className='message '+s;d.innerHTML='<div class="message-bubble">'+t+'</div>';m.appendChild(d);m.scrollTop=m.scrollHeight;}
    function addBotMessage(t){const m=document.getElementById('chatbot-messages');const d=document.createElement('div');d.className='message bot';d.innerHTML='<div class="message-bubble">'+t+'</div>';m.appendChild(d);m.scrollTop=m.scrollHeight;}

    async function getAIResponse(userMessage){
        const messages=[{role:'system',content:BOT_CONTEXT}];
        chatHistory.forEach(msg=>messages.push(msg));
        messages.push({role:'user',content:userMessage});
        for(let i=0;i<GROQ_API_KEYS.length;i++){
            const keyIndex=(currentKeyIndex+i)%GROQ_API_KEYS.length;
            const apiKey=GROQ_API_KEYS[keyIndex];
            if(apiKey.includes('KEY_HERE')) continue;
            try{
                const r=await fetch(GROQ_API_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:messages,temperature:0.7,max_tokens:400})});
                const data=await r.json();
                if(data.choices&&data.choices[0]){
                    currentKeyIndex=keyIndex;localStorage.setItem('groq_key_index',keyIndex);
                    const reply=data.choices[0].message.content;
                    chatHistory.push({role:'user',content:userMessage});chatHistory.push({role:'assistant',content:reply});
                    if(chatHistory.length>10) chatHistory=chatHistory.slice(-10);
                    return reply;
                }
            }catch(e){continue;}
        }
        return '⚠️ সব API কী তে সমস্যা। একটু পর চেষ্টা করুন।';
    }

    window.sendMessage=async function(){
        const input=document.getElementById('chatbot-input');const msg=input.value.trim();if(!msg)return;
        addMessage(msg,'user');input.value='';
        const res=await getAIResponse(msg);addMessage(res,'bot');
    };
    window.sendQuickReply=function(t){document.getElementById('chatbot-input').value=t;sendMessage();};
    window.handleKeyPress=function(e){if(e.key==='Enter')sendMessage();};
    if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',initChatbot);}else{initChatbot();}
})();
