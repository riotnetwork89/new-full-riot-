export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
  }
  
  startTimer(label) {
    this.metrics.set(label, performance.now())
  }
  
  endTimer(label) {
    const startTime = this.metrics.get(label)
    if (startTime) {
      const duration = performance.now() - startTime
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
      this.metrics.delete(label)
      return duration
    }
    return null
  }
  
  measureAsync(label, asyncFn) {
    return async (...args) => {
      this.startTimer(label)
      try {
        const result = await asyncFn(...args)
        this.endTimer(label)
        return result
      } catch (error) {
        this.endTimer(label)
        throw error
      }
    }
  }
}

export const monitor = new PerformanceMonitor()

export const optimizeQuery = (queryBuilder, options = {}) => {
  const { limit = 100, useIndex = true } = options
  
  if (limit) {
    queryBuilder = queryBuilder.limit(limit)
  }
  
  if (useIndex) {
    queryBuilder = queryBuilder.order('created_at', { ascending: false })
  }
  
  return queryBuilder
}

export class ConnectionPool {
  constructor(maxConnections = 10) {
    this.maxConnections = maxConnections
    this.activeConnections = 0
    this.queue = []
  }
  
  async acquire() {
    if (this.activeConnections < this.maxConnections) {
      this.activeConnections++
      return Promise.resolve()
    }
    
    return new Promise((resolve) => {
      this.queue.push(resolve)
    })
  }
  
  release() {
    this.activeConnections--
    if (this.queue.length > 0) {
      const next = this.queue.shift()
      this.activeConnections++
      next()
    }
  }
}

export const dbPool = new ConnectionPool(20)
