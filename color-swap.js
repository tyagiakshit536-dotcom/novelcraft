const fs = require('fs');

const filePaths = [
  'public/landing-content.html',
  'public/login.html'
];

const colorMap = {
  // Backgrounds / Darks
  '#0E0E1A': '#1A0E0E',
  '#16162A': '#2A1616',
  '#2A2A45': '#452A2A',
  '#1a1a30': '#301a1a',
  '#3a3a5a': '#5a3a3a',
  '#1e1e38': '#381e1e',
  '#0a0a14': '#140a0a',
  
  // Texts / Lights
  '#F0EEFF': '#FFF0F0',
  '#C8C4F0': '#F0C4C4',
  '#9090B0': '#B09090',
  
  // Brand Accents
  '#6C63FF': '#FF4B4B', 
  '#8079FF': '#FF6B6B', 
  
  // RGBA strings
  'rgba(108, 99, 255': 'rgba(255, 75, 75',
  'rgba(14, 14, 26': 'rgba(26, 14, 14',
  'rgba(42, 42, 69': 'rgba(69, 42, 42',
  'rgba(22, 22, 42': 'rgba(42, 22, 22'
};

filePaths.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let count = 0;
  
  for (const [blue, red] of Object.entries(colorMap)) {
    // Escape regex
    const regex = new RegExp(blue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    if (matches) {
       content = content.replace(regex, red);
       count += matches.length;
    }
  }
  
  // lowercase hexes
  const lowerMap = {};
  for (const [k, v] of Object.entries(colorMap)) {
    if (k.startsWith('#')) {
      lowerMap[k.toLowerCase()] = v;
    }
  }
  
  for (const [blue, red] of Object.entries(lowerMap)) {
    const regex = new RegExp(blue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    if (matches) {
       content = content.replace(regex, red);
       count += matches.length;
    }
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Replaced ${count} colors in ${filePath}`);
});
