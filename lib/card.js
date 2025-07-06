const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Go: '#00ADD8',
  Swift: '#FA7343',
  Kotlin: '#A97BFF',
  Rust: '#dea584',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  PowerShell: '#012456',
  Vue: '#41b883',
  React: '#61dafb',
  Angular: '#dd0031',
  Svelte: '#ff3e00',
  SCSS: '#c6538c',
  Sass: '#a53b70',
  Less: '#1d365d'
};

function getLanguageColor(language) {
  return LANGUAGE_COLORS[language] || '#858585';
}

function generateDefaultCard(username, languages) {
  const width = 495;
  const cardHeight = 195;
  const barHeight = 8;
  const titleHeight = 35;
  const padding = 25;
  const languageItemHeight = 20;
  
  const languageEntries = Object.entries(languages);
  const displayLanguages = languageEntries.slice(0, 6);
  
  let svg = `<svg width="${width}" height="${cardHeight}" viewBox="0 0 ${width} ${cardHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #2f80ed; }
    .lang-name { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #333; }
    .lang-percent { font: 600 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #333; }
  </style>
  
  <rect x="0.5" y="0.5" rx="4.5" height="99%" stroke="#e4e2e2" width="${width - 1}" fill="#fffefe" stroke-opacity="1" />
  
  <text x="${padding}" y="${titleHeight}" class="header">Most Used Languages</text>`;

  let barX = padding;
  const barY = 50;
  const barWidth = width - (padding * 2);
  
  svg += `\n  <g transform="translate(${barX}, ${barY})">`;
  
  let currentX = 0;
  for (const [language, data] of displayLanguages) {
    const segmentWidth = (parseFloat(data.percentage) / 100) * barWidth;
    const color = getLanguageColor(language);
    
    svg += `\n    <rect x="${currentX}" y="0" width="${segmentWidth}" height="${barHeight}" fill="${color}" />`;
    currentX += segmentWidth;
  }
  
  svg += `\n  </g>`;
  
  const legendY = barY + barHeight + 20;
  const columnWidth = (width - padding * 2) / 2;
  
  displayLanguages.forEach(([language, data], index) => {
    const column = index < 3 ? 0 : 1;
    const row = index % 3;
    const x = padding + (column * columnWidth);
    const y = legendY + (row * languageItemHeight);
    const color = getLanguageColor(language);
    
    svg += `\n  <g transform="translate(${x}, ${y})">
    <circle cx="5" cy="6" r="5" fill="${color}" />
    <text x="15" y="10" class="lang-name">${language}</text>
    <text x="${columnWidth - 40}" y="10" class="lang-percent">${data.percentage}%</text>
  </g>`;
  });
  
  svg += '\n</svg>';
  
  return svg;
}

function generateCompactCard(username, languages) {
  const width = 350;
  const cardHeight = 150;
  const padding = 20;
  const titleHeight = 30;
  
  const languageEntries = Object.entries(languages);
  const displayLanguages = languageEntries.slice(0, 5);
  
  let svg = `<svg width="${width}" height="${cardHeight}" viewBox="0 0 ${width} ${cardHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .header { font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif; fill: #2f80ed; }
    .lang-name { font: 400 10px 'Segoe UI', Ubuntu, Sans-Serif; fill: #333; }
    .lang-percent { font: 600 10px 'Segoe UI', Ubuntu, Sans-Serif; fill: #333; }
  </style>
  
  <rect x="0.5" y="0.5" rx="4.5" height="99%" stroke="#e4e2e2" width="${width - 1}" fill="#fffefe" stroke-opacity="1" />
  
  <text x="${padding}" y="${titleHeight}" class="header">Languages</text>`;

  const barStartY = 45;
  const barHeight = 6;
  const barSpacing = 18;
  const maxBarWidth = width - padding * 2 - 80;
  
  displayLanguages.forEach(([language, data], index) => {
    const y = barStartY + index * barSpacing;
    const barWidth = (parseFloat(data.percentage) / 100) * maxBarWidth;
    const color = getLanguageColor(language);
    
    svg += `\n  <g transform="translate(${padding}, ${y})">
    <circle cx="4" cy="4" r="4" fill="${color}" />
    <text x="12" y="7" class="lang-name">${language}</text>
    <rect x="80" y="1" width="${barWidth}" height="${barHeight}" fill="${color}" rx="3" />
    <text x="${maxBarWidth + 85}" y="7" class="lang-percent">${data.percentage}%</text>
  </g>`;
  });
  
  svg += '\n</svg>';
  
  return svg;
}

function generateDonutCard(username, languages) {
  const width = 495;
  const cardHeight = 200;
  const padding = 25;
  const titleHeight = 35;
  
  const languageEntries = Object.entries(languages);
  const displayLanguages = languageEntries.slice(0, 6);
  
  let svg = `<svg width="${width}" height="${cardHeight}" viewBox="0 0 ${width} ${cardHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #2f80ed; }
    .lang-name { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #333; }
    .lang-percent { font: 600 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #333; }
  </style>
  
  <rect x="0.5" y="0.5" rx="4.5" height="99%" stroke="#e4e2e2" width="${width - 1}" fill="#fffefe" stroke-opacity="1" />
  
  <text x="${padding}" y="${titleHeight}" class="header">Most Used Languages</text>`;

  const centerX = 120;
  const centerY = 110;
  const radius = 40;
  const innerRadius = 25;
  
  let currentAngle = -90;
  
  displayLanguages.forEach(([language, data]) => {
    const percentage = parseFloat(data.percentage);
    const angle = (percentage / 100) * 360;
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const startOuterX = centerX + radius * Math.cos(currentAngle * Math.PI / 180);
    const startOuterY = centerY + radius * Math.sin(currentAngle * Math.PI / 180);
    const endOuterX = centerX + radius * Math.cos((currentAngle + angle) * Math.PI / 180);
    const endOuterY = centerY + radius * Math.sin((currentAngle + angle) * Math.PI / 180);
    
    const startInnerX = centerX + innerRadius * Math.cos(currentAngle * Math.PI / 180);
    const startInnerY = centerY + innerRadius * Math.sin(currentAngle * Math.PI / 180);
    const endInnerX = centerX + innerRadius * Math.cos((currentAngle + angle) * Math.PI / 180);
    const endInnerY = centerY + innerRadius * Math.sin((currentAngle + angle) * Math.PI / 180);
    
    const path = `M ${startInnerX} ${startInnerY} L ${startOuterX} ${startOuterY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY} L ${endInnerX} ${endInnerY} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInnerX} ${startInnerY} Z`;
    
    const color = getLanguageColor(language);
    
    svg += `\n  <path d="${path}" fill="${color}" />`;
    
    currentAngle += angle;
  });
  
  const legendX = 250;
  const legendY = 60;
  const itemHeight = 20;
  
  displayLanguages.forEach(([language, data], index) => {
    const y = legendY + index * itemHeight;
    const color = getLanguageColor(language);
    
    svg += `\n  <g transform="translate(${legendX}, ${y})">
    <circle cx="5" cy="6" r="5" fill="${color}" />
    <text x="15" y="10" class="lang-name">${language}</text>
    <text x="150" y="10" class="lang-percent">${data.percentage}%</text>
  </g>`;
  });
  
  svg += '\n</svg>';
  
  return svg;
}

export function generateSVGCard(username, languages, theme = 'default') {
  switch (theme) {
    case 'compact':
      return generateCompactCard(username, languages);
    case 'donut':
      return generateDonutCard(username, languages);
    case 'default':
    default:
      return generateDefaultCard(username, languages);
  }
}