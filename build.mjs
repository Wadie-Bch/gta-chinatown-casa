/* Wraps src/app.html (the artifact-shaped body) into a standalone index.html */
import { readFileSync, writeFileSync } from 'node:fs';

const body = readFileSync('src/app.html', 'utf8');
const out = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#0b0f14">
<meta name="description" content="Casa Wars - a top-down 2.5D Chinatown-Wars-style action game set in a fictional Casablanca. Plays on desktop with WASD + mouse and on mobile with twin sticks.">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta property="og:title" content="Casa Wars">
<meta property="og:description" content="Top-down 2.5D action in a fictional Casablanca. Desktop + mobile.">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='26' font-size='26'>%F0%9F%9A%95</text></svg>">
<style>html,body{margin:0;padding:0}img{max-width:100%}[hidden]{display:none!important}</style>
${body}
</body>
</html>
`;
writeFileSync('index.html', out);
console.log('index.html written:', (out.length / 1024).toFixed(1), 'KB');
