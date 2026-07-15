// ===== DARK MODE + PWA MANAGER =====

(function() {
    'use strict';

    // ===== INSTALL PWA BUTTON =====
    let deferredPrompt = null;
    
    // ===== CSS =====
    const themeCSS = `
        <style id="theme-styles">
            /* Dark Mode Variables */
            body.dark-mode {
                --primary: #10b981;
                --primary-dark: #059669;
                --dark: #f1f5f9;
                --dark-2: #e2e8f0;
                --white: #0f172a;
                --gray-50: #1e293b;
                --gray-100: #334155;
                --gray-200: #475569;
                --gray-300: #64748b;
                --gray-500: #94a3b8;
                --gray-700: #cbd5e1;
            }

            body.dark-mode {
                background: #0f172a !important;
                color: #f1f5f9 !important;
            }

            body.dark-mode .navbar,
            body.dark-mode .product-card,
            body.dark-mode .category-card,
            body.dark-mode .feature-card,
            body.dark-mode .checkout-form-card,
            body.dark-mode .order-summary,
            body.dark-mode .contact-info,
            body.dark-mode .contact-form,
            body.dark-mode .section,
            body.dark-mode .wishlist-card,
            body.dark-mode .stat-card {
                background: #1e293b !important;
                color: #f1f5f9 !important;
                border-color: #334155 !important;
            }

            body.dark-mode .product-title,
            body.dark-mode .card-title,
            body.dark-mode .section-title,
            body.dark-mode .logo-text h1,
            body.dark-mode h1,
            body.dark-mode h2,
            body.dark-mode h3,
            body.dark-mode h4 {
                color: #f1f5f9 !important;
            }

            body.dark-mode .icon-btn,
            body.dark-mode .form-group input,
            body.dark-mode .form-group select,
            body.dark-mode .form-group textarea,
            body.dark-mode .search-box input {
                background: #334155 !important;
                color: #f1f5f9 !important;
                border-color: #475569 !important;
            }

            body.dark-mode .products-section,
            body.dark-mode .features,
            body.dark-mode .categories,
            body.dark-mode .main-container {
                background: #0f172a !important;
            }

            body.dark-mode footer {
                background: #020617 !important;
            }

            /* THEME TOGGLE BUTTON */
            #theme-toggle {
                position: fixed;
                bottom: 100px;
                right: 25px;
                width: 55px;
                height: 55px;
                background: linear-gradient(135deg, #1e293b, #0f172a);
                color: #fbbf24;
                border: 2px solid #fbbf24;
                border-radius: 50%;
                cursor: pointer;
                font-size: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                z-index: 9997;
                transition: all 0.3s;
            }

            body.dark-mode #theme-toggle {
                background: linear-gradient(135deg, #fbbf24, #f59e0b);
                color: #1e293b;
                border-color: #fbbf24;
            }

            #theme-toggle:hover {
                transform: rotate(20deg) scale(1.1);
            }

            /* INSTALL APP BUTTON */
            #install-app-btn {
                position: fixed;
                bottom: 25px;
                left: 25px;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                cursor: pointer;
                font-family: 'Hind Siliguri', sans-serif;
                font-weight: 600;
                font-size: 14px;
                box-shadow: 0 5px 20px rgba(16, 185, 129, 0.4);
                z-index: 9997;
                display: none;
                align-items: center;
                gap: 8px;
                animation: slideInLeft 0.5s;
            }

            @keyframes slideInLeft {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            #install-app-btn.show {
                display: flex;
            }

            #install-app-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 30px rgba(16, 185, 129, 0.5);
            }

            /* INSTALL BANNER (Top) */
            #install-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 12px 20px;
                display: none;
                align-items: center;
                justify-content: space-between;
                gap: 15px;
                z-index: 10001;
                box-shadow: 0 3px 15px rgba(0,0,0,0.2);
                font-family: 'Hind Siliguri', sans-serif;
            }

            #install-banner.show {
                display: flex;
            }

            .install-banner-info {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }

            .install-banner-icon {
                width: 40px;
                height: 40px;
                background: rgba(255,255,255,0.2);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                flex-shrink: 0;
            }

            .install-banner-text {
                flex: 1;
                min-width: 0;
            }

            .install-banner-text h4 {
                font-size: 14px;
                margin: 0;
                font-weight: 700;
            }

            .install-banner-text p {
                font-size: 12px;
                margin: 2px 0 0;
                opacity: 0.9;
            }

            .install-banner-actions {
                display: flex;
                gap: 8px;
                flex-shrink: 0;
            }

            .install-banner-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-family: inherit;
                font-weight: 600;
                font-size: 13px;
            }

            .install-btn-yes {
                background: white;
                color: #10b981;
            }

            .install-btn-no {
                background: rgba(255,255,255,0.2);
                color: white;
            }

            @media (max-width: 480px) {
                #theme-toggle {
                    bottom: 85px;
                    right: 15px;
                    width: 45px;
                    height: 45px;
                    font-size: 18px;
                }

                #install-app-btn {
                    bottom: 15px;
                    left: 15px;
                    padding: 10px 15px;
                    font-size: 13px;
                }

                #install-banner {
                    padding: 10px 15px;
                }

                .install-banner-text h4 { font-size: 13px; }
                .install-banner-text p { font-size: 11px; }
                .install-banner-btn { padding: 7px 12px; font-size: 12px; }
            }
        </style>
    `;

    // ===== INIT =====
    function init() {
        // Add CSS
        document.head.insertAdjacentHTML('beforeend', themeCSS);
        
        // Add PWA manifest link
        addManifestLink();
        
        // Add theme toggle button
        addThemeToggle();
        
        // Add install button
        addInstallButton();
        
        // Add install banner
        addInstallBanner();
        
        // Load saved theme
        loadTheme();
        
        // Register service worker
        registerServiceWorker();
        
        // Listen for install prompt
        listenForInstall();
    }

    // ===== MANIFEST LINK =====
    function addManifestLink() {
        if (!document.querySelector('link[rel="manifest"]')) {
            const link = document.createElement('link');
            link.rel = 'manifest';
            link.href = 'manifest.json';
            document.head.appendChild(link);
        }
        
        // Add theme color
        if (!document.querySelector('meta[name="theme-color"]')) {
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.content = '#10b981';
            document.head.appendChild(meta);
        }
        
        // Apple touch icon
        if (!document.querySelector('link[rel="apple-touch-icon"]')) {
            const link = document.createElement('link');
            link.rel = 'apple-touch-icon';
            link.href = 'https://cdn-icons-png.flaticon.com/512/891/891462.png';
            document.head.appendChild(link);
        }
    }

    // ===== THEME TOGGLE =====
    function addThemeToggle() {
        const btn = document.createElement('button');
        btn.id = 'theme-toggle';
        btn.title = 'ডার্ক মোড টগল';
        btn.innerHTML = '<i class="fas fa-moon"></i>';
        btn.onclick = toggleTheme;
        document.body.appendChild(btn);
    }

    window.toggleTheme = function() {
        const isDark = document.body.classList.toggle('dark-mode');
        const btn = document.getElementById('theme-toggle');
        
        if (isDark) {
            btn.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            btn.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    };

    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            const btn = document.getElementById('theme-toggle');
            if (btn) btn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    // ===== INSTALL BUTTON =====
    function addInstallButton() {
        const btn = document.createElement('button');
        btn.id = 'install-app-btn';
        btn.innerHTML = '<i class="fas fa-download"></i> অ্যাপ ইনস্টল করুন';
        btn.onclick = installApp;
        document.body.appendChild(btn);
    }

    // ===== INSTALL BANNER =====
    function addInstallBanner() {
        // Check if already dismissed
        if (localStorage.getItem('installBannerDismissed') === 'true') return;
        
        const banner = document.createElement('div');
        banner.id = 'install-banner';
        banner.innerHTML = `
            <div class="install-banner-info">
                <div class="install-banner-icon">
                    <i class="fas fa-mobile-alt"></i>
                </div>
                <div class="install-banner-text">
                    <h4>📱 আমাদের অ্যাপ ইনস্টল করুন!</h4>
                    <p>দ্রুত অ্যাক্সেস, offline সাপোর্ট এবং আরও অনেক কিছু</p>
                </div>
            </div>
            <div class="install-banner-actions">
                <button class="install-banner-btn install-btn-yes" onclick="installApp()">
                    <i class="fas fa-download"></i> ইনস্টল
                </button>
                <button class="install-banner-btn install-btn-no" onclick="dismissBanner()">
                    ✕
                </button>
            </div>
        `;
        document.body.appendChild(banner);
    }

    window.dismissBanner = function() {
        document.getElementById('install-banner').classList.remove('show');
        localStorage.setItem('installBannerDismissed', 'true');
    };

    window.installApp = async function() {
        if (!deferredPrompt) {
            showInstallInstructions();
            return;
        }
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted install');
        }
        
        deferredPrompt = null;
        document.getElementById('install-app-btn').classList.remove('show');
        document.getElementById('install-banner').classList.remove('show');
    };

    function showInstallInstructions() {
        alert('📱 অ্যাপ ইনস্টল করতে:\n\n' +
              '📱 Android: Menu (⋮) → "Add to Home Screen"\n' +
              '🍎 iPhone: Share (⬆️) → "Add to Home Screen"\n' +
              '💻 Desktop: Address bar এ install icon (⊕) ক্লিক করুন');
    }

    // ===== LISTEN FOR INSTALL =====
    function listenForInstall() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button
            const btn = document.getElementById('install-app-btn');
            if (btn) btn.classList.add('show');
            
            // Show banner after 3 seconds
            setTimeout(() => {
                const banner = document.getElementById('install-banner');
                if (banner && localStorage.getItem('installBannerDismissed') !== 'true') {
                    banner.classList.add('show');
                }
            }, 3000);
        });

        window.addEventListener('appinstalled', () => {
            console.log('App installed!');
            deferredPrompt = null;
            
            const btn = document.getElementById('install-app-btn');
            if (btn) btn.classList.remove('show');
            
            const banner = document.getElementById('install-banner');
            if (banner) banner.classList.remove('show');
        });
    }

    // ===== SERVICE WORKER =====
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('service-worker.js')
                    .then(reg => console.log('SW registered:', reg))
                    .catch(err => console.log('SW registration failed:', err));
            });
        }
    }

    // ===== START =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
