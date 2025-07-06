import { generateSVGCard } from './lib/card.js';

// Test data
const testLanguages = {
  JavaScript: { percentage: "45.3" },
  TypeScript: { percentage: "28.7" },
  Python: { percentage: "12.4" },
  CSS: { percentage: "7.8" },
  HTML: { percentage: "3.2" },
  Shell: { percentage: "1.8" }
};

console.log('Testing card generation...');

// Test default theme
try {
  const defaultCard = generateSVGCard('testuser', testLanguages, 'default');
  console.log('✓ Default theme generated successfully');
  console.log(`Default card size: ${defaultCard.length} characters`);
} catch (error) {
  console.log('✗ Default theme failed:', error.message);
}

// Test pie theme
try {
  const pieCard = generateSVGCard('testuser', testLanguages, 'pie');
  console.log('✓ Pie theme generated successfully');
  console.log(`Pie card size: ${pieCard.length} characters`);
} catch (error) {
  console.log('✗ Pie theme failed:', error.message);
}

// Test wave theme
try {
  const waveCard = generateSVGCard('testuser', testLanguages, 'wave');
  console.log('✓ Wave theme generated successfully');
  console.log(`Wave card size: ${waveCard.length} characters`);
} catch (error) {
  console.log('✗ Wave theme failed:', error.message);
}

// Test grid theme
try {
  const gridCard = generateSVGCard('testuser', testLanguages, 'grid');
  console.log('✓ Grid theme generated successfully');
  console.log(`Grid card size: ${gridCard.length} characters`);
} catch (error) {
  console.log('✗ Grid theme failed:', error.message);
}

console.log('\nCard generation test completed!');