import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

const initialMessages: Message[] = [
  { id: "1", role: "system", content: "Welcome to City Command Center Chat. Our AI assistant is ready to help with your inquiry.", timestamp: "09:00 AM" },
  { id: "2", role: "user", content: "I want to report a large pothole on Highway 7 near Exit 12. It's been there for a week and causing traffic issues.", timestamp: "09:02 AM", status: "read" },
  { id: "3", role: "assistant", content: "Thank you for reporting this issue. I've created complaint **CMP-2024-009** for the pothole on Highway 7 near Exit 12.\n\n**Priority:** High\n**Department:** Infrastructure\n**Estimated Response:** 24-48 hours\n\nOur road maintenance team has been notified and will assess the situation. Would you like to receive updates on this complaint?", timestamp: "09:02 AM" },
  { id: "4", role: "user", content: "Yes, please send me updates. Also, is there a detour route available?", timestamp: "09:03 AM", status: "read" },
  { id: "5", role: "assistant", content: "I've enabled notifications for **CMP-2024-009**. You'll receive SMS and in-app updates.\n\nRegarding the detour, our traffic AI suggests:\n\n🚗 **Recommended Route:** Take Exit 11 → Service Road B → Rejoin Highway 7 at Exit 13\n⏱️ **Added time:** ~7 minutes\n📊 **Current congestion:** Low on detour route\n\nI've also flagged this area in our IoT traffic management system to adjust signal timing accordingly.", timestamp: "09:03 AM" },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, timestamp: timeStr, status: "sent" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(input),
        timestamp: timeStr,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Main Chat */}
      <div className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">City AI Assistant</p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full status-online" /> Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1">
            <Sparkles className="h-3 w-3" /> AI-Powered
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "system" ? (
                <div className="mx-auto text-center text-xs text-muted-foreground bg-muted/50 rounded-full px-4 py-1.5">
                  {msg.content}
                </div>
              ) : (
                <div className={`flex gap-2.5 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    msg.role === "user" ? "bg-primary" : "bg-secondary"
                  }`}>
                    {msg.role === "user" ? <User className="h-3.5 w-3.5 text-primary-foreground" /> : <Bot className="h-3.5 w-3.5 text-foreground" />}
                  </div>
                  <div>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 mt-1 ${msg.role === "user" ? "justify-end" : ""}`}>
                      <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                      {msg.status && (
                        <span className="text-[10px] text-muted-foreground">• {msg.status}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary">
                <Bot className="h-3.5 w-3.5 text-foreground" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse-glow" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-30 hover:opacity-90 transition-opacity"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Info Panel */}
      <div className="hidden lg:flex w-72 flex-col rounded-xl border border-border bg-card p-5 gap-4">
        <h3 className="text-sm font-semibold text-foreground">AI Assistant Info</h3>
        
        <div className="space-y-3">
          {[
            { label: "Model", value: "CityGPT v3.2" },
            { label: "Accuracy", value: "96.8%" },
            { label: "Avg Response", value: "1.2s" },
            { label: "Session", value: "#48291" },
          ].map((info) => (
            <div key={info.label} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{info.label}</span>
              <span className="font-mono-code text-foreground">{info.value}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs font-medium text-foreground mb-2">Capabilities</p>
          <div className="space-y-1.5">
            {["File complaints", "Track status", "Route guidance", "Emergency alerts", "Budget queries"].map((cap) => (
              <div key={cap} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-1 w-1 rounded-full bg-primary" />
                {cap}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs font-medium text-foreground mb-2">Quick Actions</p>
          <div className="space-y-1.5">
            {["Report an issue", "Check complaint status", "Find nearest service"].map((action) => (
              <button
                key={action}
                onClick={() => setInput(action)}
                className="w-full text-left rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function generateAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("status") || lower.includes("complaint")) {
    return "I can check the status of your complaint. Could you please provide the complaint ID (e.g., CMP-2024-001)? Alternatively, I can search by your registered phone number or email.";
  }
  if (lower.includes("report") || lower.includes("issue") || lower.includes("problem")) {
    return "I'd be happy to help you file a report. Please provide:\n\n1. **Type of issue** (road, water, electricity, waste, safety)\n2. **Location** (zone and street)\n3. **Brief description**\n\nI'll create a complaint and assign it to the appropriate department automatically.";
  }
  if (lower.includes("emergency") || lower.includes("urgent")) {
    return "⚠️ For life-threatening emergencies, please call **911** immediately.\n\nFor urgent city service issues, I've flagged your message as **Priority: Critical**. A response team will be notified within 15 minutes.\n\nCan you describe the situation and your current location?";
  }
  return "Thank you for your message. I've processed your inquiry through our AI analysis system. Based on the city's current operational data, I'll connect you with the most relevant department.\n\nIs there anything specific you'd like to know about city services?";
}
