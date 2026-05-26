const fs = require('fs'); 
let t = fs.readFileSync('src/pages/Rituels.jsx', 'utf8'); 
t = t.replace(/\ufffd\"/g, "'"); 
fs.writeFileSync('src/pages/Rituels.jsx', t, 'utf8');
