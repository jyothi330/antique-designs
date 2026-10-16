import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    const msg = this.state.error.message ?? String(this.state.error);

    return (
      <div className="min-h-screen bg-[#f7f3ec] flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-2xl shadow-xl w-full max-w-lg p-8 text-center">
          <div className="text-5xl mb-4">💥</div>
          <h2 className="font-bold text-gray-800 text-lg mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            The app crashed before it could render. This is usually caused by a missing
            Firebase configuration or a network error.
          </p>
          <pre className="bg-gray-100 text-red-700 text-xs rounded-lg px-4 py-3 text-left overflow-x-auto mb-6 whitespace-pre-wrap break-all">
            {msg}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
