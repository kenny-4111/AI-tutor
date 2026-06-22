"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

function TutorApp() {
  const [conversationActive, setConversationActive] = useState(false);
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setUserText(localStorage.getItem("userText") || "");
    setAiReply(localStorage.getItem("aiReply") || "");
  }, []);

  useEffect(() => {
    localStorage.setItem("userText", userText);
  }, [userText]);

  useEffect(() => {
    localStorage.setItem("aiReply", aiReply);
    // Update subscription usage when AI response changes
    if (aiReply) {
      const wordCount = aiReply.trim().split(/\s+/).length;
      const savedUsage = localStorage.getItem("subscriptionUsage");
      const currentUsage = savedUsage
        ? JSON.parse(savedUsage)
        : {
            used: 0,
            total: 10000,
            resetDate: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              1
            ).toLocaleDateString(),
          };
      const newUsed = Math.min(
        currentUsage.used + wordCount,
        currentUsage.total
      );
      const updated = { ...currentUsage, used: newUsed };
      localStorage.setItem("subscriptionUsage", JSON.stringify(updated));
    }
  }, [aiReply]);

  const restartListening = () => {
    if (!conversationActive) return;
    setTimeout(() => {
      startListening();
    }, 500);
  };

  const startListening = () => {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    if (recognitionRef.current) recognitionRef.current.stop();

    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onstart = () => {
      setListening(true);
      setUserText("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript + " ";
        else interimTranscript += transcript;
      }

      setUserText(finalTranscript + interimTranscript);
    };

    recognition.onend = async () => {
      setListening(false);

      if (finalTranscript.trim()) {
        await getAIResponse(finalTranscript.trim());
      } else {
        setAiReply("Didn't catch that. Try again?");
        restartListening();
      }
    };

    recognition.start();
  };

  const getAIResponse = async (prompt: string) => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = () => {};
      recognitionRef.current.stop();
    }
    setListening(false);

    setLoading(true);
    setAiReply("");
    setIsAudioPlaying(false);

    let intervalId: ReturnType<typeof setInterval> | null = null;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const replyText = data.text?.trim?.() || "";

      if (!res.ok || !replyText) {
        setAiReply("Chat error: " + (data.error || "No response."));
        restartListening();
        return;
      }

      // Call Eleven Labs TTS endpoint
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: replyText }),
      });

      if (!ttsRes.ok) {
        const ttsData = await ttsRes.json();
        setAiReply("TTS error: " + (ttsData?.error || ttsRes.statusText));
        restartListening();
        return;
      }

      // Convert response to blob and create audio URL
      const audioBlob = await ttsRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.muted = isMuted;
        audioRef.current
          .play()
          .then(() => {
            setIsAudioPlaying(true);
          })
          .catch((err) => {
            console.warn("Audio playback blocked", err);
            setIsAudioPlaying(false);
          });
      }

      // Display reply text with typing effect
      let index = 0;
      const totalChars = Math.max(replyText.length, 1);
      const interval = 50;
      intervalId = setInterval(() => {
        index += 1;
        setAiReply(replyText.slice(0, index));

        if (index >= totalChars && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }, interval);
    } catch (err) {
      console.error(err);
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      setAiReply("Network error. Check console.");
      setIsAudioPlaying(false);
      restartListening();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.muted = isMuted;
  }, [isMuted]);

  const handleAudioEnd = () => {
    setIsAudioPlaying(false);
    restartListening();
  };

  return (
    <main className="min-h-screen bg-transparent text-white flex flex-col p-6">
      <h1 className="text-3xl font-semibold mb-6 text-center">
        🎓 AI Tutor MVP
      </h1>

      <div className="flex gap-4 justify-center mb-6">
        <button
          onClick={() => {
            setConversationActive(true);
            startListening();
          }}
          disabled={loading || conversationActive}
          className={`w-16 h-16 bg-accent rounded-full flex items-center justify-center text-3xl hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed ${
            listening ? "animate-pulse" : ""
          }`}>
          🎙️
        </button>

        <button
          onClick={() => {
            setConversationActive(false);
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
            if (audioRef.current) {
              audioRef.current.pause();
            }
            setListening(false);
            setIsAudioPlaying(false);
          }}
          disabled={!conversationActive}
          className="w-16 h-16 bg-red-700 rounded-full flex items-center justify-center text-3xl hover:bg-red-600 transition disabled:opacity-30 disabled:cursor-not-allowed">
          ⏹️
        </button>

        <button
          onClick={() => {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
          }}
          disabled={!conversationActive}
          className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-3xl hover:bg-gray-600 transition disabled:opacity-30 disabled:cursor-not-allowed">
          {isMuted ? "🔇" : "🔊"}
        </button>
      </div>

      <div className="w-full max-w-4xl mx-auto mb-4">
        <p className="text-gray-400 text-sm mb-1">You said:</p>
        <p className="text-lg bg-gray-800 rounded-lg p-3">{userText || "—"}</p>
      </div>

      <div className="flex-1 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="relative flex items-center justify-center">
          <div className="relative w-full h-96">
            <img
              src="/avatar-placeholder.html"
              alt="Avatar"
              className={`w-full h-full object-contain rounded-lg transition-all duration-300 ${
                isAudioPlaying ? "scale-105" : "scale-100 grayscale"
              }`}
            />
            {loading && (
              <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center pointer-events-none">
                <span className="text-white">Processing...</span>
              </div>
            )}
            {isAudioPlaying && (
              <div className="absolute bottom-4 left-4 bg-green-500/80 rounded-full px-4 py-2 text-white text-sm font-semibold">
                🔊 Speaking...
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col bg-gray-800 rounded-lg p-6 h-96">
          <p className="text-gray-400 text-sm mb-3 shrink-0">
            AI Tutor Response:
          </p>
          {loading ? (
            <p className="text-yellow-400 animate-pulse text-lg">Thinking...</p>
          ) : (
            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <p className="text-xl font-light leading-relaxed whitespace-pre-wrap wrap-break-word">
                {aiReply || "—"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onPlay={() => setIsAudioPlaying(true)}
        onPause={() => setIsAudioPlaying(false)}
      />
    </main>
  );
}

export default function DashboardPage() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="text-gray-400">Loading your session…</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div>
          <h1 className="text-3xl font-semibold">Sign in to continue</h1>
          <p className="mt-2 text-gray-400">
            Access to the tutor dashboard is limited to registered users.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full rounded-full bg-accent px-4 py-2 font-medium hover:opacity-95 text-blue-950">
            Continue with Google
          </button>
          <Link
            href="/login"
            className="w-full rounded-full border border-white/20 px-4 py-2 text-center font-medium hover:border-white/40">
            Sign in with email
          </Link>
        </div>
      </div>
    );
  }

  return <TutorApp />;
}
