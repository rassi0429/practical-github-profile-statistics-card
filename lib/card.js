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
  const width = 600;
  const cardHeight = 320;
  const barHeight = 12;
  const titleHeight = 45;
  const padding = 32;
  const languageItemHeight = 28;
  
  const languageEntries = Object.entries(languages);
  const displayLanguages = languageEntries.slice(0, 6);
  
  let svg = `<svg width="${width}" height="${cardHeight}" viewBox="0 0 ${width} ${cardHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#161b22;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1f2937;stop-opacity:1" />
    </linearGradient>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="20" stdDeviation="20" flood-color="#000" flood-opacity="0.4"/>
      <feDropShadow dx="0" dy="0" stdDeviation="40" flood-color="#40c0ff" flood-opacity="0.1"/>
    </filter>
    <filter id="glowEffect" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <style>
    .header { font: 600 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; fill: #f0f6fc; letter-spacing: -0.5px; }
    .subtitle { font: 400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; fill: #8b949e; }
    .lang-name { font: 500 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; fill: #f0f6fc; }
    .lang-percent { font: 600 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; fill: #8b949e; }
  </style>
  
  <rect x="0" y="0" rx="16" height="100%" width="${width}" fill="url(#bgGradient)" filter="url(#cardShadow)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  
  <g transform="translate(${padding}, 20)">
    <g transform="scale(1.5)">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" fill="#8b949e"/>
    </g>
    <text x="48" y="22" class="header">Language Statistics</text>
    <text x="48" y="40" class="subtitle">Repository Composition Analysis</text>
  </g>`;

  let barX = padding;
  const barY = 75;
  const barWidth = width - (padding * 2);
  
  svg += `\n  <g transform="translate(${barX}, ${barY})">
    <rect x="0" y="0" width="${barWidth}" height="${barHeight}" fill="#161b22" rx="6" />
    <rect x="0" y="0" width="${barWidth}" height="${barHeight}" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1" rx="6" style="filter: inset 0 2px 4px rgba(0, 0, 0, 0.3);" />`;
  
  let currentX = 0;
  for (const [language, data] of displayLanguages) {
    const segmentWidth = (parseFloat(data.percentage) / 100) * barWidth;
    const color = getLanguageColor(language);
    
    svg += `\n    <rect x="${currentX}" y="0" width="${segmentWidth}" height="${barHeight}" fill="${color}" rx="6" />`;
    currentX += segmentWidth;
  }
  
  svg += `\n  </g>`;
  
  const legendY = barY + barHeight + 32;
  
  displayLanguages.forEach(([language, data], index) => {
    const y = legendY + (index * languageItemHeight);
    const color = getLanguageColor(language);
    
    svg += `\n  <g transform="translate(${padding}, ${y})">
    <rect x="0" y="0" width="${width - padding * 2}" height="${languageItemHeight - 4}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" rx="8" />
    <circle cx="16" cy="${(languageItemHeight - 4) / 2}" r="8" fill="${color}" filter="url(#glowEffect)" />
    <text x="36" y="${(languageItemHeight - 4) / 2 + 5}" class="lang-name">${language}</text>
    <text x="${width - padding * 2 - 60}" y="${(languageItemHeight - 4) / 2 + 5}" class="lang-percent">${data.percentage}%</text>
  </g>`;
  });
  
  svg += '\n</svg>';
  
  return svg;
}

function generatePieCard(username, languages) {
  const width = 520;
  const cardHeight = 350;
  const padding = 32;
  
  const languageEntries = Object.entries(languages);
  const displayLanguages = languageEntries.slice(0, 8);
  
  let svg = `<svg width="${width}" height="${cardHeight}" viewBox="0 0 ${width} ${cardHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradientPie" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#161b22;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1f2937;stop-opacity:1" />
    </linearGradient>
    <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="20" stdDeviation="20" flood-color="#000" flood-opacity="0.4"/>
      <feDropShadow dx="0" dy="0" stdDeviation="40" flood-color="#40c0ff" flood-opacity="0.1"/>
    </filter>
    <filter id="pieGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <style>
    .header { font: 600 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; fill: #f0f6fc; letter-spacing: -0.5px; }
    .subtitle { font: 400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; fill: #8b949e; }
    .lang-name { font: 500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; fill: #f0f6fc; }
    .lang-percent { font: 600 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; fill: #8b949e; }
  </style>
  
  <rect x="0" y="0" rx="16" height="100%" width="${width}" fill="url(#bgGradientPie)" filter="url(#pieShadow)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  
  <g transform="translate(${padding}, 20)">
    <g transform="scale(1.5)">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" fill="#8b949e"/>
    </g>
    <text x="48" y="22" class="header">Language Distribution</text>
    <text x="48" y="40" class="subtitle">Circular Composition View</text>
  </g>`;

  const centerX = 140;
  const centerY = 200;
  const radius = 75;
  
  let currentAngle = -90;
  
  displayLanguages.forEach(([language, data], index) => {
    const percentage = parseFloat(data.percentage);
    const angle = (percentage / 100) * 360;
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const startX = centerX + radius * Math.cos(currentAngle * Math.PI / 180);
    const startY = centerY + radius * Math.sin(currentAngle * Math.PI / 180);
    const endX = centerX + radius * Math.cos((currentAngle + angle) * Math.PI / 180);
    const endY = centerY + radius * Math.sin((currentAngle + angle) * Math.PI / 180);
    
    const path = `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    
    const color = getLanguageColor(language);
    
    svg += `\n  <path d="${path}" fill="${color}" stroke="rgba(255,255,255,0.1)" stroke-width="2" opacity="0.9" filter="url(#pieGlow)" />`;
    
    currentAngle += angle;
  });
  
  const legendX = 280;
  const legendY = 100;
  const itemHeight = 26;
  const maxLegendItems = 8;
  
  displayLanguages.slice(0, maxLegendItems).forEach(([language, data], index) => {
    const y = legendY + index * itemHeight;
    const color = getLanguageColor(language);
    
    svg += `\n  <g transform="translate(${legendX}, ${y})">
    <rect x="0" y="0" width="${width - legendX - padding}" height="${itemHeight - 4}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" rx="8" />
    <circle cx="16" cy="10" r="6" fill="${color}" filter="url(#pieGlow)" />
    <text x="30" y="14" class="lang-name">${language}</text>
    <text x="${width - legendX - padding - 50}" y="14" class="lang-percent">${data.percentage}%</text>
  </g>`;
  });
  
  svg += '\n</svg>';
  
  return svg;
}

function generateWaveCard(username, languages) {
  const width = 600;
  const cardHeight = 280;
  const padding = 32;
  
  const languageEntries = Object.entries(languages);
  const displayLanguages = languageEntries.slice(0, 6);
  
  let svg = `<svg width="${width}" height="${cardHeight}" viewBox="0 0 ${width} ${cardHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="card-clip">
      <rect x="0" y="0" rx="16" width="${width}" height="${cardHeight}" />
    </clipPath>
    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1117;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#161b22;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#21262d;stop-opacity:1" />
    </linearGradient>
    <filter id="waveShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="20" stdDeviation="20" flood-color="#000" flood-opacity="0.4"/>
      <feDropShadow dx="0" dy="0" stdDeviation="40" flood-color="#40c0ff" flood-opacity="0.1"/>
    </filter>
    <filter id="waveGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <style>
    .header { font: 600 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; fill: #f0f6fc; letter-spacing: -0.5px; }
    .subtitle { font: 400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; fill: #8b949e; }
    .lang-name { font: 500 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; fill: #f0f6fc; }
    .lang-percent { font: 600 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; fill: #40c0ff; text-shadow: 0 0 10px rgba(64, 192, 255, 0.5); }
  </style>
  
  <rect x="0" y="0" width="${width}" height="${cardHeight}" fill="url(#waveGradient)" clip-path="url(#card-clip)" filter="url(#waveShadow)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  
  <g transform="translate(${padding}, 20)">
    <g transform="scale(1.5)">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" fill="#8b949e"/>
    </g>
    <text x="48" y="22" class="header">Language Waves</text>
    <text x="48" y="40" class="subtitle">Dynamic Flow Visualization</text>
  </g>`;

  let yOffset = 0;
  displayLanguages.forEach(([language, data], index) => {
    const percentage = parseFloat(data.percentage);
    const waveHeight = (percentage / 100) * 180 + 60;
    const color = getLanguageColor(language);
    
    const path = `M 0,${cardHeight - yOffset} 
                  Q ${width * 0.25},${cardHeight - yOffset - 20} ${width * 0.5},${cardHeight - yOffset}
                  T ${width},${cardHeight - yOffset}
                  L ${width},${cardHeight}
                  L 0,${cardHeight} Z`;
    
    svg += `\n  <path d="${path}" fill="${color}" opacity="${0.8 - index * 0.1}" filter="url(#waveGlow)" />`;
    yOffset += waveHeight / displayLanguages.length;
  });


  const startY = 85;
  displayLanguages.forEach(([language, data], index) => {
    const y = startY + index * 26;
    const color = getLanguageColor(language);
    
    svg += `\n  <g transform="translate(${padding}, ${y})">
    <rect x="0" y="0" width="${width - padding * 2}" height="22" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" rx="8" />
    <rect x="8" y="6" width="35" height="10" fill="${color}" rx="5" filter="url(#waveGlow)" />
    <text x="55" y="16" class="lang-name">${language}</text>
    <text x="${width - padding * 2 - 80}" y="16" text-anchor="end" class="lang-percent">${data.percentage}%</text>
  </g>`;
  });
  
  svg += '\n</svg>';
  
  return svg;
}

function generateGridCard(username, languages) {
  const width = 520;
  const cardHeight = 360;
  const padding = 32;
  
  const languageEntries = Object.entries(languages);
  const displayLanguages = languageEntries.slice(0, 9);
  
  let svg = `<svg width="${width}" height="${cardHeight}" viewBox="0 0 ${width} ${cardHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradientGrid" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#161b22;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1f2937;stop-opacity:1" />
    </linearGradient>
    <filter id="cardShadowGrid" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="20" stdDeviation="20" flood-color="#000" flood-opacity="0.4"/>
      <feDropShadow dx="0" dy="0" stdDeviation="40" flood-color="#40c0ff" flood-opacity="0.1"/>
    </filter>
    <filter id="cellShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.3"/>
    </filter>
    <filter id="gridGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <style>
    .header { font: 600 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; fill: #f0f6fc; letter-spacing: -0.5px; }
    .subtitle { font: 400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; fill: #8b949e; }
    .lang-name { font: 500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; fill: #fff; }
    .lang-percent { font: 700 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif; fill: #fff; opacity: 0.95; text-shadow: 0 0 10px rgba(255,255,255,0.3); }
  </style>
  
  <rect x="0" y="0" rx="16" width="${width}" height="${cardHeight}" fill="url(#bgGradientGrid)" filter="url(#cardShadowGrid)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  
  <g transform="translate(${padding}, 20)">
    <g transform="scale(1.5)">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" fill="#8b949e"/>
    </g>
    <text x="48" y="22" class="header">Language Grid</text>
    <text x="48" y="40" class="subtitle">Organized Matrix View</text>
  </g>`;

  const gridSize = 3;
  const cellWidth = 130;
  const cellHeight = 75;
  const gridStartX = (width - cellWidth * gridSize - 20 * (gridSize - 1)) / 2;
  const gridStartY = 85;
  
  displayLanguages.forEach(([language, data], index) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const x = gridStartX + col * (cellWidth + 20);
    const y = gridStartY + row * (cellHeight + 20);
    const color = getLanguageColor(language);
    const percentage = parseFloat(data.percentage);
    
    svg += `\n  <g transform="translate(${x}, ${y})">
    <rect x="0" y="0" width="${cellWidth}" height="${cellHeight}" fill="${color}" rx="16" filter="url(#cellShadow)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <circle cx="20" cy="20" r="8" fill="rgba(255,255,255,0.3)" filter="url(#gridGlow)" />
    <text x="${cellWidth/2}" y="40" text-anchor="middle" class="lang-name">${language}</text>
    <text x="${cellWidth/2}" y="65" text-anchor="middle" class="lang-percent">${percentage}%</text>
  </g>`;
  });
  
  svg += '\n</svg>';
  
  return svg;
}

export function generateSVGCard(username, languages, theme = 'default') {
  switch (theme) {
    case 'pie':
      return generatePieCard(username, languages);
    case 'wave':
      return generateWaveCard(username, languages);
    case 'grid':
      return generateGridCard(username, languages);
    case 'default':
    default:
      return generateDefaultCard(username, languages);
  }
}