// Wraps the artifact body (src/ninja-sabar.html) into a standalone index.html.
const fs = require('fs'), path = require('path');
const body = fs.readFileSync(path.join(__dirname, '../src/ninja-sabar.html'), 'utf8');
const html = '<!doctype html>\n<html lang="id">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">\n'
  + body.replace(/<div id="app">/, '</head>\n<body>\n<div id="app">') + '\n</body>\n</html>\n';
fs.writeFileSync(path.join(__dirname, '../index.html'), html);
console.log('index.html', html.length, 'bytes');
