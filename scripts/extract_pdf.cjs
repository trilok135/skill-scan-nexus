const fs = require('fs');

// Read raw PDF and extract visible text between stream markers
const pdfPath = 'd:\\Memes and shit\\skillmatchmain\\skillmatch-connect-main\\TrilokKrResume (1).pdf';
const buf = fs.readFileSync(pdfPath, 'latin1');

// Extract text between BT (begin text) and ET (end text) operators
const btMatches = buf.match(/BT[\s\S]*?ET/g) || [];

const texts = [];
for (const block of btMatches) {
    // Match text inside parentheses (PDF text strings)
    const strMatches = block.match(/\(([^)]+)\)/g) || [];
    for (const s of strMatches) {
        const inner = s.slice(1, -1).trim();
        if (inner.length > 1) texts.push(inner);
    }
}

const result = texts.join(' ');
console.log(result);
