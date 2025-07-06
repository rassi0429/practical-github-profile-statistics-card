import express from 'express';
import dotenv from 'dotenv';
import { fetchUserLanguages } from './lib/github.js';
import { generateSVGCard } from './lib/card.js';
import cacheManager from './lib/cache.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize cache database
try {
  cacheManager.init();
  console.log('Cache system initialized');
} catch (error) {
  console.error('Failed to initialize cache system:', error);
}

// Schedule periodic cache cleanup (every 6 hours)
setInterval(() => {
  try {
    cacheManager.cleanup();
    const stats = cacheManager.getStats();
    console.log(`Cache stats - Total: ${stats.total}, Valid: ${stats.valid}, Expired: ${stats.expired}`);
  } catch (error) {
    console.error('Cache cleanup error:', error);
  }
}, 6 * 60 * 60 * 1000);

app.get('/api/languages', async (req, res) => {
  const { username, theme = 'default', nocache } = req.query;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const validThemes = ['default', 'pie', 'wave', 'grid'];
  const selectedTheme = validThemes.includes(theme) ? theme : 'default';

  try {
    let svg = null;
    
    // Check cache first (unless nocache parameter is provided)
    if (!nocache) {
      try {
        svg = cacheManager.get(username, selectedTheme);
        if (svg) {
          console.log(`Serving cached response for ${username}:${selectedTheme}`);
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.setHeader('X-Cache', 'HIT');
          return res.send(svg);
        }
      } catch (cacheError) {
        console.error('Cache read error:', cacheError);
        // Continue without cache
      }
    }

    // Cache miss or nocache - fetch fresh data
    console.log(`Fetching fresh data for ${username}:${selectedTheme}`);
    const languages = await fetchUserLanguages(username);
    svg = generateSVGCard(username, languages, selectedTheme);
    
    // Store in cache
    if (!nocache) {
      try {
        cacheManager.set(username, selectedTheme, svg);
      } catch (cacheError) {
        console.error('Cache write error:', cacheError);
        // Continue without caching
      }
    }
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Cache', 'MISS');
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

// Cache management endpoints
app.get('/api/cache/stats', (req, res) => {
  try {
    const stats = cacheManager.getStats();
    res.json({
      success: true,
      stats: stats,
      cacheDuration: '3 days'
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache statistics' });
  }
});

app.post('/api/cache/cleanup', (req, res) => {
  try {
    cacheManager.cleanup();
    const stats = cacheManager.getStats();
    res.json({
      success: true,
      message: 'Cache cleanup completed',
      stats: stats
    });
  } catch (error) {
    console.error('Error cleaning up cache:', error);
    res.status(500).json({ error: 'Failed to cleanup cache' });
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  cacheManager.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  cacheManager.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});