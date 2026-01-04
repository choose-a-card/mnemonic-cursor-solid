import { ErrorBoundary as SolidErrorBoundary, type Component, type JSX } from 'solid-js'
import { logger } from '../../utils/logger'
import './ErrorBoundary.css'

interface ErrorBoundaryProps {
  children: JSX.Element
  fallback?: (error: Error, reset: () => void) => JSX.Element
}

interface ErrorFallbackProps {
  error: Error
  reset: () => void
}

const DefaultErrorFallback: Component<ErrorFallbackProps> = (props) => {
  const handleRetry = () => {
    props.reset()
  }

  const handleReload = () => {
    window.location.reload()
  }

  const handleKeyDown = (event: KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      action()
    }
  }

  return (
    <div class="error-boundary">
      <div class="error-boundary-content">
        <div class="error-boundary-icon">⚠️</div>
        <h2 class="error-boundary-title">Something went wrong</h2>
        <p class="error-boundary-message">
          An unexpected error occurred. Please try again.
        </p>
        <details class="error-boundary-details">
          <summary>Error details</summary>
          <pre class="error-boundary-stack">{props.error.message}</pre>
        </details>
        <div class="error-boundary-actions">
          <button
            type="button"
            class="error-boundary-btn error-boundary-btn-primary"
            onClick={handleRetry}
            onKeyDown={(e) => handleKeyDown(e, handleRetry)}
            tabindex={0}
            aria-label="Try again"
          >
            Try Again
          </button>
          <button
            type="button"
            class="error-boundary-btn error-boundary-btn-secondary"
            onClick={handleReload}
            onKeyDown={(e) => handleKeyDown(e, handleReload)}
            tabindex={0}
            aria-label="Reload page"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}

const ErrorBoundary: Component<ErrorBoundaryProps> = (props) => {
  const handleError = (error: Error, reset: () => void): JSX.Element => {
    logger.error('ErrorBoundary caught error:', error)
    
    if (props.fallback) {
      return props.fallback(error, reset)
    }
    
    return <DefaultErrorFallback error={error} reset={reset} />
  }

  return (
    <SolidErrorBoundary fallback={handleError}>
      {props.children}
    </SolidErrorBoundary>
  )
}

export default ErrorBoundary

