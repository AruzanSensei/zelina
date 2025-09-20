"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateDairyFact, type DairyFactOutput } from '@/ai/flows/dairy-fact-generator';
import { Lightbulb, RefreshCw, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DairyFactGenerator() {
  const [factData, setFactData] = useState<DairyFactOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFact = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newFact = await generateDairyFact();
      setFactData(newFact);
    } catch (e) {
      console.error("Failed to generate dairy fact:", e);
      setError("Oops! We couldn't fetch a dairy fact right now. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFact();
  }, []);

  return (
    <Card className="w-full shadow-lg border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <Lightbulb className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl font-semibold">Daily Dairy Dose!</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchFact} disabled={isLoading} aria-label="Refresh dairy fact">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && !error && (
          <div className="flex items-center space-x-2 text-muted-foreground pt-4">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Milking a new fact for you...</span>
          </div>
        )}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!isLoading && factData && !error && (
          <p className="text-lg text-foreground pt-4 leading-relaxed">
            {factData.fact}
          </p>
        )}
         <CardDescription className="text-xs text-muted-foreground mt-4">
          Powered by AI
        </CardDescription>
      </CardContent>
    </Card>
  );
}
