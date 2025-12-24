import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-[#F9F6F1] dark:bg-[#1a1a1a] flex items-center justify-center p-8">
          <div className="max-w-[600px] w-full bg-white dark:bg-gray-800 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="font-[Georgia,'Times_New_Roman',serif] text-3xl font-medium text-[#0A0A0A] dark:text-white text-center mb-4 tracking-[-0.02em]">
              Something went wrong
            </h1>

            <p className="text-[#4B535A] dark:text-gray-400 text-center mb-6 leading-relaxed">
              We encountered an unexpected error. This has been logged and we'll look into it.
            </p>

            {/* Error Details (in dev mode) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 bg-[#F9F6F1] dark:bg-gray-900 rounded-lg p-4 text-sm">
                <summary className="cursor-pointer font-medium text-[#0A0A0A] dark:text-white mb-2">
                  Error Details
                </summary>
                <div className="text-[#4B535A] dark:text-gray-400 font-mono text-xs overflow-auto">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo && (
                    <div className="mt-2">
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#D97757] text-white border-none rounded-lg font-medium cursor-pointer transition-all duration-200 hover:bg-[#C5654A] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(217,119,87,0.25)]"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-transparent text-[#4B535A] dark:text-gray-400 border border-[#E8E3D9] dark:border-gray-600 rounded-lg font-medium cursor-pointer transition-all duration-200 hover:bg-[#FBF0ED] dark:hover:bg-gray-700 hover:border-[#D97757]"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook-based wrapper for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
