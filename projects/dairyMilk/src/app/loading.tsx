import { Loader2 } from 'lucide-react';
import { Container } from '@/components/layout/Container';

export default function Loading() {
  return (
    <Container className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
      {/* Calculate min-h based on header/footer if they have fixed heights, otherwise this works for flex-grow main */}
      <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
      <p className="text-xl text-muted-foreground">Loading your dairy delights...</p>
    </Container>
  );
}
