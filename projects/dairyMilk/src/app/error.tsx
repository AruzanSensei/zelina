"use client"; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/Container';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <Container className="flex flex-col items-center justify-center text-center">
      <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
      <h1 className="text-3xl font-bold text-destructive mb-4">Something went wrong!</h1>
      <p className="text-lg text-muted-foreground mb-6 max-w-md">
        We're sorry for the inconvenience. An unexpected error occurred.
        Please try again, or contact support if the problem persists.
      </p>
      {error?.message && (
        <p className="text-sm bg-destructive/10 p-3 rounded-md text-destructive mb-6 max-w-md">
          Error details: {error.message}
        </p>
      )}
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        size="lg"
      >
        Try again
      </Button>
    </Container>
  );
}
