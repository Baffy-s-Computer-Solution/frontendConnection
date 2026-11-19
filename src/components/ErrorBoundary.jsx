/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });

    // Log to analytics in production
    if (import.meta.env.PROD) {
      // You can integrate with your error tracking service here
      // e.g., Sentry, LogRocket, etc.
    }
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return (
        <Fallback
          error={this.state.error}
          resetErrorBoundary={() =>
            this.setState({ hasError: false, error: null, errorInfo: null })
          }
        />
      );
    }

    return this.props.children;
  }
}

const DefaultErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="error-boundary min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div className="text-center p-5" style={{ maxWidth: 640 }}>
      <div className="mb-4">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-danger"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h1 className="h3 mb-3">Something went wrong</h1>
      <p className="text-muted mb-4">
        We’re sorry, but an unexpected error occurred. Please try refreshing the page.
      </p>
      <div className="d-flex gap-3 justify-content-center flex-wrap">
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Refresh Page
        </button>
        <button className="btn btn-outline-secondary" onClick={resetErrorBoundary}>
          Try Again
        </button>
      </div>
    </div>
  </div>
);

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.elementType,
};

export default ErrorBoundary;
