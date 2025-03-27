"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { createMeeting, rateMeeting } from "@/lib/api-client";
import { RatingValue } from "@/types/call";

const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";

export const useVapiState = () => {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [conversation, setConversation] = useState<
    { role: string; text: string; timestamp: string; isFinal: boolean }[]
  >([]);
  const vapiRef = useRef<any>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [rating, setRating] = useState<RatingValue>(1);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
  const [hasCallEnded, setHasCallEnded] = useState(false);

  const initializeAssistant = useCallback((selectedAssistantId: string) => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current = null;
    }

    const vapiInstance = new Vapi(publicKey);
    vapiRef.current = vapiInstance;

    vapiInstance.on("call-start", () => {
      setIsSessionActive(true);
      setHasCallEnded(false);
    });

    vapiInstance.on("call-end", async () => {
      setIsSessionActive(false);
      setHasCallEnded(true);
    });

    vapiInstance.on("volume-level", (volume: number) => {
      setVolumeLevel(volume);
    });

    vapiInstance.on("message", (message: any) => {
      if (message.type === "transcript") {
        setConversation((prev) => {
          const timestamp = new Date().toLocaleTimeString();
          const updatedConversation = [...prev];
          if (message.transcriptType === "final") {
            const partialIndex = updatedConversation.findIndex(
              (msg) => msg.role === message.role && !msg.isFinal
            );
            if (partialIndex !== -1) {
              updatedConversation[partialIndex] = {
                role: message.role,
                text: message.transcript,
                timestamp: updatedConversation[partialIndex].timestamp,
                isFinal: true,
              };
            } else {
              updatedConversation.push({
                role: message.role,
                text: message.transcript,
                timestamp,
                isFinal: true,
              });
            }
          } else {
            const partialIndex = updatedConversation.findIndex(
              (msg) => msg.role === message.role && !msg.isFinal
            );
            if (partialIndex !== -1) {
              updatedConversation[partialIndex] = {
                ...updatedConversation[partialIndex],
                text: message.transcript,
              };
            } else {
              updatedConversation.push({
                role: message.role,
                text: message.transcript,
                timestamp,
                isFinal: false,
              });
            }
          }
          return updatedConversation;
        });
      }

      if (
        message.type === "function-call" &&
        message.functionCall.name === "changeUrl"
      ) {
        const command = message.functionCall.parameters.url.toLowerCase();
        if (command) {
          window.location.href = command;
        } else {
          console.error("Unknown route:", command);
        }
      }
    });

    vapiInstance.on("error", (e: Error) => {
      console.error("Vapi error:", e);
    });
  }, []);

  const toggleCall = async (selectedAssistantId: string) => {
    try {
      if (isSessionActive) {
        await vapiRef.current.stop();
      } else {
        const callData = await vapiRef.current.start(selectedAssistantId);
        setCallId(callData.id);
        await createMeeting(callData.id);
      }
    } catch (err) {
      console.error("Error toggling Vapi session:", err);
    }
  };

  const submitRating = async (ratingValue: RatingValue) => {
    try {
      setIsRatingSubmitted(true);
      await rateMeeting(callId as string, ratingValue);
      setRating(ratingValue);
      return true;
    } catch (err) {
      console.error("Error submitting rating:", err);
      return false;
    } finally {
      setIsRatingSubmitted(false);
    }
  };

  const sendMessage = (role: string, content: string) => {
    if (vapiRef.current) {
      vapiRef.current.send({
        type: "add-message",
        message: { role, content },
      });
    }
  };

  const say = (message: string, endCallAfterSpoken = false) => {
    if (vapiRef.current) {
      vapiRef.current.say(message, endCallAfterSpoken);
    }
  };

  const toggleMute = () => {
    if (vapiRef.current) {
      const newMuteState = !isMuted;
      vapiRef.current.setMuted(newMuteState);
      setIsMuted(newMuteState);
    }
  };

  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
        vapiRef.current = null;
      }
    };
  }, []);

  return {
    volumeLevel,
    isSessionActive,
    conversation,
    toggleCall,
    sendMessage,
    say,
    toggleMute,
    isMuted,
    initializeAssistant,
    callId,
    submitRating,
    setRating,
    isRatingSubmitted,
    hasCallEnded,
  };
};
