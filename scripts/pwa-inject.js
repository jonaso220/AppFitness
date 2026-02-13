/**
 * Post-build script: injects PWA meta tags into dist/index.html
 */
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'dist', 'index.html');

if (!fs.existsSync(htmlPath)) {
  console.error('dist/index.html not found. Run build first.');
  process.exit(1);
}

let html = fs.readFileSync(htmlPath, 'utf-8');

const pwaTags = `
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#6C5CE7" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="AppFitness" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />`;

// Insert before </head>
if (!html.includes('rel="manifest"')) {
  html = html.replace('</head>', pwaTags + '\n  </head>');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log('PWA meta tags injected into dist/index.html');
} else {
  console.log('PWA meta tags already present, skipping.');
}
