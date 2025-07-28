import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  onNavigateHome?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ResultsBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Results error boundary caught an error', { error, errorInfo });
  }

  handleNavigateHome = () => {
    this.props.onNavigateHome?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="p-8 text-center space-y-4 max-w-md">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Results Loading Error
              </h3>
              <p className="text-sm text-muted-foreground">
                We couldn't load your results. Your data is safe and you can try again.
              </p>
            </div>

            <Button 
              onClick={this.handleNavigateHome}
              variant="default"
              size="sm"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}