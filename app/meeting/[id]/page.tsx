"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";

interface MeetingResult {
  overallScore: number;
  fluency: number;
  grammar: number;
  vocabulary: number;
  pronunciation: number;
  comprehension: number;
  analysis: string;
  strengths: string[];
  weaknessAreas: string[];
  improvementSuggestions: string[];
}

export default function MeetingResultPage() {
  const params = useParams();
  const meetingId = params.id as string;
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetingResult = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meeting/result/${meetingId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch meeting result');
        }        
        const data = await response.json();
        console.log("data: ", data.data)
        setResult(data.data.result || null);
      } catch (error) {
        console.error('Failed to fetch meeting result:', error);
        setError('Failed to load meeting result');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetingResult();
  }, [meetingId]);

  const ScoreCard = ({ label, score }: { label: string; score: number }) => (
    <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-bold">
        {score}
        <span className="text-sm text-muted-foreground">/10</span>
      </div>
    </div>
  );

  const ListSection = ({ title, items, type }: { title: string; items: string[]; type: 'success' | 'error' | 'info' }) => {
    const bgColor = {
      success: 'bg-green-950/20',
      error: 'bg-red-950/20',
      info: 'bg-blue-950/20'
    }[type];

    console.log("items: ", items)

    return (
      <div className="mt-6">
        <h3 className="font-semibold mb-3">{title}</h3>
        <ul className={`${bgColor} rounded-lg p-4 space-y-2`}>
          {items && items.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  console.log("result: ", result)
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 p-4">
        <div className="container mx-auto max-w-6xl">
          <Card>
            <CardHeader>
              <CardTitle>Interview Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center text-destructive">{error}</div>
              ) : result ? (
                <div className="space-y-6">
                  {/* Scores Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <ScoreCard label="Overall Score" score={result.overallScore} />
                    <ScoreCard label="Fluency" score={result.fluency} />
                    <ScoreCard label="Grammar" score={result.grammar} />
                    <ScoreCard label="Vocabulary" score={result.vocabulary} />
                    <ScoreCard label="Pronunciation" score={result.pronunciation} />
                    <ScoreCard label="Comprehension" score={result.comprehension} />
                  </div>

                  {/* Analysis */}
                  <div className="mt-8">
                    <h3 className="font-semibold mb-3">Analysis</h3>
                    <p className="bg-muted/30 p-4 rounded-lg">{result.analysis}</p>
                  </div>

                  {/* Strengths, Weaknesses, and Improvements */}
                  <ListSection 
                    title="Strengths" 
                    items={result.strengths} 
                    type="success" 
                  />
                  <ListSection 
                    title="Areas for Improvement" 
                    items={result.weaknessAreas} 
                    type="error" 
                  />
                  <ListSection 
                    title="Improvement Suggestions" 
                    items={result.improvementSuggestions} 
                    type="info" 
                  />
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  No result data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 