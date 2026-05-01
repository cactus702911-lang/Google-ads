const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execFile } = require('child_process');

function runBuild() {
    execFile('node', ['build_site.js'], { cwd: __dirname }, (err, stdout, stderr) => {
        if (err) {
            console.error('[Build Error]', stderr);
        } else {
            console.log('[Build] Site rebuilt successfully.', stdout.trim());
        }
    });
}

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'site_data.js');
const LEADS_FILE = path.join(__dirname, 'leads.json');
const UPLOAD_DIR = path.join(__dirname, 'images');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)){
    fs.mkdirSync(UPLOAD_DIR);
}

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'image/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    // API: Save Content
    if (req.url === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                // Ensure JSON is valid before saving
                const newData = JSON.parse(body);
                
                // Write as a valid JavaScript module
                const fileContent = `var siteContent = ${JSON.stringify(newData, null, 4)};`;
                
                fs.writeFile(DATA_FILE, fileContent, 'utf8', (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Error writing data file' }));
                        return;
                    }
                    
                    // Trigger sitemap generation if it exists (Optional/mock)
                    // generateSitemap(newData); 
                    
                    // Run rebuild
                    runBuild();
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Data saved successfully' }));
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Invalid JSON payload' }));
            }
        });
        return;
    }

    // API: Upload Image
    if (req.url === '/api/upload' && req.method === 'POST') {
        const boundary = req.headers['content-type'].split('; boundary=')[1];
        let body = [];
        
        req.on('data', (chunk) => body.push(chunk));
        req.on('end', () => {
            const buffer = Buffer.concat(body);
            const data = buffer.toString('binary'); // Use binary for raw parsing
            
            // Simple multipart/form-data parser
            const parts = data.split('--' + boundary);
            
            for (let part of parts) {
                if (part.includes('filename="')) {
                    const filenameMatch = part.match(/filename="(.+?)"/);
                    if (!filenameMatch) continue;
                    
                    const originalFilename = filenameMatch[1];
                    const ext = path.extname(originalFilename);
                    const newFilename = Date.now() + ext;
                    
                    // Extract file content (after double CRLF)
                    const contentStart = part.indexOf('\r\n\r\n') + 4;
                    const contentEnd = part.lastIndexOf('\r\n');
                    const fileData = buffer.slice(
                        buffer.indexOf(part) + contentStart, 
                        buffer.indexOf(part) + contentEnd
                    );
                    
                    // Save file
                    fs.writeFile(path.join(UPLOAD_DIR, newFilename), fileData, (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, message: 'File save error' }));
                        } else {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, url: `/images/${newFilename}` }));
                        }
                    });
                    return; // Only process first file
                }
            }
            
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'No file uploaded' }));
        });
        return;
    }

    // API: Submit Lead
    if (req.url === '/api/leads' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const newLead = JSON.parse(body);
                newLead.id = Date.now();
                newLead.date = new Date().toISOString().split('T')[0];
                newLead.status = 'New';

                fs.readFile(LEADS_FILE, 'utf8', (err, data) => {
                    let leads = [];
                    if (!err && data) {
                        try { leads = JSON.parse(data); } catch(e) {}
                    }
                    leads.unshift(newLead); // Add to top
                    
                    fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 4), (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, message: 'Error saving lead' }));
                        } else {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, message: 'Lead submitted successfully' }));
                        }
                    });
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
            }
        });
        return;
    }

    // API: Get Leads
    if (req.url === '/api/leads' && req.method === 'GET') {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        fs.readFile(LEADS_FILE, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end('[]'); // Return empty array if file missing
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            }
        });
        return;
    }

    // API: Get Content
    if (req.url === '/api/content' && req.method === 'GET') {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        fs.readFile(DATA_FILE, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Data not found' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                // Strip the JS wrapper so the admin panel gets raw JSON
                let jsonData = data.replace(/^var\s+siteContent\s*=\s*/, '').replace(/;[\s\n]*$/, '');
                res.end(jsonData);
            }
        });
        return;
    }

    // Serve Static Files
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    let urlPath = parsedUrl.pathname;
    let filePath = '.' + urlPath;
    
    // Route Handling - serve statically generated folders first
    if (urlPath.startsWith('/case-study/') && urlPath !== '/case-study/') {
        // Serve statically generated case-study page
        filePath = '.' + urlPath.replace(/\/$/, '') + '/index.html';
    } else if (urlPath.startsWith('/blog/') && urlPath !== '/blog/') {
        filePath = '.' + urlPath.replace(/\/$/, '') + '/index.html';
    } else if (urlPath.startsWith('/services/') && urlPath !== '/services/') {
        filePath = '.' + urlPath.replace(/\/$/, '') + '/index.html';
    } else if (urlPath.startsWith('/images/')) {
        filePath = '.' + urlPath; // Serve uploaded images
    } else if (urlPath === '/portfolio' || urlPath === '/shop') {
        filePath = './portfolio.html';
    } else if (urlPath === '/team') {
        filePath = './team.html';
    } else if (filePath === './' || filePath === './index') {
        filePath = './index.html';
    } else if (!path.extname(filePath) && !urlPath.startsWith('/api/')) {
        filePath += '.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(path.join(__dirname, filePath), (error, content) => {
        if (error) {
            if(error.code == 'ENOENT') {
                fs.readFile(path.join(__dirname, '404.html'), (err, fallbackContent) => {
                    if (err) {
                        res.writeHead(404);
                        res.end('404 Not Found');
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(fallbackContent, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
            }
        } else {
            let headers = { 'Content-Type': contentType };
            
            // Setup Caching (Step 4 optimization)
            if (filePath.match(/\.(css|js|webp|jpg|png|gif|svg|woff|woff2)$/)) {
                // Static assets cache for 1 year (immutable)
                headers['Cache-Control'] = 'public, max-age=31536000, immutable';
            } else {
                // HTML files cache for short duration or rely on revalidation
                headers['Cache-Control'] = 'public, max-age=3600';
            }

            // Setup Compression (Brotli/Gzip) (Step 6 optimization)
            const acceptEncoding = req.headers['accept-encoding'] || '';
            
            if (acceptEncoding.match(/\bbr\b/)) {
                headers['Content-Encoding'] = 'br';
                res.writeHead(200, headers);
                res.end(zlib.brotliCompressSync(content));
            } else if (acceptEncoding.match(/\bgzip\b/)) {
                headers['Content-Encoding'] = 'gzip';
                res.writeHead(200, headers);
                res.end(zlib.gzipSync(content));
            } else {
                res.writeHead(200, headers);
                res.end(content, 'utf-8');
            }
        }
    });
});

function handlePostRequest(req, res, filePath, callback) {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            // Format as JS
            const jsContent = 'var siteContent = ' + JSON.stringify(data, null, 4) + ';\n';
            fs.writeFile(filePath, jsContent, (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Error saving data' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                    if(callback) callback(data);
                }
            });
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Invalid JSON data' }));
        }
    });
}

function generateSitemap(data) {
    const baseUrl = "https://digitalgrowth24.agency";
    const date = new Date().toISOString().split('T')[0];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>${baseUrl}/</loc><lastmod>${date}</lastmod><priority>1.0</priority></url>
    <url><loc>${baseUrl}/portfolio</loc><lastmod>${date}</lastmod><priority>0.9</priority></url>
    <url><loc>${baseUrl}/services</loc><lastmod>${date}</lastmod><priority>0.8</priority></url>
    <url><loc>${baseUrl}/about</loc><lastmod>${date}</lastmod><priority>0.7</priority></url>
    <url><loc>${baseUrl}/team</loc><lastmod>${date}</lastmod><priority>0.7</priority></url>
    <url><loc>${baseUrl}/blog</loc><lastmod>${date}</lastmod><priority>0.7</priority></url>
    <url><loc>${baseUrl}/contact</loc><lastmod>${date}</lastmod><priority>0.7</priority></url>
`;

    if (data.caseStudies && data.caseStudies.studies) {
        data.caseStudies.studies.forEach(study => {
            const slug = study.slug || study.id;
            xml += `    <url><loc>${baseUrl}/case-study/${slug}</loc><priority>0.8</priority></url>\n`;
        });
    }

    if (data.blog && data.blog.posts) {
        data.blog.posts.forEach(post => {
            const slug = post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            xml += `    <url><loc>${baseUrl}/blog/${slug}</loc><priority>0.7</priority></url>\n`;
        });
    }

    xml += '</urlset>';

    fs.writeFile(path.join(__dirname, 'sitemap.xml'), xml, (err) => {
        if (err) console.error('Error generating sitemap:', err);
    });
}

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
