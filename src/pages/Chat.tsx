import { useEffect, useRef, useState } from "react";
import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatSidebar from "@/components/ChatSidebar";
import { useLocation } from "react-router-dom";
import { getAIResponse } from "@/lib/ai";

const formatTopicLabel = (segment?: string) => {
  if (!segment) return "General";
  const withSpaces = segment.replace(/-/g, " ");
  return withSpaces.replace(/\b\w/g, (char) => char.toUpperCase());
};

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant" as const,
      content: "Hello! I'm your NEMSU AI Assistant. How can I help you today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const pathSegment = location.pathname.split("/")[2];
  const topic = pathSegment ? pathSegment.replace(/-/g, "_") : undefined;
  const topicLabel = formatTopicLabel(pathSegment);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { role: "user" as const, content: trimmed }]);
    setMessage("");
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse({ message: trimmed, topic });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: aiResponse
        }
      ]);
    } catch (error) {
      console.error("AI backend error", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: "Sorry, I couldn't get a response from the AI backend. Please try again later."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      void handleSend();
    }
  };

  return (
    <div className="pt-16 flex h-screen">
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

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-2xl rounded-2xl px-6 py-4 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border shadow-[var(--shadow-card)]"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

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
