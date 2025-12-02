import { useEffect, useRef, useState } from "react";
import { Send, Mic } from "lucide-react";
import { getUserChatHistory, saveUserMessage } from "@/lib/chatHistory";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatSidebar from "@/components/ChatSidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { getAIResponse } from "@/lib/ai";

const formatTopicLabel = (segment?: string) => {
  if (!segment) return "General";
  const withSpaces = segment.replace(/-/g, " ");
  return withSpaces.replace(/\b\w/g, (char) => char.toUpperCase());
};

const getSuggestedQuestions = (topic?: string): string[] => {
  switch (topic) {
    case "enrollment":
      return [
        "What are the requirements for enrollment?",
        "How do I get my student ID?",
        "When is the enrollment deadline?",
        "What happens if I'm late for enrollment?"
      ];
    case "tuition":
      return [
        "How much is the tuition and miscellaneous fees?",
        "What are the payment options?",
        "Where do I pay my fees?"
      ];
    case "schedules":
      return [
        "How do I view or download my class schedule?",
        "How do I add or drop subjects?",
        "When do classes start?"
      ];
    case "grades":
      return [
        "Where can I see my grades?",
        "When are grades released?"
      ];
    case "registrar":
      return [
        "How do I request a COR, COE or TOR?",
        "Where do I claim my registration form?",
        "How do I access the student portal?"
      ];
    case "campus_map":
      return [
        "Where is the Registrar's Office?",
        "Which gate should I use for the gym and ROTC field?",
        "Where are the clinic and AVR located?"
      ];
    case "miscellaneous":
      return [
        "Where do I get my school uniform?",
        "What are the basic school rules and policies?",
        "Is there free WiFi inside the campus?"
      ];
    default:
      return [
        "How do I enroll at NEMSU Cantilan Campus?",
        "Where is the Student Admission Office?",
        "Where can I find my classroom or building?"
      ];
  }
};

const Chat = () => {
  const [showLoginNotice, setShowLoginNotice] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsub();
  }, []);
  const [message, setMessage] = useState("");
  type ChatMessage = { role: "user" | "assistant"; content: string };
const [messages, setMessages] = useState<ChatMessage[]>([
  {
    role: "assistant",
    content: "Hello! I'm your NEMSU AI Assistant. How can I help you today?"
  }
]);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const pathSegment = location.pathname.split("/")[2];
  const topic = pathSegment ? pathSegment.replace(/-/g, "_") : undefined;
  const topicLabel = formatTopicLabel(pathSegment);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Load chat history from Firestore for logged-in user and topic
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let active = true;
    onAuthStateChanged(auth, async (user) => {
      if (user && topic) {
        const history = await getUserChatHistory(user.uid, topic);
        if (active && history.length > 0) {
          setMessages(history.map((msg: any) => ({ role: msg.role as "user" | "assistant", content: msg.content })));
        }
      }
    });
    return () => { active = false; if (unsub) unsub(); };
  }, [topic]);

  // When coming from the Landing page or other routes, auto-send initialMessage once
  useEffect(() => {
    const state = location.state as { initialMessage?: string } | null;
    if (state?.initialMessage) {
      void sendMessage(state.initialMessage);
      // Clear the state so it doesn't resend on back/forward
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    let user = auth.currentUser;
    setMessages((prev) => {
      const updated: ChatMessage[] = [...prev, { role: "user", content: trimmed }];
      if (user && topic) saveUserMessage({ uid: user.uid, topic, role: "user", content: trimmed });
      return updated;
    });
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse({ message: trimmed, topic });
      setMessages((prev) => {
        const updated: ChatMessage[] = [
          ...prev,
          {
            role: "assistant",
            content: aiResponse
          }
        ];
        if (user && topic) saveUserMessage({ uid: user.uid, topic, role: "assistant", content: aiResponse });
        return updated;
      });
    } catch (error) {
      console.error("AI backend error", error);
      setMessages((prev) => {
        const updated: ChatMessage[] = [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I couldn't get a response from the AI backend. Please try again later."
          }
        ];
        if (user && topic) saveUserMessage({ uid: user.uid, topic, role: "assistant", content: "Sorry, I couldn't get a response from the AI backend. Please try again later." });
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;
    setMessage("");
    await sendMessage(trimmed);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      void handleSend();
    }
  };

  const handleSuggestedClick = (question: string) => {
    void sendMessage(question);
  };

  const suggestedQuestions = getSuggestedQuestions(topic);

  return (
    <div className="pt-16 flex h-screen">
      {!isLoggedIn && showLoginNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-yellow-100 border border-yellow-300 text-yellow-900 px-4 py-3 rounded-xl shadow-md flex items-center gap-3 max-w-lg">
          <span>
            <b>Tip:</b> Log in or sign up to retain your chat history across devices. You can continue without logging in if you prefer.
          </span>
          <button
            className="ml-4 px-2 py-1 rounded bg-yellow-200 hover:bg-yellow-300 text-xs font-semibold"
            onClick={() => setShowLoginNotice(false)}
            aria-label="Dismiss notification"
          >
            Dismiss
          </button>
        </div>
      )}
      <ChatSidebar />
      
      <main className="flex-1 ml-64 flex flex-col bg-background">
        {/* Topic Header */}
        <div className="px-6 pt-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">NEMSU AI Assistant</h1>
            <p className="text-xs text-muted-foreground">
              Ask anything about NEMSU enrollment, schedules, tuition, and more.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Topic: {topicLabel}</span>
          </div>
        </div>

        {/* Suggested Questions */}
        {suggestedQuestions.length > 0 && (
          <div className="px-6 pt-2 flex flex-wrap gap-2 text-xs">
            {suggestedQuestions.map((q) => (
              <Button
                key={q}
                variant="outline"
                size="sm"
                className="rounded-full border-dashed"
                onClick={() => handleSuggestedClick(q)}
                disabled={isLoading}
              >
                {q}
              </Button>
            ))}
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => {
            const isAssistant = msg.role === "assistant";
            let mainContent = msg.content;
            let tipText: string | null = null;

            if (isAssistant && msg.content.includes("Tip:")) {
              const [main, tip] = msg.content.split("\n\nTip:");
              mainContent = main;
              tipText = tip ? `Tip:${tip}`.trim() : null;
            }

            let tipTopicLabel: string | null = null;
            let tipRoute: string | null = null;
            if (tipText) {
              const match = tipText.match(/"(.+?)" topic/i);
              if (match) {
                tipTopicLabel = match[1];
                tipRoute = match[1].toLowerCase().replace(/\s+/g, "-");
              }
            }

            return (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex flex-col gap-2 max-w-2xl">
                  <div
                    className={`rounded-2xl px-6 py-4 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border shadow-[var(--shadow-card)]"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">{mainContent}</p>
                  </div>

                  {isAssistant && tipText && (
                    <div className="rounded-xl border border-dashed border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                      <p className="mb-2 whitespace-pre-line">{tipText}</p>
                      {tipRoute && tipTopicLabel && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-3 rounded-full"
                          onClick={() => navigate(`/chat/${tipRoute}`)}
                        >
                          Open {tipTopicLabel} Chat
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-2xl rounded-2xl px-6 py-3 bg-card border border-border shadow-[var(--shadow-card)]">
                <p className="text-xs text-muted-foreground">Assistant is typing...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card/50 backdrop-blur-sm p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-12 pr-12 rounded-xl"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                  disabled
                  title="Voice input coming soon"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                size="lg" 
                onClick={handleSend}
                className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90"
                disabled={isLoading || !message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
