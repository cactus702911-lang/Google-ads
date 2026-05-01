// js/data-loader.js

// JSON Schema definition for site data (Basic Validator)
const siteDataSchema = {
    type: "object",
    required: ["header", "footer", "home"],
    properties: {
        header: { type: "object" },
        footer: { type: "object" },
        home: { type: "object" }
    }
};

function validateSchema(data, schema) {
    if (!data || typeof data !== 'object') {
        throw new Error("Invalid data format: Expected JSON object.");
    }
    for (const req of schema.required) {
        if (!data[req]) {
            throw new Error(`Schema Validation Error: Missing required field '${req}'.`);
        }
    }
    return true;
}

function showLoadingState() {
    if (document.getElementById('site-loader')) return;
    const loader = document.createElement('div');
    loader.id = 'site-loader';
    loader.innerHTML = `
        <div class="fixed inset-0 bg-slate-900 z-[9999] flex flex-col items-center justify-center">
            <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <div class="text-blue-400 font-medium animate-pulse">Loading content...</div>
        </div>
    `;
    document.body.appendChild(loader);
}

function hideLoadingState() {
    const loader = document.getElementById('site-loader');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.3s ease';
        setTimeout(() => loader.remove(), 300);
    }
}

function showErrorState(msg, code = 500) {
    hideLoadingState();
    const errorEl = document.createElement('div');
    errorEl.className = 'fixed inset-0 bg-slate-900 z-[9999] flex items-center justify-center text-white text-center p-4';
    errorEl.innerHTML = `
        <div class="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full">
            <div class="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h2 class="text-3xl font-bold text-white mb-2">Error ${code}</h2>
            <p class="text-slate-400 mb-8">${msg}</p>
            <button onclick="window.location.reload()" class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors rounded-xl font-bold">Try Again</button>
        </div>
    `;
    document.body.appendChild(errorEl);
}

async function loadSiteData(pageName) {
    if (window.siteContent) {
        const data = window.siteContent;
        if (data.seo) {
            if (data.seo.siteTitle) document.title = data.seo.siteTitle;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc && data.seo.siteDescription) metaDesc.setAttribute('content', data.seo.siteDescription);
        }
        return {
            common: { header: data.header, footer: data.footer, notification: data.notification, social: data.social },
            pageData: data[pageName] || null,
            fullData: data
        };
    }

    showLoadingState();
    try {
        const response = await fetch('/api/content', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw { status: response.status, message: `HTTP Error: ${response.statusText}` };
        }
        
        const data = await response.json();
        
        // Schema Check
        validateSchema(data, siteDataSchema);
        
        hideLoadingState();
        
        // Inject common meta tags if available
        if (data.seo) {
            if (data.seo.siteTitle) document.title = data.seo.siteTitle;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc && data.seo.siteDescription) metaDesc.setAttribute('content', data.seo.siteDescription);
        }

        // Return specific page data and common data
        return {
            common: { header: data.header, footer: data.footer, notification: data.notification, social: data.social },
            pageData: data[pageName] || null,
            fullData: data
        };

    } catch (error) {
        console.error("[Data Loader Error]:", error);
        const code = error.status || 500;
        const msg = error.message || "Failed to load site data. Please check your connection.";
        showErrorState(msg, code);
        return null;
    }
}

window.loadSiteData = loadSiteData;
