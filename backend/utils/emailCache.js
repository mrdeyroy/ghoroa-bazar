/**
 * In-memory cache for email validation results with TTL
 */
class EmailCache {
  constructor(ttlMinutes = 15) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000;
  }

  set(email, status) {
    this.cache.set(email.toLowerCase(), {
      status, // 'valid' or 'blocked'
      timestamp: Date.now()
    });
  }

  get(email) {
    const entry = this.cache.get(email.toLowerCase());
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(email.toLowerCase());
      return null;
    }

    return entry.status;
  }

  clear() {
    this.cache.clear();
  }
}

// Singleton instance
module.exports = new EmailCache();
