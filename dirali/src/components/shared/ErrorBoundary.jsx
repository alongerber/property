import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ backgroundColor: '#EF44441A' }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: '#E2E8F0' }}
          >
            משהו השתבש
          </h2>
          <p
            className="text-sm mb-6 max-w-md"
            style={{ color: '#94A3B8' }}
          >
            אירעה שגיאה בלתי צפויה. הנתונים שלך שמורים — נסה לרענן את הדף.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors"
            style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}
          >
            רענן דף
          </button>
          {this.state.error && (
            <details className="mt-4 text-left max-w-lg" dir="ltr">
              <summary
                className="text-xs cursor-pointer"
                style={{ color: '#64748B' }}
              >
                Technical details
              </summary>
              <pre
                className="mt-2 text-xs p-3 rounded-lg overflow-x-auto"
                style={{
                  backgroundColor: '#0F172A',
                  color: '#F87171',
                  border: '1px solid #334155',
                }}
              >
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
