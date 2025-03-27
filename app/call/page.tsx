"use client";
import { useRouter } from "next/navigation";
import RadialCard from "@/components/call/radial-card";
import Transcriber from "@/components/call/transcriber";
import { useVapi } from "@/contexts/vapi-context";
import { ArrowLeft, Mic, MicOff, PhoneOff, Phone, Loader2, FileText, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RatingValue } from "@/types/call";

export default function AssistantChat() {
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [rating, setRatingValue] = useState<RatingValue>(1);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [isRatingDone, setIsRatingDone] = useState(false);

  const { 
    conversation, 
    initializeAssistant, 
    toggleCall, 
    toggleMute, 
    isMuted, 
    isSessionActive,
    callId,
    submitRating,
    isRatingSubmitted,
    hasCallEnded
  } = useVapi();

  useEffect(() => {
    initializeAssistant(assistantId);
  }, [assistantId]);

  // Update the effect to check for hasCallEnded
  useEffect(() => {
    if (!isSessionActive && callId && hasCallEnded) {
      setShowRatingDialog(true);
      setShowResult(true);
    } else {
      setShowResult(false);
    }
  }, [isSessionActive, callId, hasCallEnded]);

  const handleCallToggle = async () => {
    setIsLoading(true);
    try {
      await toggleCall(assistantId);
    } catch (error) {
      console.error('Error toggling call:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewResult = () => {
    if (callId) {
      router.push(`/meeting/${callId}`);
    }
  };

  const handleRatingSubmit = async () => {
    if (callId && rating > 0) {
      const success = await submitRating(rating);
      if (success) {
        setIsRatingDone(true);
      }
    }
  };

  const handleViewResultAndClose = () => {
    if (callId) {
      setShowRatingDialog(false);
      setShowResult(true);
      router.push(`/meeting/${callId}`);
    }
  };

  return (
    <main className="h-screen flex flex-col relative">
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex gap-5">
          <ArrowLeft size={24} />
          <h1 className="text-xl font-semibold">Visa Officer</h1>
        </Link>
      </div>

      <div className="flex flex-1 gap-4 mt-4 overflow-hidden">
        <div className="w-1/2 flex items-center justify-center">
          <RadialCard assistantId={assistantId} />
        </div>
        <div className="w-1/2 h-full">
          <Transcriber conversation={conversation} />
        </div>
      </div>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isRatingDone ? 'Thank you for your feedback!' : 'Rate your interview experience'}
            </DialogTitle>
            <DialogDescription>
              {isRatingDone 
                ? 'View your interview results and get detailed feedback.'
                : 'Please rate your experience with the AI interviewer'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            {!isRatingDone ? (
              <>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setRatingValue(value as RatingValue)}
                      className={`p-2 rounded-full transition-colors ${
                        rating >= value 
                          ? 'text-yellow-400 hover:text-yellow-500' 
                          : 'text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      <Star className="h-8 w-8 fill-current" />
                    </button>
                  ))}
                </div>
                <Button 
                  onClick={handleRatingSubmit} 
                  disabled={isRatingSubmitted}
                  className="w-full"
                >
                  {isRatingSubmitted ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {isRatingSubmitted ? 'Submitting...' : 'Submit Rating'}
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleViewResultAndClose}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Interview Results
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Call Controls */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-4 rounded-full border shadow-lg">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={toggleMute}
          disabled={!isSessionActive || isLoading}
        >
          {isMuted ? (
            <MicOff className="h-6 w-6 text-destructive" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>

        <Button
          variant={isSessionActive ? "destructive" : "default"}
          size="icon"
          className="h-14 w-14 rounded-full"
          onClick={handleCallToggle}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isSessionActive ? (
            <PhoneOff className="h-6 w-6" />
          ) : (
            <Phone className="h-6 w-6" />
          )}
        </Button>

        {showResult && (
          <Button
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700"
            onClick={handleViewResult}
          >
            <FileText className="h-6 w-6" />
          </Button>
        )}
      </div>
    </main>
  );
}
