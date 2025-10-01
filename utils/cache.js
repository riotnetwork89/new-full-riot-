class MemoryCache {
  constructor() {
    this.cache = new Map()
    this.ttl = 5 * 60 * 1000 // 5 minutes TTL
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }
  
  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }
  
  delete(key) {
    this.cache.delete(key)
  }
  
  clear() {
    this.cache.clear()
  }
}

export const accessCache = new MemoryCache()
export const userCache = new MemoryCache()
