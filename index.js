import express from 'express';
import dotenv from 'dotenv';
import { fetchUserLanguages } from './lib/github.js';
import { generateSVGCard } from './lib/card.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/languages', async (req, res) => {
  const { username, theme = 'default' } = req.query;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const validThemes = ['default', 'pie', 'wave', 'grid'];
  const selectedTheme = validThemes.includes(theme) ? theme : 'default';

  try {
    const languages = await fetchUserLanguages(username);
    const svg = generateSVGCard(username, languages, selectedTheme);
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(svg);
  } catch (error) {
    console.error('Error generating card:', error);
    
    if (error.message.includes('rate limit')) {
      const errorSvg = `<svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" rx="4.5" height="99%" stroke="#e4e2e2" width="494" fill="#fffefe" />
        <text x="25" y="40" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="16" font-weight="600" fill="#e74c3c">Error: Rate Limit Exceeded</text>
        <text x="25" y="70" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="14" fill="#333">GitHub API rate limit reached.</text>
        <text x="25" y="95" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="14" fill="#333">Please add a GitHub token to increase limits.</text>
        <text x="25" y="120" font-family="Segoe UI, Ubuntu, Sans-Serif" font-size="12" fill="#666">Set GITHUB_TOKEN environment variable</text>
      </svg>`;
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(errorSvg);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});