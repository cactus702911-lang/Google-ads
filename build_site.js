const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const vm = require('vm');

// Load site data
const siteDataScript = fs.readFileSync('site_data.js', 'utf8');
const sandbox = { window: {}, document: {} };
vm.createContext(sandbox);
vm.runInContext(siteDataScript, sandbox);
const siteContent = sandbox.siteContent || sandbox.window.siteContent;

function cleanDirectory(directory) {
    if (fs.existsSync(directory)) {
        fs.readdirSync(directory).forEach((file) => {
            const currentPath = path.join(directory, file);
            if (fs.lstatSync(currentPath).isDirectory()) {
                cleanDirectory(currentPath);
                fs.rmdirSync(currentPath);
            } else {
                fs.unlinkSync(currentPath);
            }
        });
    }
}

// Clean target directories to remove deleted entries
['blog', 'case-study', 'services'].forEach(dir => {
    if (fs.existsSync(dir)) {
        cleanDirectory(dir);
    }
});

function getHeaderHtml() {
    return `
    <div class="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white text-center py-2 px-4 pr-10 sm:pr-12 relative z-[60] text-sm font-medium border-b border-blue-700/50" id="top-bar-container">
        <div class="container mx-auto flex items-center justify-center">
            <span id="top-bar-content">${siteContent.notification || ''}</span>
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
                    <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-700" id="logo-text">${siteContent.header?.logoText || ''}</span>
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
                                ${(siteContent.header?.categories || []).map(cat => `<a href="/services/${cat.toLowerCase().replace(/ /g, '-')}" class="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-left">${cat}</a>`).join('')}
                                <a href="/services" class="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-left font-semibold border-t border-gray-100 mt-1">View All Services</a>
                            </div>
                        </div>
                    </div>

                    <a href="/about" class="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">About</a>
                    <a href="/team" class="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">Team</a>
                    <a href="/blog" class="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">Blog</a>
                    <a href="/contact" class="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact</a>

                    <a href="/contact" class="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">${siteContent.header?.ctaButton || 'Get Started'}</a>
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
                        ${(siteContent.header?.categories || []).map(cat => `<a href="/services/${cat.toLowerCase().replace(/ /g, '-')}" class="py-2 text-sm text-gray-600 hover:text-blue-600" onclick="toggleMenu()">${cat}</a>`).join('')}
                    </div>
                </div>

                <a href="/about" class="text-lg py-3 text-slate-700 font-medium border-b border-slate-50 hover:text-blue-600 transition-colors" onclick="toggleMenu()">About</a>
                <a href="/team" class="text-lg py-3 text-slate-700 font-medium border-b border-slate-50 hover:text-blue-600 transition-colors" onclick="toggleMenu()">Team</a>
                <a href="/blog" class="text-lg py-3 text-slate-700 font-medium border-b border-slate-50 hover:text-blue-600 transition-colors" onclick="toggleMenu()">Blog</a>
                <a href="/contact" class="text-lg py-3 text-slate-700 font-medium border-b border-slate-50 hover:text-blue-600 transition-colors" onclick="toggleMenu()">Contact</a>
                
                <div class="pt-4">
                    <a href="/contact" class="block w-full bg-blue-600 text-white text-center px-6 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95">${siteContent.header?.ctaButton || 'Get Started'}</a>
                </div>
            </div>
        </div>
    </header>
    `;
}

function getFooterHtml() {
    return `
    <footer class="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
        <div class="container mx-auto px-4 md:px-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div class="space-y-4">
                    <a href="/" class="flex items-center gap-2 mb-4">
                        <div class="bg-blue-600 p-2 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket text-white"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
                        </div>
                        <span class="text-xl font-bold" id="footer-logo">${siteContent.header?.logoText || ''}</span>
                    </a>
                    <p class="text-slate-400 text-sm leading-relaxed" id="footer-desc">${siteContent.footer?.description || ''}</p>
                    <div class="flex items-center gap-2 text-sm text-green-400 font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg> Top Rated Agency
                    </div>
                    <div class="flex gap-4 pt-2">
                        <a href="#" class="bg-white/10 p-2 rounded-full hover:bg-blue-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </a>
                        <a href="https://linkedin.com/company/DigitalGrowth24" target="_blank" class="bg-white/10 p-2 rounded-full hover:bg-blue-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>
                        <a href="https://twitter.com/DigitalGrowth24" target="_blank" class="bg-white/10 p-2 rounded-full hover:bg-blue-600 transition-colors">
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
                <p class="text-slate-500 text-sm">&copy; ${new Date().getFullYear()} ${siteContent.footer?.copyright || ''}</p>
                <div class="flex items-center gap-4">
                    <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">Certified Partner:</span>
                    <div class="flex gap-2 opacity-70">
                        <div class="bg-white/10 px-2 py-1 rounded text-xs font-bold">Google</div>
                        <div class="bg-white/10 px-2 py-1 rounded text-xs font-bold">Meta</div>
                        <div class="bg-white/10 px-2 py-1 rounded text-xs font-bold">WordPress</div>
                    </div>
                </div>
            </div>
        </div>
    </footer>
    </div>
    
    <!-- Exit Intent Popup -->
    <div id="exit-popup" class="fixed inset-0 z-[100] hidden">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onclick="closeExitPopup()"></div>
        <div class="absolute bottom-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl p-5 sm:p-8 w-full sm:w-[90%] max-w-lg max-h-[90vh] overflow-y-auto transform transition-all translate-y-full sm:translate-y-10 sm:scale-95 opacity-0" id="exit-popup-content">
            <button onclick="closeExitPopup()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">🎁</div>
                <h3 class="text-2xl font-bold text-slate-900 mb-2">Wait! Get Your Free Audit</h3>
                <p class="text-slate-600 mb-6">Before you go, let us send you a comprehensive <span class="font-bold text-blue-600">SEO & Performance Report</span>.</p>
                <form id="exit-newsletter-form" class="space-y-3">
                    <input type="email" placeholder="Enter your email address" required class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 outline-none">
                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                        Send My Free Report
                    </button>
                </form>
                <button onclick="closeExitPopup()" class="mt-4 text-sm text-slate-400 hover:text-slate-600 underline">No thanks, I'll pass</button>
            </div>
        </div>
    </div>

    <!-- WhatsApp Widget -->
    <div class="fixed bottom-6 right-6 z-50 group">
        <a href="https://wa.me/${(siteContent.social?.whatsapp || '15551234567').replace(/\+/g, '')}" target="_blank" class="flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110 relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <span class="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
        </a>
    </div>
    `;
}

function processTemplate(templateName, outputPath, modifyDom) {
    // Primary: look in templates/ folder
    let templatePath = path.join('templates', templateName);

    // Fallback: if template is missing, read from the already-built root output file
    if (!fs.existsSync(templatePath)) {
        templatePath = outputPath;
    }
    if (!fs.existsSync(templatePath)) {
        console.warn(`SKIP: no template found for ${templateName}`);
        return;
    }

    const html = fs.readFileSync(templatePath, 'utf8');
    const $ = cheerio.load(html);

    // Strip previously injected elements to avoid double-injection on re-builds
    $('script').filter(function () {
        const src = $(this).attr('src') || '';
        const code = $(this).html() || '';
        return src.includes('ui.js') ||
            src.includes('aos.js') ||
            src.includes('store.js') ||
            src.includes('components.js') ||
            src.includes('site_data.js') ||
            src.includes('tailwindcss') ||
            code.startsWith('var siteContent') ||
            code.includes('AOS.init');
    }).remove();
    $('link[href*="aos"]').remove();
    $('script[src*="tailwindcss"]').remove();

    // Strip previously injected header/footer blocks (identified by unique IDs)
    $('#top-bar-container').parent().find('#top-bar-container').first().parent().each(function () {
        // Only remove top-level injected header wrapper, not page-internal elements
    });
    // Remove injected notification bar, header, and footer if already present
    $('body > div#top-bar-container').remove();
    $('body > header').first().remove();
    $('body > footer').first().remove();

    // Remove old dynamic JS
    $('script[src="js/store.js"]').remove();
    $('script[src="/js/store.js"]').remove();
    $('script[src="../js/store.js"]').remove();
    $('script[src="js/components.js"]').remove();
    $('script[src="/js/components.js"]').remove();
    $('script[src="../js/components.js"]').remove();
    $('script[src="site_data.js"]').remove();
    $('script[src="/site_data.js"]').remove();
    $('script[src="../site_data.js"]').remove();

    // Inject siteContent directly into head
    $('head').prepend(`<script>var siteContent = ${JSON.stringify(siteContent)};</script>`);

    // Define depth prefix for paths
    const depth = outputPath.split('/').length - 1;
    const prefix = depth > 0 ? '../'.repeat(depth) : './';
    
    // Inject dynamic favicon if set
    if (siteContent.favicon) {
        $('link[rel="icon"]').remove();
        $('link[rel="shortcut icon"]').remove();
        $('head').append(`<link rel="icon" href="${prefix + siteContent.favicon.replace(/^\//, '')}">`);
    }

    // Inject CSS
    
    // Inject Tailwind CSS as preload then link for Critical CSS handling
    $('head').append(`<link rel="preload" href="${prefix}css/style.css" as="style" onload="this.onload=null;this.rel='stylesheet'">`);
    $('head').append(`<noscript><link rel="stylesheet" href="${prefix}css/style.css"></noscript>`);
    
    // Inject AOS and ui.js with defer
    $('head').append(`<link rel="stylesheet" href="https://unpkg.com/aos@2.3.1/dist/aos.css" media="print" onload="this.media='all'">`);
    $('body').append(`<script src="https://unpkg.com/aos@2.3.1/dist/aos.js" defer></script>`);
    $('body').append(`<script src="${prefix}js/ui.js" defer></script>`);
    $('body').append(`<script>window.addEventListener('DOMContentLoaded', () => { setTimeout(() => { if(typeof AOS !== 'undefined') AOS.init({duration: 800, once: true}); }, 100); });</script>`);

    // CSR Update: Do NOT inject HTML header and footer directly
    // Instead, we will rely on client-side JS to load them.
    // We only inject the data-loader and CSR init script.
    $('head').append(`<script src="${prefix}js/data-loader.js"></script>`);
    
    // We pass pageName to CSR init so it knows what to load
    let pageName = templateName.replace('.html', '');
    if (pageName === 'index') pageName = 'home';
    if (pageName === 'services' && outputPath !== 'services.html') pageName = 'serviceDetails';
    
    $('body').append(`
        <script>
            document.addEventListener('DOMContentLoaded', async () => {
                const siteData = await window.loadSiteData('${pageName}');
                if (siteData && window.renderHeader && window.renderFooter) {
                    window.renderHeader(siteData.common.header, siteData.common.notification);
                    window.renderFooter(siteData.common.footer, siteData.common.social);
                }
            });
        </script>
    `);

    // Apply specific modifications
    if (modifyDom) modifyDom($);

    // Optimize Unsplash images to WebP format
    $('img').each(function() {
        const src = $(this).attr('src');
        if (src && src.includes('images.unsplash.com') && !src.includes('fm=webp')) {
            $(this).attr('src', src + '&fm=webp');
        }
        
        // Add loading="lazy" if not present and not hero image
        if (!$(this).attr('loading') && !$(this).parents('#hero-title, section').first().text().includes('hero')) {
            $(this).attr('loading', 'lazy');
        }
    });

    // Make sure dir exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(outputPath, $.html());
    console.log('Built:', outputPath);
}

// Ensure output dirs
if (!fs.existsSync('case-study')) fs.mkdirSync('case-study');
if (!fs.existsSync('blog')) fs.mkdirSync('blog');
if (!fs.existsSync('services')) fs.mkdirSync('services');

// Build Home
processTemplate('index.html', 'index.html', ($) => {
    const h = siteContent.home;
    if (h) {
        if (h.hero) {
            $('#hero-title').text(h.hero.title);
            $('#hero-subtitle').text(h.hero.subtitle);
        }

        // Build Services Grid
        const $servicesGrid = $('#services-grid');
        if ($servicesGrid.length && h.services) {
            $servicesGrid.empty();
            h.services.forEach(s => {
                $servicesGrid.append(`
                    <a href="${s.link}" class="group bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-1">
                        <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <img src="${s.image}" alt="${s.title}" class="w-8 h-8 object-contain filter group-hover:brightness-0 group-hover:invert transition-all">
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">${s.title}</h3>
                        <p class="text-slate-600 text-sm leading-relaxed">${s.description}</p>
                        <div class="mt-6 flex items-center text-sm font-bold text-blue-600 group-hover:gap-2 transition-all">
                            Learn more <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right ml-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </div>
                    </a>
                `);
            });
        }

        // Stats
        if (h.stats && h.stats.length >= 3) {
            $('#stat-experience').text(h.stats[0].value);
            $('#stat-clients').text(h.stats[1].value);
            $('#stat-projects').text(h.stats[2].value);
        }

        // Why Choose
        const $whyGrid = $('#why-choose-grid');
        if ($whyGrid.length && h.whyChoose && h.whyChoose.points) {
            $whyGrid.empty();
            h.whyChoose.points.forEach(w => {
                $whyGrid.append(`
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 class="text-lg font-bold text-slate-800 mb-2">${w}</h3>
                    </div>
                `);
            });
        }

        // Testimonials
        const $testiGrid = $('#testimonials-grid');
        if ($testiGrid.length && h.testimonials) {
            $testiGrid.empty();
            h.testimonials.forEach(t => {
                $testiGrid.append(`
                    <div class="bg-slate-50 p-8 rounded-2xl relative">
                        <svg class="absolute top-4 right-6 w-8 h-8 text-blue-200" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true"><path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"></path></svg>
                        <p class="text-slate-700 italic mb-6 relative z-10">${t.quote}</p>
                        <div class="flex items-center gap-4">
                            <img src="${t.image}" alt="${t.author}" class="w-12 h-12 rounded-full object-cover">
                            <div>
                                <h4 class="font-bold text-slate-800 text-sm">${t.author}</h4>
                                <p class="text-xs text-slate-500">${t.role}</p>
                            </div>
                        </div>
                    </div>
                `);
            });
        }

        // Call to Action
        if (h.callToAction) {
            $('#cta-title').text(h.callToAction.title);
            $('#cta-subtitle').text(h.callToAction.subtitle);
        }
    }
});

// Build About
processTemplate('about.html', 'about.html', ($) => {
    if (siteContent.about) {
        const about = siteContent.about;
        $('#about-name').text(about.name || '');
        $('#about-role').text(about.role || 'Digital Agency');
        $('#about-desc1').text(about.description1 || '');
        $('#about-desc2').text(about.description2 || '');
        if (about.image) $('#about-image').attr('src', about.image);

        // CTA
        $('#cta-title').text(about.ctaTitle || '');
        $('#cta-subtitle').text(about.ctaSubtitle || '');
        $('#cta-button').text(about.ctaButton || 'Contact Us');

        // Stats
        const $stats = $('#about-stats');
        if ($stats.length && about.stats) {
            $stats.empty();
            about.stats.forEach(s => {
                $stats.append(`
                    <div class="flex flex-col items-center">
                        <span class="text-4xl md:text-5xl font-extrabold text-blue-400 mb-2">${s.value}</span>
                        <span class="text-lg font-bold text-white mb-1">${s.label}</span>
                        <span class="text-sm text-slate-400">${s.subtext || ''}</span>
                    </div>
                `);
            });
        }

        // Expertise / Experience
        $('#exp-title').text(about.experienceTitle || 'Our Expertise');
        const $exp = $('#exp-grid');
        if ($exp.length && about.experience) {
            $exp.empty();
            const icons = [
                `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>`,
                `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>`,
                `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>`
            ];
            about.experience.forEach((e, i) => {
                const icon = icons[i % icons.length];
                $exp.append(`
                    <div class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                        <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            ${icon}
                        </div>
                        <h3 class="text-2xl font-bold text-slate-900 mb-3">${e.role}</h3>
                        <div class="flex items-center gap-2 mb-4">
                            <span class="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">${e.company}</span>
                            <span class="text-slate-400 text-sm font-medium border-l border-slate-300 pl-2">${e.period}</span>
                        </div>
                        <p class="text-slate-600 leading-relaxed">${e.description}</p>
                    </div>
                `);
            });
        }
    }
});

// Build Portfolio
processTemplate('portfolio.html', 'portfolio.html', ($) => {
    const $grid = $('#products-grid');
    if ($grid.length && siteContent.caseStudies) {
        $grid.empty();
        (siteContent.caseStudies?.studies || []).forEach(c => {
            $grid.append(`
                <div class="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col h-full">
                    <div class="relative h-48 overflow-hidden cursor-pointer" onclick="window.location.href='/case-study/${c.slug}'">
                        <img src="${c.image}" alt="${c.title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                        <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">
                            ${c.category}
                        </div>
                    </div>
                    <div class="p-6 flex flex-col flex-grow">
                        <p class="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">${c.client}</p>
                        <h3 class="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">${c.title}</h3>
                        <p class="text-slate-600 text-sm mb-6 flex-grow line-clamp-3">${c.shortDescription || c.description}</p>
                        
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div class="flex items-center gap-2 text-slate-500 text-xs mb-1 font-medium">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    <span>Duration</span>
                                </div>
                                <p class="text-sm font-bold text-slate-900 truncate">${c.specs?.duration || 'Ongoing'}</p>
                            </div>
                            <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div class="flex items-center gap-2 text-slate-500 text-xs mb-1 font-medium">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                                    <span>Results</span>
                                </div>
                                <p class="text-sm font-bold text-slate-900 truncate">${c.specs?.roi || 'High Impact'}</p>
                            </div>
                        </div>
                        
                        <a href="/case-study/${c.slug}" class="w-full py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2 group-hover:gap-3">
                            View Case Study <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-right"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
                        </a>
                    </div>
                </div>
            `);
        });
    }

    // Categories
    const $cats = $('#categories-container');
    if ($cats.length && siteContent.caseStudies?.categories) {
        $cats.empty();
        siteContent.caseStudies.categories.forEach(cat => {
            const isActive = cat === 'All';
            $cats.append(`
                <button class="px-6 py-2 rounded-full text-sm font-bold transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}">
                    ${cat}
                </button>
            `);
        });
    }

    $('#page-title').text(siteContent.caseStudies?.title || '');
    $('#page-subtitle').text(siteContent.caseStudies?.subtitle || '');
});

// Build Blog List
processTemplate('blog.html', 'blog.html', ($) => {
    const $grid = $('#blog-grid');
    const posts = siteContent.blog?.posts || [];

    // Remove runtime JS that relies on siteContent (already gone in static build)
    $('script').filter(function () {
        return $(this).html().includes('renderPage') || $(this).html().includes('filterPosts');
    }).remove();

    if ($grid.length) {
        $grid.empty();
        if (posts.length === 0) {
            $grid.append(`<div class="col-span-full text-center py-20 text-slate-500">No posts published yet.</div>`);
        } else {
            posts.forEach(b => {
                $grid.append(`
                    <article class="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                        <a href="/blog/${b.slug}" class="block h-52 overflow-hidden relative">
                            <img src="${b.image || 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80'}" alt="${b.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            <div class="absolute top-4 left-4">
                                <span class="bg-white/90 backdrop-blur-sm text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">${b.category}</span>
                            </div>
                        </a>
                        <div class="p-6 flex flex-col flex-grow">
                            <div class="flex items-center gap-4 text-xs text-slate-500 mb-3">
                                <span>📅 ${b.date}</span>
                                <span>👤 ${b.author || 'DigitalGrowth24'}</span>
                            </div>
                            <h2 class="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 flex-grow">
                                <a href="/blog/${b.slug}">${b.title}</a>
                            </h2>
                            <p class="text-slate-600 text-sm mb-5 line-clamp-3">${b.excerpt}</p>
                            <a href="/blog/${b.slug}" class="mt-auto inline-flex items-center gap-1 text-blue-600 font-bold text-sm group-hover:gap-2 transition-all">
                                Read Article
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            </a>
                        </div>
                    </article>
                `);
            });
        }
    }

    // Update page title and subtitle statically
    const blog = siteContent.blog || {};
    $('#page-title').text(blog.title || 'Blog');
    $('#page-subtitle').text(blog.subtitle || '');

    // Build static category filter buttons
    const categories = [...new Set(posts.map(p => p.category))];
    const $filter = $('#category-filter');
    if ($filter.length) {
        $filter.empty();
        $filter.append(`<a href="/blog" class="px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white">All</a>`);
        categories.forEach(cat => {
            $filter.append(`<a href="/blog?cat=${cat.toLowerCase()}" class="px-4 py-2 rounded-full text-sm font-medium bg-white text-slate-600 hover:bg-slate-100 border border-slate-200">${cat}</a>`);
        });
    }
});


// Build Individual Case Studies
(siteContent.caseStudies?.studies || []).forEach(c => {
    processTemplate('case-study.html', `case-study/${c.slug}/index.html`, ($) => {
        $('title').text(`${c.title} | Case Study | DigitalGrowth24`);
        $('meta[name="description"]').attr('content', c.shortDescription || c.description || '');

        // Hero
        $('#product-title').text(c.title);
        $('#product-category').text(c.category);
        $('#product-category-2').text(c.category);
        $('#sidebar-category').text(c.category);
        $('#product-image').attr('src', c.image).attr('alt', c.title);
        if (c.image) $('#product-hero-bg').attr('style', `background-image:url('${c.image}')`);

        // Main description/solution
        $('#product-description').html(c.description || c.solution || '');

        // Challenge (show section only if data exists)
        if (c.challenge) {
            $('#challenge-section').removeClass('hidden');
            $('#product-challenge').html(c.challenge);
        }

        // Specs — map from c.specs object
        const specs = c.specs || {};
        $('#spec-age').text(specs.duration || c.spec_age || 'N/A');
        $('#spec-ip').text(specs.platform || c.spec_ip || 'N/A');
        $('#spec-format').text(specs.strategy || c.spec_format || 'N/A');
        const roi = specs.roi || c.spec_warranty || '';
        if (roi) {
            $('#spec-warranty').text(roi);
        } else {
            $('#spec-warranty-row').remove();
        }

        // Metrics grid
        const $metrics = $('#metrics-grid');
        if ($metrics.length && c.metrics && c.metrics.length > 0) {
            $metrics.empty();
            c.metrics.forEach(m => {
                $metrics.append(`
                    <div class="text-center">
                        <div class="text-3xl md:text-4xl font-extrabold text-white mb-1">${m}</div>
                    </div>
                `);
            });
        } else if ($metrics.length) {
            // Auto-build metrics from specs if no explicit metrics array
            const metricItems = [];
            if (specs.roi) metricItems.push({ label: 'ROI', value: specs.roi });
            if (specs.duration) metricItems.push({ label: 'Duration', value: specs.duration });
            if (specs.reach) metricItems.push({ label: 'Reach', value: specs.reach });
            if (metricItems.length) {
                $metrics.empty();
                metricItems.forEach(m => {
                    $metrics.append(`
                        <div class="text-center">
                            <div class="text-3xl font-extrabold text-white mb-1">${m.value}</div>
                            <div class="text-blue-200 text-sm">${m.label}</div>
                        </div>
                    `);
                });
            }
        }

        // Reviews
        const $reviews = $('#product-reviews');
        if ($reviews.length && c.reviews && c.reviews.length > 0) {
            $reviews.empty();
            c.reviews.forEach(r => {
                $reviews.append(`
                    <div class="py-4 first:pt-0 last:pb-0">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-bold text-slate-800">${r.user || r.name || 'Client'}</span>
                            <div class="flex text-yellow-400 text-sm">
                                ${'★'.repeat(Math.round(r.rating || 5))}
                            </div>
                        </div>
                        <p class="text-sm text-slate-600">${r.comment || r.text || ''}</p>
                        <p class="text-xs text-slate-400 mt-1">${r.date || ''}</p>
                    </div>
                `);
            });
        }

        // FAQs
        const $faqs = $('#product-faqs');
        if ($faqs.length && c.faqs && c.faqs.length > 0) {
            $faqs.empty();
            c.faqs.forEach(f => {
                $faqs.append(`
                    <div class="bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <h4 class="font-bold text-slate-800 mb-2">${f.question}</h4>
                        <p class="text-sm text-slate-600 leading-relaxed">${f.answer}</p>
                    </div>
                `);
            });
        } else {
            $('#faqs-wrapper').remove();
        }
    });
});

// Build Individual Blogs
(siteContent.blog?.posts || []).forEach(b => {
    processTemplate('blog-post.html', `blog/${b.slug}/index.html`, ($) => {
        // SEO & Meta
        $('title').text(`${b.title} | DigitalGrowth24 Blog`);
        $('#meta-description').attr('content', b.excerpt || b.title);
        $('#og-title').attr('content', b.title);
        $('#og-description').attr('content', b.excerpt || '');
        $('#og-image').attr('content', b.image || '');
        $('#canonical-url').attr('href', `https://DigitalGrowth24.agency/blog/${b.slug}`);

        // Hero & Content
        $('#blog-title').text(b.title);
        $('#blog-category').text(b.category);
        $('#blog-category-breadcrumb').text(b.category);
        $('#blog-tag').text(b.category);
        $('#blog-date').text(b.date);
        $('#blog-author').text(b.author || 'DigitalGrowth24 Team');
        $('#sidebar-author').text(b.author || 'DigitalGrowth24 Team');
        $('#blog-content').html(b.content);

        // Featured image
        if (b.image) {
            $('#blog-featured-image').attr('src', b.image).attr('alt', b.title);
            $('#blog-hero-bg').css('background-image', `url('${b.image}')`);
        }

        // Estimated read time (avg 200 words/min)
        const wordCount = (b.content || '').replace(/<[^>]+>/g, '').split(/\s+/).length;
        const readMins = Math.max(1, Math.round(wordCount / 200));
        $('#blog-read-time').text(`${readMins} min read`);

        // Share links
        const encodedUrl = encodeURIComponent(`https://DigitalGrowth24.agency/blog/${b.slug}`);
        const encodedTitle = encodeURIComponent(b.title);
        $('#share-twitter').attr('href', `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`);
        $('#share-linkedin').attr('href', `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`);

        // Related posts (up to 3, excluding current)
        const $related = $('#related-posts');
        if ($related.length) {
            $related.empty();
            const related = (siteContent.blog?.posts || [])
                .filter(p => p.slug !== b.slug)
                .slice(0, 3);
            if (related.length === 0) {
                $related.append(`<p class="text-slate-500 text-sm">No other posts yet.</p>`);
            } else {
                related.forEach(r => {
                    $related.append(`
                        <a href="/blog/${r.slug}" class="flex items-start gap-3 group hover:bg-slate-50 p-2 rounded-lg transition-colors -mx-2">
                            <div class="w-16 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                                <img src="${r.image || ''}" alt="${r.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">${r.category}</p>
                                <h4 class="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">${r.title}</h4>
                                <p class="text-xs text-slate-400 mt-1">${r.date}</p>
                            </div>
                        </a>
                    `);
                });
            }
        }

        // Sidebar services list
        const $sidebarServices = $('#sidebar-services');
        if ($sidebarServices.length && siteContent.servicesPage?.customThemeItems) {
            $sidebarServices.empty();
            siteContent.servicesPage.customThemeItems.forEach(s => {
                const slug = s.slug || s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                $sidebarServices.append(`
                    <li>
                        <a href="/services/${slug}" class="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-medium text-sm py-1 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            ${s.title}
                        </a>
                    </li>
                `);
            });
        }
    });
});

// Build Individual Services
(siteContent.header?.categories || []).forEach(cat => {
    const slug = cat.toLowerCase().replace(/ /g, '-');
    processTemplate('service-details.html', `services/${slug}/index.html`, ($) => {
        $('title').text(`${cat} Services | DigitalGrowth24`);
        $('#service-title').text(`${cat} Services`);
        $('#service-description').text(`Comprehensive ${cat} solutions tailored for your business growth.`);

        const $grid = $('#service-related-grid');
        if ($grid.length && siteContent.home?.services) {
            $grid.empty();
            siteContent.home.services.filter(s => s.title.includes(cat) || cat.includes(s.title.split(' ')[0])).forEach(s => {
                $grid.append(`
                    <a href="${s.link}" class="group bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <img src="${s.image}" class="w-6 h-6 object-contain filter group-hover:brightness-0 group-hover:invert transition-all">
                        </div>
                        <h3 class="text-lg font-bold text-slate-800 mb-2">${s.title}</h3>
                        <p class="text-slate-600 text-sm">${s.description}</p>
                    </a>
                `);
            });
        }
    });
});

// Build Contact, Team, Services List
processTemplate('contact.html', 'contact.html', ($) => {
    if (siteContent.contactPage) {
        $('#contact-email').text(siteContent.contactPage.email);
        $('#contact-phone').text(siteContent.contactPage.phone);
        $('#contact-address').text(siteContent.contactPage.address);
    }
    if (siteContent.social?.whatsapp) {
        $('#contact-whatsapp').attr('href', `https://wa.me/${siteContent.social.whatsapp.replace(/\+/g, '')}`);
    }
});

processTemplate('team.html', 'team.html', ($) => {
    const team = siteContent.team || [
        { name: "Sarah Jenkins", role: "CEO & Founder", image: "https://randomuser.me/api/portraits/women/32.jpg" },
        { name: "David Wilson", role: "Head of SEO", image: "https://randomuser.me/api/portraits/men/44.jpg" },
        { name: "Mike Brown", role: "Lead Developer", image: "https://randomuser.me/api/portraits/men/68.jpg" },
        { name: "Emily Davis", role: "Content Strategist", image: "https://randomuser.me/api/portraits/women/65.jpg" }
    ];
    const $grid = $('#team-grid');
    if ($grid.length) {
        $grid.empty();
        team.forEach(member => {
            $grid.append(`
                <div class="bg-white rounded-xl shadow-lg overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                    <div class="h-64 overflow-hidden">
                        <img src="${member.image}" alt="${member.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                    </div>
                    <div class="p-6 text-center">
                        <h3 class="text-xl font-bold text-slate-900 mb-1">${member.name}</h3>
                        <p class="text-blue-600 font-medium text-sm">${member.role}</p>
                    </div>
                </div>
            `);
        });
    }
});

processTemplate('services.html', 'services.html', ($) => {
    const services = siteContent.servicesPage;
    if (!services) return;

    $('#page-title').text(services.title);
    $('#page-subtitle').text(services.subtitle);
    $('#custom-title').text(services.customThemeTitle);

    const $customGrid = $('#custom-grid');
    if ($customGrid.length) {
        $customGrid.empty();
        const serviceIcons = [
            `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
            `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mouse-pointer-2"><path d="m12 6 6 6-6 6"/><path d="M2 12h10"/></svg>`,
            `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-share-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>`,
            `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-template"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`
        ];

        services.customThemeItems.forEach((item, idx) => {
            const slug = item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            $customGrid.append(`
                <div class="bg-slate-50 p-6 rounded-xl border border-slate-100 hover:shadow-lg transition-all group text-center hover:-translate-y-1 duration-300 cursor-pointer" onclick="window.location.href='/services/${slug}'">
                    <div class="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        ${serviceIcons[idx] || serviceIcons[0]}
                    </div>
                    <h3 class="text-lg font-bold mb-2 text-slate-900 group-hover:text-blue-600 transition-colors">${item.title}</h3>
                    <p class="text-slate-600 text-sm leading-relaxed">${item.desc}</p>
                    <div class="mt-4 text-blue-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">Learn More →</div>
                </div>
            `);
        });
    }

    const $pricingGrid = $('#pricing-grid');
    if ($pricingGrid.length && services.pricing) {
        $('#pricing-title').text(services.pricingTitle);
        $('#pricing-subtitle').text(services.pricingSubtitle);
        $pricingGrid.empty();
        services.pricing.forEach(pkg => {
            const isHighlight = pkg.highlight;
            $pricingGrid.append(`
                <div class="bg-white rounded-2xl p-8 border ${isHighlight ? 'border-blue-500 shadow-xl ring-4 ring-blue-500/10 relative md:scale-105 z-10' : 'border-slate-100 shadow-sm hover:shadow-md transition-shadow'}">
                    ${isHighlight ? `<div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>` : ''}
                    <h3 class="text-xl font-bold text-slate-900 mb-2">${pkg.title}</h3>
                    <div class="flex items-baseline gap-1 mb-4">
                        <span class="text-3xl font-bold text-blue-600">${pkg.price}</span>
                    </div>
                    <p class="text-slate-500 text-sm mb-6 pb-6 border-b border-slate-100">${pkg.description}</p>
                    <ul class="space-y-3 mb-8">
                        ${pkg.features.map(f => `
                            <li class="flex items-start gap-3 text-sm text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                                ${f}
                            </li>
                        `).join('')}
                    </ul>
                    <a href="/contact.html" class="block w-full py-3 rounded-xl font-bold text-center transition-colors ${isHighlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}">
                        ${pkg.cta}
                    </a>
                </div>
            `);
        });
    }

    const $includedGrid = $('#included-grid');
    if ($includedGrid.length && services.includedItems) {
        $includedGrid.empty();
        services.includedItems.forEach(item => {
            $includedGrid.append(`
                <div class="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                    <span class="text-slate-700 font-medium">${item}</span>
                </div>
            `);
        });
    }

    $('#tech-title').text(services.pluginTitle);
    $('#plugin-desc').text(services.pluginDesc1);
});

processTemplate('404.html', '404.html');
processTemplate('cookies.html', 'cookies.html');
processTemplate('privacy.html', 'privacy.html');
processTemplate('terms.html', 'terms.html');

console.log('Site successfully generated statically!');
