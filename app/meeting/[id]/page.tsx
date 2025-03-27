"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";

interface CredibilityAssessment {
  postStudyPlans: number;
  academicClarity: number;
  intentGenuineness: number;
  tiesToHomeCountry: number;
  financialStability: number;
}

interface ImprovementSuggestion {
  aiSuggestion: string;
  yourResponse: string;
}

interface SuccessfulResult {
  analysis: string;
  overallScore: number;
  weaknessAreas: string[];
  credibilityAssessment: CredibilityAssessment;
  improvementSuggestions: ImprovementSuggestion[];
}

interface RejectedResult {
  visaStatus: "rejected";
  assessmentStatus: false;
  assessmentFailedReason: string;
}

interface MeetingResult {
  visaStatus?: "rejected";
  assessmentStatus?: false;
  assessmentFailedReason?: string;
  analysis?: string;
  overallScore?: number;
  weaknessAreas?: string[];
  credibilityAssessment?: CredibilityAssessment;
  improvementSuggestions?: ImprovementSuggestion[];
}

interface ApiResponse {
  success: boolean;
  data: {
    result: MeetingResult;
    transcript: string;
    metadata: {
      recordingUrl: string;
      stereoRecordingUrl: string;
    };
  };
}

export default function MeetingResultPage() {
  const params = useParams();
  const meetingId = params.id as string;
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [transcript, setTranscript] = useState<string>("");
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
        
        const data: ApiResponse = await response.json();
        setResult(data.data.result);
        setTranscript(data.data.transcript);
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

  const ComparisonSection = ({ suggestions }: { suggestions: ImprovementSuggestion[] }) => (
    <div className="mt-6">
      <h3 className="font-semibold mb-3">Response Comparisons</h3>
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="grid gap-4 md:grid-cols-2">
            <div className="bg-red-950/20 p-4 rounded-lg">
              <div className="font-medium mb-2">Your Response:</div>
              <div>{suggestion.yourResponse}</div>
            </div>
            <div className="bg-green-950/20 p-4 rounded-lg">
              <div className="font-medium mb-2">Suggested Response:</div>
              <div>{suggestion.aiSuggestion}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const isRejected = (result: MeetingResult | null): result is RejectedResult => {
    return result?.visaStatus === "rejected" && result?.assessmentStatus === false;
  };

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
                  {isRejected(result) ? (
                    <div className="space-y-6">
                      <div className="bg-red-950/20 p-6 rounded-lg space-y-4">
                        <div className="flex items-center justify-center">
                          <div className="text-xl font-semibold text-red-500">
                            Interview Assessment Failed
                          </div>
                        </div>
                        <p className="text-center">
                          {result.assessmentFailedReason}
                        </p>
                      </div>

                      <div className="mt-8">
                        <h3 className="font-semibold mb-3">Interview Transcript</h3>
                        <pre className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
                          {transcript}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <ScoreCard label="Overall Score" score={result.overallScore!} />
                        <ScoreCard 
                          label="Post Study Plans" 
                          score={result.credibilityAssessment!.postStudyPlans} 
                        />
                        <ScoreCard label="Academic Clarity" score={result.credibilityAssessment!.academicClarity} />
                        <ScoreCard label="Intent Genuineness" score={result.credibilityAssessment!.intentGenuineness} />
                        <ScoreCard label="Ties to Home" score={result.credibilityAssessment!.tiesToHomeCountry} />
                        <ScoreCard label="Financial Stability" score={result.credibilityAssessment!.financialStability} />
                      </div>

                      <div className="mt-8">
                        <h3 className="font-semibold mb-3">Analysis</h3>
                        <p className="bg-muted/30 p-4 rounded-lg">{result.analysis}</p>
                      </div>

                      <div className="mt-8">
                        <h3 className="font-semibold mb-3">Interview Transcript</h3>
                        <pre className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
                          {transcript}
                        </pre>
                      </div>

                      {result.weaknessAreas && (
                        <div className="mt-6">
                          <h3 className="font-semibold mb-3">Areas for Improvement</h3>
                          <ul className="bg-red-950/20 rounded-lg p-4 space-y-2">
                            {result.weaknessAreas.map((item, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.improvementSuggestions && (
                        <ComparisonSection suggestions={result.improvementSuggestions} />
                      )}
                    </>
                  )}
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