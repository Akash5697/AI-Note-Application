import React from "react";

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white p-8">
                    <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black font-outfit uppercase tracking-wider mb-2">Something went wrong</h2>
                    <p className="text-muted-foreground text-center max-w-md mb-8">
                        The application encountered an unexpected error. Don't worry, your data is safe. Try refreshing the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-4 bg-primary rounded-xl font-bold uppercase tracking-widest text-sm hover:translate-y-[-2px] transition-all shadow-xl shadow-primary/20"
                    >
                        Refresh Interface
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
