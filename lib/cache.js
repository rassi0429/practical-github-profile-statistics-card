import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CacheManager {
  constructor() {
    this.db = null;
    this.cacheDuration = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
  }

  init() {
    try {
      // Create database in project root
      const dbPath = path.join(__dirname, '..', 'cache.db');
      this.db = new Database(dbPath);
      
      // Create cache table if it doesn't exist
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS language_cache (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          theme TEXT NOT NULL,
          data TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          UNIQUE(username, theme)
        )
      `);

      // Create index for faster lookups
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_username_theme 
        ON language_cache(username, theme)
      `);

      // Create index for cleanup operations
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_created_at 
        ON language_cache(created_at)
      `);

      console.log('Cache database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize cache database:', error);
      throw error;
    }
  }

  /**
   * Get cached data for a specific username and theme
   * @param {string} username - GitHub username
   * @param {string} theme - Card theme
   * @returns {string|null} Cached SVG data or null if not found/expired
   */
  get(username, theme) {
    if (!this.db) {
      throw new Error('Cache database not initialized');
    }

    try {
      const stmt = this.db.prepare(`
        SELECT data, created_at 
        FROM language_cache 
        WHERE username = ? AND theme = ?
      `);
      
      const result = stmt.get(username, theme);
      
      if (!result) {
        return null;
      }

      const now = Date.now();
      const cacheAge = now - result.created_at;

      // Check if cache is still valid (within 3 days)
      if (cacheAge > this.cacheDuration) {
        // Cache expired, delete it
        this.delete(username, theme);
        return null;
      }

      console.log(`Cache hit for ${username}:${theme} (age: ${Math.round(cacheAge / 1000 / 60)} minutes)`);
      return result.data;
    } catch (error) {
      console.error('Error retrieving from cache:', error);
      return null;
    }
  }

  /**
   * Store data in cache
   * @param {string} username - GitHub username
   * @param {string} theme - Card theme
   * @param {string} data - SVG data to cache
   */
  set(username, theme, data) {
    if (!this.db) {
      throw new Error('Cache database not initialized');
    }

    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO language_cache (username, theme, data, created_at)
        VALUES (?, ?, ?, ?)
      `);
      
      const result = stmt.run(username, theme, data, Date.now());
      console.log(`Cached data for ${username}:${theme} (row ${result.lastInsertRowid})`);
    } catch (error) {
      console.error('Error storing in cache:', error);
    }
  }

  /**
   * Delete specific cache entry
   * @param {string} username - GitHub username
   * @param {string} theme - Card theme
   */
  delete(username, theme) {
    if (!this.db) {
      throw new Error('Cache database not initialized');
    }

    try {
      const stmt = this.db.prepare(`
        DELETE FROM language_cache 
        WHERE username = ? AND theme = ?
      `);
      
      const result = stmt.run(username, theme);
      if (result.changes > 0) {
        console.log(`Deleted cache entry for ${username}:${theme}`);
      }
    } catch (error) {
      console.error('Error deleting from cache:', error);
    }
  }

  /**
   * Clean up expired cache entries
   */
  cleanup() {
    if (!this.db) {
      throw new Error('Cache database not initialized');
    }

    try {
      const cutoff = Date.now() - this.cacheDuration;
      const stmt = this.db.prepare(`
        DELETE FROM language_cache 
        WHERE created_at < ?
      `);
      
      const result = stmt.run(cutoff);
      if (result.changes > 0) {
        console.log(`Cleaned up ${result.changes} expired cache entries`);
      }
    } catch (error) {
      console.error('Error cleaning up cache:', error);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    if (!this.db) {
      throw new Error('Cache database not initialized');
    }

    try {
      const totalStmt = this.db.prepare('SELECT COUNT(*) as total FROM language_cache');
      const total = totalStmt.get().total;

      const cutoff = Date.now() - this.cacheDuration;
      const validStmt = this.db.prepare('SELECT COUNT(*) as valid FROM language_cache WHERE created_at >= ?');
      const valid = validStmt.get(cutoff).valid;

      return {
        total: total,
        valid: valid,
        expired: total - valid
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { total: 0, valid: 0, expired: 0 };
    }
  }

  /**
   * Close the database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('Cache database connection closed');
    }
  }
}

// Create and export singleton instance
const cacheManager = new CacheManager();

export default cacheManager;