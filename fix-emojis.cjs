const fs = require('fs');
const path = require('path');

const r = [
  { from: "ì raison", to: "À raison" },
  { from: "qu\"un", to: "qu'un" },
  { from: "d\"h", to: "d'h" },
  { from: "\uFFFD0d", to: "Éd" },
  { from: "\uFFFD0ES", to: "ÉES" },
  { from: "\uFFFD0S", to: "ÉS" },
  { from: "\uFFFD0E", to: "ÉE" },
  { from: "\uFFFD0C", to: "ÉC" },
  { from: "\uFFFD uvre", to: "œuvre" },
  { from: "\uFFFD0c", to: "Éc" },
  { from: "\uFFFD0 ", to: "É " },
  { from: "ASSEMBL\uFFFD0 ì", to: "ASSEMBLÉ À" },
  { from: "PR\uFFFD`T ì", to: "PRÊT À" },
  { from: "ID\uFFFD0AL", to: "IDÉAL" },
  { from: "\uFFFD0t", to: "Ét" },
  { from: "\uFFFD \uFFFD", to: "€" },
  { from: "\uFFFD\uFFFD", to: "€" },
  { from: "\uFFFDR ", to: "❌ " },
  { from: "\uFFFDS& ", to: "📧 " },
  { from: "\uFFFDS&", to: "⚖️ " },
  { from: "\uFFFDxR\uFFFD", to: "🌿" },
  { from: "\uFFFDx \uFFFD", to: "📦" },
  { from: "\uFFFDx   ", to: "🔒 " },
  { from: "\uFFFDܥ ", to: "⚖️ " },
  { from: "\uFFFDS\uFFFD", to: "✨ " },
  { from: "\uFFFD  ", to: "— " },
  { from: "\uFFFD ", to: "— " },
  { from: " \uFFFD", to: " €" },
];

function fix(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  r.forEach(rule => {
    content = content.split(rule.from).join(rule.to);
  });

  if (filePath.includes('Profile.jsx')) {
      content = content.replace(/'\uFFFD'/g, "'-'");
  }
  
  content = content.replace(/\uFFFD/g, "");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', filePath);
  }
}

function scan(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      scan(p);
    } else if (p.endsWith('.jsx') || p.endsWith('.js') || p.endsWith('.html')) {
      fix(p);
    }
  });
}

scan('src');
scan('backend');
fix('index.html');
console.log('Done.');
