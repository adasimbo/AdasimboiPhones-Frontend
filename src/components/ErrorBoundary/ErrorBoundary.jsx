// adasimbo-iphones-frontend/src/components/ErrorBoundary/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#FEF2F2', /* red-100 */
          color: '#991B1B', /* red-800 */
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '1rem' }}>Something went wrong.</h1>
          <p style={{ fontSize: '1.125rem', textAlign: 'center', marginBottom: '1.5rem' }}>We're sorry for the inconvenience. Please try refreshing the page.</p>
          {process.env.NODE_ENV === 'development' && (
            <details style={{
              marginTop: '1rem',
              padding: '1rem',
              border: '1px solid #F87171', /* red-400 */
              borderRadius: '0.375rem',
              backgroundColor: '#FEF2F2', /* red-50 */
              fontSize: '0.875rem',
              overflow: 'auto',
              maxHeight: '16rem',
              width: '100%',
              maxWidth: '32rem',
            }}>
              <summary style={{ fontWeight: '600', cursor: 'pointer' }}>Error Details</summary>
              <pre style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem', wordBreak: 'break-word' }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
