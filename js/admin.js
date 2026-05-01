// Admin Dashboard Logic

let content = null;
let currentTab = 'general';
let currentServiceIdx = null;
let currentTestiIdx = null;
let currentStudyIdx = null;
let currentBlogIdx = null;
let studyQuill, blogQuill;

// ── Init ──────────────────────────────────────────────────────────────────────
// admin.js is loaded dynamically AFTER site_data.js is ready,
// so DOMContentLoaded may have already fired. Run init immediately.
function initAdmin() {
    lucide.createIcons();

    const toolbarOptions = [
        [{ 'header': [2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image', 'clean']
    ];

    if(document.getElementById('cs-quill')) {
        studyQuill = new Quill('#cs-quill', {
            theme: 'snow',
            modules: { toolbar: toolbarOptions }
        });
    }
    if (document.getElementById('blog-quill')) {
        blogQuill = new Quill('#blog-quill', { theme: 'snow', modules: { toolbar: toolbarOptions } });
    }

    if (localStorage.getItem('adminToken') === 'true') {
        loginSuccess();
    }
}

// Run as soon as this script executes (DOM is already ready)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
} else {
    initAdmin();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
function checkAuth() {
    const pass = document.getElementById('password-input').value;
    if (pass === 'admin123') {
        localStorage.setItem('adminToken', 'true');
        loginSuccess();
    } else {
        document.getElementById('password-input').style.borderColor = '#ef4444';
        setTimeout(() => document.getElementById('password-input').style.borderColor = '', 1500);
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    window.location.reload();
}

function loginSuccess() {
    if (typeof siteContent === 'undefined') {
        fetch('/api/content')
            .then(res => res.json())
            .then(data => {
                siteContent = data;
                initializeDashboard();
            })
            .catch(err => {
                alert('ERROR: Could not load site data from server!');
                console.error(err);
            });
    } else {
        initializeDashboard();
    }
}

function initializeDashboard() {
    document.getElementById('auth-overlay').classList.add('hidden');
    document.getElementById('cms-content').classList.remove('hidden');
    document.getElementById('global-save-bar').classList.remove('hidden');
    lucide.createIcons();

    content = JSON.parse(JSON.stringify(siteContent));
    if (content.favicon) {
        const iconLink = document.querySelector('link[rel="icon"]') || document.createElement('link');
        iconLink.rel = 'icon';
        iconLink.href = content.favicon;
        document.head.appendChild(iconLink);
    }
    renderAll();
}

// ── Tab Switch ────────────────────────────────────────────────────────────────
function switchTab(tabId, btn) {
    currentTab = tabId;
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(b => {
        b.className = 'nav-btn px-4 py-2 rounded-lg text-sm font-bold transition bg-slate-800 text-slate-400 hover:bg-slate-700';
    });
    btn.className = 'nav-btn px-4 py-2 rounded-lg text-sm font-bold transition bg-blue-600 text-white shadow-lg shadow-blue-500/20';
}

// ── Render All ────────────────────────────────────────────────────────────────
function renderAll() {
    try { renderGeneral(); } catch(e) { console.error('renderGeneral failed:', e); }
    try { renderHome(); } catch(e) { console.error('renderHome failed:', e); }
    try { renderServicesList(); } catch(e) { console.error('renderServicesList failed:', e); }
    try { renderTestiList(); } catch(e) { console.error('renderTestiList failed:', e); }
    try { renderStudyList(); } catch(e) { console.error('renderStudyList failed:', e); }
    try { renderBlogList(); } catch(e) { console.error('renderBlogList failed:', e); }
}

// ── GENERAL ───────────────────────────────────────────────────────────────────
function renderGeneral() {
    const h = content.header || {};
    const c = content.contact || {};
    const s = content.social || {};
    const seo = content.seo || {};
    const f = content.footer || {};

    set('g-logo',         h.logoText || '');
    set('g-logo-image',   h.logoImage || '');
    set('g-favicon',      content.favicon || '');
    set('g-notification', content.notification || '');
    set('g-cta',          h.ctaButton || '');
    set('g-categories',   (h.categories || []).join(', '));

    set('g-email',   c.email || '');
    set('g-phone',   c.phone || '');
    set('g-address', c.address || '');

    set('g-whatsapp', s.whatsapp || '');
    set('g-facebook', s.facebook || '');
    set('g-twitter',  s.twitter  || '');
    set('g-linkedin', s.linkedin || '');

    set('g-seo-title', seo.siteTitle || seo.defaultTitle || '');
    set('g-seo-desc',  seo.siteDescription || seo.defaultDesc || '');
    set('g-footer-desc', f.description || '');
    set('g-footer-copy', f.copyright || '');
}

function updateGeneralFromDOM() {
    if (!content.header)  content.header  = {};
    if (!content.contact) content.contact = {};
    if (!content.social)  content.social  = {};
    if (!content.seo)     content.seo     = {};
    if (!content.footer)  content.footer  = {};

    content.header.logoText    = get('g-logo');
    content.header.logoImage   = get('g-logo-image');
    content.favicon            = get('g-favicon');
    content.notification       = get('g-notification');
    content.header.ctaButton   = get('g-cta');
    content.header.categories  = get('g-categories').split(',').map(s => s.trim()).filter(Boolean);

    content.contact.email   = get('g-email');
    content.contact.phone   = get('g-phone');
    content.contact.address = get('g-address');

    content.social.whatsapp = get('g-whatsapp');
    content.social.facebook = get('g-facebook');
    content.social.twitter  = get('g-twitter');
    content.social.linkedin = get('g-linkedin');

    content.seo.siteTitle       = get('g-seo-title');
    content.seo.siteDescription = get('g-seo-desc');
    content.footer.description  = get('g-footer-desc');
    content.footer.copyright    = get('g-footer-copy');
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function renderHome() {
    const home = content.home || {};
    const h = home.hero || {};

    set('h-badge',    h.badge    || '');
    set('h-title',    h.title    || '');
    set('h-subtitle', h.subtitle || '');
    set('h-cta1',     h.ctaPrimary   || '');
    set('h-cta2',     h.ctaSecondary || '');
    set('h-image',    h.heroImage    || '');

    const statsDiv = document.getElementById('h-stats-container');
    if (statsDiv) {
        const stats = home.stats || [];
        statsDiv.innerHTML = stats.length === 0
            ? '<p class="text-slate-500 text-sm">No stats found in site_data.js</p>'
            : stats.map((s, i) => `
                <div class="flex gap-4 items-end">
                    <div class="flex-1">
                        <label class="text-xs text-slate-400">Value</label>
                        <input type="text" id="stat-v-${i}" value="${esc(s.value)}" class="input-field text-sm">
                    </div>
                    <div class="flex-1">
                        <label class="text-xs text-slate-400">Label</label>
                        <input type="text" id="stat-l-${i}" value="${esc(s.label)}" class="input-field text-sm">
                    </div>
                </div>
            `).join('');
    }
}

function updateHomeFromDOM() {
    if (!content.home) content.home = {};
    if (!content.home.hero) content.home.hero = {};
    const h = content.home.hero;
    h.badge        = get('h-badge');
    h.title        = get('h-title');
    h.subtitle     = get('h-subtitle');
    h.ctaPrimary   = get('h-cta1');
    h.ctaSecondary = get('h-cta2');
    h.heroImage    = get('h-image');

    (content.home.stats || []).forEach((s, i) => {
        const vEl = document.getElementById(`stat-v-${i}`);
        const lEl = document.getElementById(`stat-l-${i}`);
        if (vEl) s.value = vEl.value;
        if (lEl) s.label = lEl.value;
    });
}

// ── TESTIMONIALS ──────────────────────────────────────────────────────────────
function renderTestiList() {
    const list = document.getElementById('testi-list');
    if (!list) return;
    const items = (content.home || {}).testimonials || [];
    list.innerHTML = items.length === 0
        ? '<p class="text-slate-500 text-xs p-2">No testimonials yet.</p>'
        : items.map((t, i) => `
            <div onclick="loadTesti(${i})" class="p-3 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer text-sm text-slate-300 flex justify-between group">
                <span class="truncate">${esc(t.author)}</span>
                <span class="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100">Edit</span>
            </div>
        `).join('');
}
function loadTesti(idx) {
    currentTestiIdx = idx;
    const t = (content.home.testimonials || [])[idx];
    if (!t) return;
    document.getElementById('testi-editor').classList.remove('hidden');
    set('t-author', t.author || '');
    set('t-role',   t.role   || '');
    set('t-image',  t.image  || '');
    set('t-quote',  t.quote  || '');
}
function saveTestimonial() {
    const t = content.home.testimonials[currentTestiIdx];
    t.author = get('t-author');
    t.role   = get('t-role');
    t.image  = get('t-image');
    t.quote  = get('t-quote');
    toast('Testimonial updated in memory');
    renderTestiList();
}
function addTestimonial() {
    if (!content.home.testimonials) content.home.testimonials = [];
    content.home.testimonials.push({ author: 'New Person', role: 'Role', quote: 'Quote', image: '' });
    renderTestiList();
    loadTesti(content.home.testimonials.length - 1);
}
function deleteTestimonial() {
    content.home.testimonials.splice(currentTestiIdx, 1);
    document.getElementById('testi-editor').classList.add('hidden');
    renderTestiList();
}

// ── SERVICES ──────────────────────────────────────────────────────────────────
function renderServicesList() {
    const list = document.getElementById('service-list');
    if (!list) return;
    const items = (content.home || {}).services || [];
    list.innerHTML = items.length === 0
        ? '<p class="text-slate-500 text-xs p-2">No services yet.</p>'
        : items.map((s, i) => `
            <div onclick="loadService(${i})" class="p-3 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer text-sm text-slate-300 flex justify-between group">
                <span class="truncate">${esc(s.title)}</span>
                <span class="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100">Edit</span>
            </div>
        `).join('');
}
function loadService(idx) {
    currentServiceIdx = idx;
    const s = (content.home.services || [])[idx];
    if (!s) return;
    document.getElementById('service-editor').classList.remove('hidden');
    set('s-title', s.title       || '');
    set('s-desc',  s.description || '');
    set('s-image', s.image       || '');
    set('s-link',  s.link        || '');
}
function saveService() {
    const s = content.home.services[currentServiceIdx];
    s.title       = get('s-title');
    s.description = get('s-desc');
    s.image       = get('s-image');
    s.link        = get('s-link');
    toast('Service updated in memory');
    renderServicesList();
}
function addService() {
    if (!content.home.services) content.home.services = [];
    content.home.services.push({ title: 'New Service', description: '', image: '', link: '' });
    renderServicesList();
    loadService(content.home.services.length - 1);
}
function deleteService() {
    content.home.services.splice(currentServiceIdx, 1);
    document.getElementById('service-editor').classList.add('hidden');
    renderServicesList();
}

// ── CASE STUDIES ──────────────────────────────────────────────────────────────
function renderStudyList() {
    const list = document.getElementById('study-list');
    if (!list) return;
    const items = (content.caseStudies || {}).studies || [];
    list.innerHTML = items.length === 0
        ? '<p class="text-slate-500 text-xs p-2">No case studies yet.</p>'
        : items.map((s, i) => `
            <div onclick="loadStudy(${i})" class="p-3 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer text-sm text-slate-300 flex justify-between group">
                <span class="truncate">${esc(s.title)}</span>
                <span class="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100">Edit</span>
            </div>
        `).join('');
}
function loadStudy(idx) {
    currentStudyIdx = idx;
    const s = ((content.caseStudies || {}).studies || [])[idx];
    if (!s) return;
    document.getElementById('study-editor').classList.remove('hidden');
    set('cs-title',     s.title     || '');
    set('cs-client',    s.client    || '');
    set('cs-category',  s.category  || '');
    set('cs-slug',      s.slug || s.id || '');
    set('cs-image',     s.image     || '');
    set('cs-challenge', s.challenge || '');

    const m = s.metrics || [];
    set('cs-m1', m[0] || '');
    set('cs-m2', m[1] || '');
    set('cs-m3', m[2] || '');

    if (studyQuill) {
        let rText = s.solution || s.description || '';
        if (s.results && s.results.length > 0) {
            rText += '<br><h3>Results:</h3><ul>' + s.results.map(r => `<li>${r}</li>`).join('') + '</ul>';
        }
        studyQuill.clipboard.dangerouslyPasteHTML(rText);
    }
}
function saveStudy() {
    const s = content.caseStudies.studies[currentStudyIdx];
    s.title     = get('cs-title');
    s.client    = get('cs-client');
    s.category  = get('cs-category');
    s.slug      = get('cs-slug');
    s.id        = s.slug;
    s.image     = get('cs-image');
    s.challenge = get('cs-challenge');
    s.metrics   = [get('cs-m1'), get('cs-m2'), get('cs-m3')];
    if (studyQuill) s.solution = studyQuill.root.innerHTML;
    s.description = s.solution;
    s.results = [];
    toast('Case Study updated in memory');
    renderStudyList();
}
function addStudy() {
    if (!content.caseStudies) content.caseStudies = { studies: [] };
    if (!content.caseStudies.studies) content.caseStudies.studies = [];
    content.caseStudies.studies.push({
        id: 'new', slug: 'new-study', title: 'New Case Study',
        client: '', category: '', image: '', challenge: '',
        solution: '', metrics: ['', '', '']
    });
    renderStudyList();
    loadStudy(content.caseStudies.studies.length - 1);
}
function deleteStudy() {
    content.caseStudies.studies.splice(currentStudyIdx, 1);
    document.getElementById('study-editor').classList.add('hidden');
    renderStudyList();
}

// ── BLOG ──────────────────────────────────────────────────────────────────────
function renderBlogList() {
    const list = document.getElementById('blog-list');
    if (!list) return;
    const items = (content.blog || {}).posts || [];
    list.innerHTML = items.length === 0
        ? '<p class="text-slate-500 text-xs p-2">No posts yet.</p>'
        : items.map((b, i) => `
            <div onclick="loadBlog(${i})" class="p-3 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer text-sm text-slate-300 flex justify-between group">
                <span class="truncate">${esc(b.title)}</span>
                <span class="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100">Edit</span>
            </div>
        `).join('');
}
function loadBlog(idx) {
    currentBlogIdx = idx;
    const b = ((content.blog || {}).posts || [])[idx];
    if (!b) return;
    document.getElementById('blog-editor').classList.remove('hidden');
    set('b-title',    b.title    || '');
    set('b-category', b.category || '');
    set('b-slug',     b.slug || b.id || '');
    set('b-date',     b.date     || '');
    set('b-image',    b.image    || '');
    set('b-excerpt',  b.excerpt  || '');
    if (blogQuill) blogQuill.clipboard.dangerouslyPasteHTML(b.content || '');
}
function saveBlog() {
    const b = content.blog.posts[currentBlogIdx];
    b.title    = get('b-title');
    b.category = get('b-category');
    b.slug     = get('b-slug');
    b.id       = b.slug;
    b.date     = get('b-date');
    b.image    = get('b-image');
    b.excerpt  = get('b-excerpt');
    if (blogQuill) b.content = blogQuill.root.innerHTML;
    toast('Post updated in memory');
    renderBlogList();
}
function addBlog() {
    if (!content.blog) content.blog = { posts: [] };
    if (!content.blog.posts) content.blog.posts = [];
    content.blog.posts.unshift({
        id: 'new', slug: 'new-post', title: 'New Post',
        category: '', date: new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'}),
        image: '', excerpt: '', content: ''
    });
    renderBlogList();
    loadBlog(0);
}
function deleteBlog() {
    content.blog.posts.splice(currentBlogIdx, 1);
    document.getElementById('blog-editor').classList.add('hidden');
    renderBlogList();
}

// ── SAVE ──────────────────────────────────────────────────────────────────────
function saveToDisk() {
    try {
        updateGeneralFromDOM();
        updateHomeFromDOM();
        // ensure valid structure
        if (!content) throw new Error("Content object is empty");
    } catch (e) {
        toast('❌ Validation Error: ' + e.message, 'error');
        return;
    }

    const btn = document.getElementById('save-btn');
    const orig = btn.innerHTML;
    btn.innerHTML = '<span class="animate-pulse">Saving...</span>';
    btn.disabled = true;

    fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
    })
    .then(res => {
        if (!res.ok) throw new Error('Server responded with ' + res.status);
        return res.json();
    })
    .then(data => {
        if (data.success) {
            toast('✅ Site saved & rebuild triggered!', 'success');
            // update local copy
            siteContent = JSON.parse(JSON.stringify(content));
        } else {
            toast('❌ Error saving: ' + (data.message || 'unknown'), 'error');
        }
    })
    .catch(err => toast('❌ Network error: ' + err.message, 'error'))
    .finally(() => { 
        btn.innerHTML = orig; 
        btn.disabled = false; 
    });
}

async function handleImageUpload(input, targetId, uploadType = 'general') {
    const file = input.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', uploadType);
    try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
            document.getElementById(targetId).value = data.url;
            toast('Image uploaded!');
        } else {
            toast('Upload failed: ' + data.message, 'error');
        }
    } catch(e) {
        toast('Upload error', 'error');
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function set(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}
function get(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}
function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function toast(msg, type = 'info') {
    const existing = document.querySelector('.admin-toast');
    if (existing) existing.remove();

    const t = document.createElement('div');
    t.className = 'admin-toast';
    const colors = { success: '#16a34a', error: '#dc2626', info: '#0284c7' };
    const icons = { 
        success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>', 
        error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>', 
        info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>' 
    };
    
    t.style.cssText = `position:fixed;bottom:20px;right:20px;background:${colors[type]};color:white;padding:16px 24px;border-radius:12px;font-size:15px;font-weight:600;z-index:9999;box-shadow:0 10px 25px -5px rgba(0,0,0,0.5);display:flex;align-items:center;gap:12px;transform:translateY(100px);opacity:0;transition:all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);`;
    
    t.innerHTML = `${icons[type]} <span>${msg}</span>`;
    document.body.appendChild(t);
    
    // Animate in
    requestAnimationFrame(() => {
        t.style.transform = 'translateY(0)';
        t.style.opacity = '1';
    });

    // Animate out
    setTimeout(() => { 
        t.style.transform = 'translateY(100px)';
        t.style.opacity = '0'; 
        setTimeout(() => t.remove(), 400); 
    }, 4000);
}
