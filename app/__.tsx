// Add error boundary for better error handling
"use client";

import React from "react";
interface ServiceErrorBoundaryProps {
  children: React.ReactNode;
}

interface ServiceErrorBoundaryState {
  hasError: boolean;
}

export class ServiceErrorBoundary extends React.Component {
  constructor(props: ServiceErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false } as ServiceErrorBoundaryState;
  }

  static getDerivedStateFromError(error: ServiceErrorBoundaryState) {
    return { ...error, hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with the service monitor.</div>;
    }
    
    return this.props.children;
  }
}
