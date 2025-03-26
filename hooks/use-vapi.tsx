"use client";
import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import Vapi from "@vapi-ai/web";
import { createMeeting, rateMeeting } from "@/lib/api-client";

const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";
const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";

// Create context
const VapiContext = createContext<ReturnType<typeof useVapiState> | null>(null);

// Create a provider hook
const useVapiState = () => {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [conversation, setConversation] = useState<
    { role: string; text: string; timestamp: string; isFinal: boolean }[]
  >([]);
  const vapiRef = useRef<any>(null);
  const [callId, setCallId] = useState<string | null>(null);

  console.log("publicKey: ", publicKey);

  const initializeAssistant = useCallback((selectedAssistantId: string) => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current = null;
    }

    const vapiInstance = new Vapi(publicKey);
    vapiRef.current = vapiInstance;

    vapiInstance.on("call-start", () => {
      setIsSessionActive(true);
    });

    vapiInstance.on("call-end", async () => {
      setIsSessionActive(false);
      setCallId(null);
      setConversation([]); // Reset conversation on call end
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
            // Find the partial message to replace it with the final one
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
            // Add partial message or update the existing one
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
        console.log(command);
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
    console.log("toggleCall: ", selectedAssistantId);
    try {
      if (isSessionActive) {
        await rateMeeting(callId as string, 5);

        await vapiRef.current.stop();
      } else {
        const callData = await vapiRef.current.start(selectedAssistantId);
        console.log("setting callId: ", callData.id);
        setCallId(callData.id);
        await createMeeting(callData.id);
      }
    } catch (err) {
      console.error("Error toggling Vapi session:", err);
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

  // Cleanup on unmount
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
  };
};

// Create provider component
export function VapiProvider({ children }: { children: React.ReactNode }) {
  const vapiState = useVapiState();

  return (
    <VapiContext.Provider value={vapiState}>{children}</VapiContext.Provider>
  );
}

// Export hook to use Vapi context
const useVapi = () => {
  const context = useContext(VapiContext);
  if (!context) {
    throw new Error("useVapi must be used within a VapiProvider");
  }
  return context;
};

export default useVapi;
