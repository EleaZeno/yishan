// 性能监控工具

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

const metrics: PerformanceMetric[] = [];

/**
 * 记录性能指标
 */
export function recordMetric(name: string, value: number) {
  metrics.push({
    name,
    value,
    timestamp: Date.now(),
  });
  
  // 发送到分析服务（可选）
  if (import.meta.env.PROD) {
    // sendToAnalytics({ name, value });
  }
}

/**
 * 测量函数执行时间
 */
export async function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    recordMetric(name, duration);
    return result;
  } catch (e) {
    const duration = performance.now() - start;
    recordMetric(`${name}_error`, duration);
    throw e;
  }
}

/**
 * 测量同步函数执行时间
 */
export function measure<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  recordMetric(name, duration);
  return result;
}

/**
 * 获取所有指标
 */
export function getMetrics(): PerformanceMetric[] {
  return [...metrics];
}

/**
 * 获取 Web Vitals
 */
export function getWebVitals() {
  if (typeof window === 'undefined') return null;
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!navigation) return null;
  
  return {
    // 页面加载时间
    pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
    // DOM 解析时间
    domParseTime: navigation.domInteractive - navigation.fetchStart,
    // 首次绘制时间
    firstPaint: navigation.responseEnd - navigation.fetchStart,
    // DOM 内容加载时间
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
  };
}

/**
 * 初始化性能监控
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;
  
  // 页面加载完成后记录指标
  window.addEventListener('load', () => {
    setTimeout(() => {
      const vitals = getWebVitals();
      if (vitals) {
        console.log('Web Vitals:', vitals);
        recordMetric('page_load', vitals.pageLoadTime);
        recordMetric('dom_parse', vitals.domParseTime);
        recordMetric('first_paint', vitals.firstPaint);
      }
    }, 0);
  });
  
  // 监控长任务
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('Long task detected:', entry);
            recordMetric('long_task', entry.duration);
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long task API not supported
    }
  }
}