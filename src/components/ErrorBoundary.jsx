import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full flex items-center justify-center bg-bg-primary p-8 text-center">
                    <div className="glass-panel p-12 max-w-lg">
                        <h1 className="text-3xl font-display font-bold text-red-500 mb-4">Something went wrong.</h1>
                        <p className="text-text-secondary mb-6">The application encountered an unexpected error.</p>
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded text-xs font-mono text-left mb-8 overflow-auto max-h-40">
                            {this.state.error?.toString()}
                        </div>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/';
                            }}
                            className="btn-primary text-sm px-6 py-3"
                        >
                            Reset App & Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
