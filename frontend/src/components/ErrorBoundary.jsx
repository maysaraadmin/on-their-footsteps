import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: this.generateErrorId()
    }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Log error to monitoring service in production
    this.logErrorToService(error, errorInfo)
    
    // Update state with error details
    this.setState({
      error,
      errorInfo,
      timestamp: new Date().toISOString()
    })
  }

  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  logErrorToService(error, errorInfo) {
    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, or custom endpoint
      const errorData = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: localStorage.getItem('userId') || 'anonymous'
      }

      // Send to error logging service
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData)
      }).catch(err => {
        console.error('Failed to log error:', err)
      })
    }
  }

  handleRetry = () => {
    // Reset error state and retry
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    })
  }

  handleReload = () => {
    // Reload the page
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          retry: this.handleRetry,
          reload: this.handleReload
        })
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full mx-4 p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">
              حدث خطأ غير متوقع
            </h1>
            
            <p className="text-gray-600 text-center mb-6">
              نعتذر عن هذا الخطأ. فريقنا يعمل على إصلاحه.
            </p>

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 p-4 bg-gray-100 rounded-lg">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  تفاصيل الخطأ (للمطورين فقط)
                </summary>
                <div className="mt-2 text-sm text-gray-600">
                  <p className="font-mono mb-2">
                    خطأ: {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="whitespace-pre-wrap text-xs bg-white p-2 rounded border">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                  <p className="mt-2 text-xs">
                    معرف الخطأ: {this.state.errorId}
                  </p>
                </div>
              </details>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة المحاولة
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                تحديث الصفحة
              </button>
            </div>

            {/* Contact support */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                إذا استمرت المشكلة، 
                <a 
                  href="mailto:support@on-their-footsteps.com?subject=Error%20Report%20${this.state.errorId}"
                  className="text-blue-600 hover:underline ml-1"
                >
                  تواصل مع الدعم الفني
                </a>
              </p>
            </div>
          </div>
        </div>
      )
    }

    // Normally, just render children
    return this.props.children
  }
}

// Hook for using ErrorBoundary in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return setError
}

// HOC for wrapping components with ErrorBoundary
export const withErrorBoundary = (Component, fallback = null) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

export default ErrorBoundary
