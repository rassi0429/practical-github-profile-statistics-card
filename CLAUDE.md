# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Starting the Application
```bash
npm install          # Install dependencies
npm start           # Start production server on port 3000
npm run dev         # Start development server with file watching
```

### Environment Setup
```bash
cp .env.example .env  # Create environment file
# Edit .env to add GITHUB_TOKEN for increased API limits
```

## Architecture Overview

This is a Node.js Express service that generates SVG cards displaying GitHub language statistics. The application has a simple 3-layer architecture:

### Core Components

**`index.js`** - Express server entry point
- Single API endpoint: `/api/languages?username=X&theme=Y`
- Handles request validation, error responses, and SVG serving
- Sets appropriate caching headers (1-hour cache)
- Provides custom error SVGs for rate limit issues

**`lib/github.js`** - GitHub API integration
- `fetchUserLanguages(username)` - Main function that aggregates language stats
- Fetches all user repositories (excluding forks) with pagination
- Calculates language percentages across all repos
- Includes retry logic and rate limit handling
- Supports GitHub token authentication via GITHUB_TOKEN env var

**`lib/card.js`** - SVG card generation
- `generateSVGCard(username, languages, theme)` - Main entry point
- Four distinct themes: `default`, `pie`, `wave`, `grid`
- Each theme has its own generator function with custom styling
- Uses predefined color mapping in `LANGUAGE_COLORS` object
- All cards are pure SVG with embedded CSS styles

### Data Flow
1. API request → validate username and theme
2. GitHub API → fetch all user repos → get language data per repo
3. Aggregate and calculate percentages across all repos
4. Generate themed SVG card with language statistics
5. Return SVG with cache headers

### Theme Specifications
- **Default**: Horizontal bar chart with legend (495×195px)
- **Pie**: Circular chart with gradient background (400×250px) 
- **Wave**: Dark theme with wave visualization (495×220px)
- **Grid**: Colorful grid layout (450×300px)

### GitHub API Considerations
- Without token: 60 requests/hour limit
- With GITHUB_TOKEN: 5,000 requests/hour limit
- Service handles rate limiting gracefully with custom error SVGs
- Fetches only owner repositories (not forks)
- Uses pagination to get all repositories

### Deployment
- Configured for Vercel deployment via `vercel.json`
- Production URL format: `https://your-app.vercel.app/api/languages?username=USER`
- Supports both local development and cloud deployment

### Sample Interface
`sample.html` provides a complete demo interface showing all themes with real-time preview functionality.