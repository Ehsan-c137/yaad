import React from "react";

type ErrorBoundaryProps = React.PropsWithChildren;

interface ErrorBoundaryState {
  hasError: boolean;
  key: number;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, key: 0, error: null };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState((s) => ({
      hasError: false,
      key: s.key + 1,
      error: null,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full flex items-center justify-center h-screen">
          <div role="alert" className="flex flex-col gap-3 p-4">
            <div>
              <h2 className="font-medium">Something went wrong</h2>
              <p className="text-sm text-muted-foreground">
                {this.state.error?.message || "An unexpected error occurred."}
              </p>
            </div>

            {this.state.error?.stack && (
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer">Show error details</summary>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <button
              type="button"
              className="w-fit rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
              onClick={this.handleRetry}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return <div key={this.state.key}>{this.props.children}</div>;
  }
}
