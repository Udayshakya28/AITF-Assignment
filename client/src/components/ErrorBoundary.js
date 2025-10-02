import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-center text-white">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
            
            <h1 className="text-2xl font-bold mb-4 font-noto">
              エラーが発生しました
            </h1>
            
            <p className="text-white/80 mb-6 font-noto">
              申し訳ございません。予期しないエラーが発生しました。
              ページを再読み込みしてお試しください。
            </p>
            
            <button
              onClick={this.handleReload}
              className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 
                       text-white px-6 py-3 rounded-lg transition-colors w-full font-noto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ページを再読み込み</span>
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-white/60 text-sm mb-2">
                  エラー詳細 (開発用)
                </summary>
                <pre className="text-xs text-white/60 bg-black/20 p-3 rounded overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

