"use client";
import { useRouter } from "next/navigation";
import RadialCard from "@/components/call/radial-card";
import Transcriber from "@/components/call/transcriber";
import useVapi from "@/hooks/use-vapi";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function AssistantChat() {
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";

  const { conversation, initializeAssistant } = useVapi();

  useEffect(() => {
    initializeAssistant(assistantId);
  }, [assistantId]);

  return (
    <main className="h-screen flex flex-col">
      <div className="p-4 border-b">
        <Link href="/" className="flex gap-5">
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
    </main>
  );
}
