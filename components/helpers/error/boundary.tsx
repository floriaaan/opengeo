import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundaryProvider extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI

    return { hasError: true, error };
  }

  render() {
    // Check if the error is thrown
    if (this.state.hasError && process.env.NEXT_PUBLIC_DEV === "false") {
      window.location.href = `/_error?from=${window.location.href}&message=${this.state.error?.message}&http=500`;
    }

    // Return children components in case of no error

    return this.props.children;
  }
}
