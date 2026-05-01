function renderHeader(headerData, notification) {
    if (!headerData) return;
    const headerContainer = document.createElement('div');
    headerContainer.id = 'dynamic-header-container';
    headerContainer.innerHTML = `
        <div class="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white text-center py-2 px-4 pr-10 sm:pr-12 relative z-[60] text-sm font-medium border-b border-blue-700/50" id="top-bar-container">
            <div class="container mx-auto flex items-center justify-center">
                <span id="top-bar-content">${notification || ''}</span>
                <button onclick="document.getElementById('top-bar-container').style.display='none'" class="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors" aria-label="Close notification">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
        </div>

        <header class="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div class="container mx-auto px-4 md:px-6">
                <div class="flex h-16 items-center justify-between">
                    <a href="/" class="flex items-center gap-2">
                        <div class="bg-blue-600/10 p-2 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket text-blue-600"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
                        </div>
                        <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-700" id="logo-text">${headerData.logoText || 'DigitalGrowth24'}</span>
                    </a>

                    <nav class="hidden md:flex items-center gap-8">
                        <a href="/" class="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Home</a>
                        <a href="/portfolio" class="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Portfolio</a>
                        
                        <div class="relative group" id="nav-services">
                            <button class="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 font-medium focus:outline-none pb-4 mb-[-16px]">
                                Services <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                            </button>
                            <div class="absolute top-full mt-4 left-0 w-56 bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div class="p-2 flex flex-col gap-1">
                                    ${(headerData.categories || []).map(cat => `<a href="/services/${cat.toLowerCase().replace(/ /g, '-')}" class="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-left">${cat}</a>`).join('')}
                                    <a href="/services" class="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-left font-semibold border-t border-gray-100 mt-1">View All Services</a>
                                </div>
                            </div>
                        </div>

                        <a href="/about" class="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">About</a>
                        <a href="/team" class="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">Team</a>
                        <a href="/blog" class="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">Blog</a>
                        <a href="/contact" class="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact</a>

                        <a href="/contact" class="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">${headerData.ctaButton || 'Get Started'}</a>
                    </nav>

                    <button class="md:hidden p-2 text-gray-600 hover:text-blue-600 focus:outline-none" onclick="toggleMenu()" aria-label="Toggle menu">
                        <svg id="menu-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                        <svg id="close-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x hidden"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>
            </div>

            <div id="mobile-menu" class="hidden md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-xl max-h-[85vh] overflow-y-auto z-40">
                <div class="container mx-auto px-4 py-6 flex flex-col gap-4">
                    <a href="/" class="text-lg py-3 text-slate-700 font-medium border-b border-slate-50 hover:text-blue-600 transition-colors" onclick="toggleMenu()">Home</a>
                    <a href="/portfolio" class="text-lg py-3 text-slate-700 font-medium border-b border-slate-50 hover:text-blue-600 transition-colors" onclick="toggleMenu()">Portfolio</a>
                    
                    <div class="border-b border-slate-50 pb-2">
                        <button onclick="toggleCategory()" class="flex items-center justify-between w-full text-lg py-3 text-slate-700 font-medium hover:text-blue-600 transition-colors">
                            Services <svg id="category-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down transition-transform"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <div id="mobile-categories" class="hidden pl-4 flex-col gap-2 mt-2 bg-slate-50 rounded-lg p-3">
                            ${(headerData.categories || []).map(cat => `<a href="/services/${cat.toLowerCase().replace(/ /g, '-')}" class="py-2 text-sm text-gray-600 hover:text-blue-600" onclick="toggleMenu()">${cat}</a>`).join('')}
                        </div>
                    </div>

                    <a href="/about" class="text-lg py-3 text-slate-700 font-medium border-b border-slate-50 hover:text-blue-600 transition-colors" onclick="toggleMenu()">About</a>
                    <a href="/team" class="text-lg py-3 text-slate-700 font-medium border-b border-slate-50 hover:text-blue-600 transition-colors" onclick="toggleMenu()">Team</a>
                    <a href="/blog" class="text-lg py-3 text-slate-700 font-medium border-b border-slate-50 hover:text-blue-600 transition-colors" onclick="toggleMenu()">Blog</a>
                    <a href="/contact" class="text-lg py-3 text-slate-700 font-medium border-b border-slate-50 hover:text-blue-600 transition-colors" onclick="toggleMenu()">Contact</a>
                    
                    <div class="pt-4">
                        <a href="/contact" class="block w-full bg-blue-600 text-white text-center px-6 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95">${headerData.ctaButton || 'Get Started'}</a>
                    </div>
                </div>
            </div>
        </header>
    `;
    
    // Only inject if not already present
    if (!document.getElementById('dynamic-header-container')) {
        document.body.insertBefore(headerContainer, document.body.firstChild);
    }
}

function renderFooter(footerData, socialData) {
    if (!footerData) return;
    const footerContainer = document.createElement('div');
    footerContainer.id = 'dynamic-footer-container';
    
    const whatsappLink = socialData?.whatsapp ? `https://wa.me/${socialData.whatsapp.replace(/\+/g, '')}` : '#';
    
    footerContainer.innerHTML = `
        <footer class="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
            <div class="container mx-auto px-4 md:px-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <div class="space-y-4">
                        <a href="/" class="flex items-center gap-2 mb-4">
                            <div class="bg-blue-600 p-2 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket text-white"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
                            </div>
                            <span class="text-xl font-bold" id="footer-logo">DigitalGrowth24</span>
                        </a>
                        <p class="text-slate-400 text-sm leading-relaxed" id="footer-desc">${footerData.description || ''}</p>
                        <div class="flex gap-4 pt-2">
                            <a href="${socialData?.facebook || '#'}" target="_blank" class="bg-white/10 p-2 rounded-full hover:bg-blue-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                            </a>
                            <a href="${socialData?.linkedin || '#'}" target="_blank" class="bg-white/10 p-2 rounded-full hover:bg-blue-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                            </a>
                            <a href="${socialData?.twitter || '#'}" target="_blank" class="bg-white/10 p-2 rounded-full hover:bg-blue-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold mb-6 text-white">Quick Links</h3>
                        <ul class="space-y-3 text-slate-400 text-sm">
                            <li><a href="/portfolio" class="hover:text-blue-400 transition-colors">Our Portfolio</a></li>
                            <li><a href="/about" class="hover:text-blue-400 transition-colors">About Us</a></li>
                            <li><a href="/team" class="hover:text-blue-400 transition-colors">Our Team</a></li>
                            <li><a href="/contact" class="hover:text-blue-400 transition-colors">Contact</a></li>
                            <li><a href="/blog" class="hover:text-blue-400 transition-colors">Insights</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold mb-6 text-white">Legal</h3>
                        <ul class="space-y-3 text-slate-400 text-sm">
                            <li><a href="/privacy" class="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                            <li><a href="/terms" class="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                            <li><a href="/cookies" class="hover:text-blue-400 transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold mb-6 text-white">Newsletter</h3>
                        <p class="text-slate-400 text-sm mb-4">Subscribe to get latest updates and offers.</p>
                        <form id="newsletter-form" class="space-y-2">
                            <input type="email" placeholder="Your email address" required class="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm transition-colors">Subscribe</button>
                        </form>
                    </div>
                </div>
                <div class="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p class="text-slate-500 text-sm">&copy; ${new Date().getFullYear()} ${footerData.copyright || ''}</p>
                </div>
            </div>
        </footer>
        
        <!-- WhatsApp Widget -->
        <div class="fixed bottom-6 right-6 z-50 group">
            <a href="${whatsappLink}" target="_blank" class="flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110 relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
        </div>
    `;
    
    if (!document.getElementById('dynamic-footer-container')) {
        document.body.appendChild(footerContainer);
    }
}

// Global Exit Intent Logic
let exitIntentShown = false;

function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        menuIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
    } else {
        menu.classList.add('hidden');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
    }
}

function toggleCategory() {
    const mobileCategories = document.getElementById('mobile-categories');
    const chevron = document.getElementById('category-chevron');
    
    if (mobileCategories.classList.contains('hidden')) {
        mobileCategories.classList.remove('hidden');
        mobileCategories.classList.add('flex');
        chevron.classList.add('rotate-180');
    } else {
        mobileCategories.classList.add('hidden');
        mobileCategories.classList.remove('flex');
        chevron.classList.remove('rotate-180');
    }
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'true');
    const banner = document.getElementById('cookie-banner');
    if(banner) banner.style.display = 'none';
}

// Make global
window.toggleMenu = toggleMenu;
window.toggleCategory = toggleCategory;
window.acceptCookies = acceptCookies;

function showExitPopup() {
    if (exitIntentShown || localStorage.getItem('exitPopupShown')) return;
    
    const popup = document.getElementById('exit-popup');
    const content = document.getElementById('exit-popup-content');
    if (!popup || !content) return;
    
    popup.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('translate-y-full', 'sm:translate-y-10', 'sm:scale-95', 'opacity-0');
        content.classList.add('translate-y-0', 'sm:translate-y-[-50%]', 'sm:scale-100', 'opacity-100');
    }, 10);
    
    exitIntentShown = true;
    localStorage.setItem('exitPopupShown', 'true');
}

function closeExitPopup() {
    const popup = document.getElementById('exit-popup');
    const content = document.getElementById('exit-popup-content');
    if (!popup || !content) return;
    
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        popup.classList.add('hidden');
    }, 300);
}

document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 0) showExitPopup();
});

// Re-export globally for onclick
window.closeExitPopup = closeExitPopup;

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('cookieConsent')) {
        const banner = document.getElementById('cookie-banner');
        if(banner) banner.style.display = 'none';
    }

    const newsletterForm = document.getElementById('newsletter-form');
    const exitNewsletterForm = document.getElementById('exit-newsletter-form');
    
    const handleForm = (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Subscribing...';
        btn.disabled = true;
        setTimeout(() => {
            alert('Thank you for subscribing!');
            e.target.reset();
            btn.innerHTML = originalText;
            btn.disabled = false;
            if(e.target.id === 'exit-newsletter-form') closeExitPopup();
        }, 1000);
    };

    if (newsletterForm) newsletterForm.onsubmit = handleForm;
    if (exitNewsletterForm) exitNewsletterForm.onsubmit = handleForm;
});

// Update current year if empty
const yearEl = document.getElementById('current-year');
if(yearEl && !yearEl.textContent) {
    yearEl.textContent = new Date().getFullYear();
}

// Global Link Fix for GitHub Pages and Static HTML routing
(function fixLinksForStaticRouting() {
    const isGitHubPages = window.location.hostname.includes('github.io');
    const repoName = '/Google-ads'; // Repository name for GitHub Pages

    function processLinks() {
        document.querySelectorAll('a').forEach(a => {
            let href = a.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;

            let newHref = href;

            // 1. Add .html to root pages if missing (for both local and GitHub Pages)
            const rootPages = ['/about', '/portfolio', '/team', '/blog', '/contact', '/privacy', '/terms', '/cookies', '/services'];
            if (rootPages.includes(newHref)) {
                newHref += '.html';
            }

            // 2. Add /index.html to service and blog nested pages if missing
            if ((newHref.startsWith('/services/') || newHref.startsWith('/blog/') || newHref.startsWith('/case-study/')) && !newHref.endsWith('.html')) {
                if (!newHref.endsWith('/')) newHref += '/';
                newHref += 'index.html';
            }

            // 3. Append repo name if on GitHub Pages and it's an absolute path
            if (isGitHubPages && newHref.startsWith('/') && !newHref.startsWith(repoName)) {
                newHref = repoName + newHref;
            }

            if (newHref !== href) {
                a.setAttribute('href', newHref);
            }
        });
    }

    // Run on script load
    processLinks();

    // Run on DOM loaded
    document.addEventListener('DOMContentLoaded', processLinks);

    // Observe DOM changes (for dynamic header/footer injection)
    const observer = new MutationObserver((mutations) => {
        let shouldProcess = false;
        for (let m of mutations) {
            if (m.addedNodes.length > 0) {
                shouldProcess = true;
                break;
            }
        }
        if (shouldProcess) processLinks();
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
})();

