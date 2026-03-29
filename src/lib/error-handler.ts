// 全局错误处理
export function setupErrorHandling() {
  // 捕获未处理的 Promise 拒绝
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    // 可以在这里发送到错误监控服务
  });

  // 捕获全局错误
  window.addEventListener('error', (event) => {
    console.error('Global Error:', event.error);
    // 可以在这里发送到错误监控服务
  });

  // 捕获资源加载错误
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      console.error('Resource Error:', event.target);
    }
  }, true);
}

// 错误日志服务（可扩展为发送到远程服务）
export function logError(error: Error, context?: string) {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  console.error('Error logged:', errorInfo);

  // TODO: 发送到错误监控服务
  // sendToErrorMonitoring(errorInfo);
}
