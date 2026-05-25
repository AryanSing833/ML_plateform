"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Send, Loader2, Trash2, Globe, Sparkles,
  Plus, MessageSquare, ChevronLeft, ChevronRight, Zap, Search, X
} from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  timestamp: Date;
};

const WELCOME_SUGGESTIONS = [
  { icon: "📄", text: "Summarize my uploaded document" },
  { icon: "🔍", text: "Find key insights from my PDF" },
  { icon: "💡", text: "Explain the main concepts" },
  { icon: "📊", text: "Extract data and statistics" },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [documents, setDocuments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { fetchDocuments(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.documents) setDocuments(data.documents);
    } catch (err) { console.error("Failed to fetch documents", err); }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) setTimeout(fetchDocuments, 2000);
    } catch (err) { console.error("Upload failed", err); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.pdf') || file.name.endsWith('.txt'))) handleUpload(file);
  }, []);

  const handleDelete = async (filename: string) => {
    try {
      await fetch(`/api/documents/${filename}`, { method: "DELETE" });
      fetchDocuments();
    } catch (err) { console.error("Delete failed", err); }
  };

  const handleSend = async (overrideQuery?: string) => {
    const userMsg = (overrideQuery || input).trim();
    if (!userMsg) return;
    if (!overrideQuery) setInput("");

    const newMsg: Message = { id: Date.now().toString(), role: "user", content: userMsg, timestamp: new Date() };
    setMessages(prev => [...prev, newMsg]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg, use_web_search: useWebSearch }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(), role: "assistant",
        content: data.answer, sources: data.sources, timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "assistant",
        content: "I encountered an error processing your request. Please try again.", timestamp: new Date()
      }]);
    } finally { setIsTyping(false); }
  };

  const isWelcome = messages.length === 0;

  return (
    <div
      className="flex h-screen overflow-hidden bg-[#09090b] text-zinc-100 relative"
      onDragEnter={handleDrag}
    >
      {/* Background ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/[0.07] blur-[120px]" style={{ animation: "float 20s ease-in-out infinite" }} />
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-500/[0.05] blur-[100px]" style={{ animation: "float 25s ease-in-out infinite reverse" }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-blue-500/[0.04] blur-[80px]" style={{ animation: "float 18s ease-in-out infinite 5s" }} />
      </div>

      {/* Drag overlay */}
      <AnimatePresence>
        {dragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="border-2 border-dashed border-indigo-400/60 rounded-3xl p-16 text-center"
            >
              <Upload className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <p className="text-xl font-medium text-white">Drop your document here</p>
              <p className="text-sm text-zinc-400 mt-2">PDF or TXT files supported</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="relative z-10 flex flex-col border-r border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden flex-shrink-0"
          >
            {/* Sidebar Header */}
            <div className="p-5 flex items-center justify-between border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#09090b]" />
                </div>
                <div>
                  <h1 className="font-semibold text-sm tracking-tight">NeuralDoc</h1>
                  <p className="text-[11px] text-zinc-500 font-medium">AI Document Intelligence</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
                <ChevronLeft className="w-4 h-4 text-zinc-500" />
              </button>
            </div>

            {/* Source Documents */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Sources</p>
                <span className="text-[10px] font-bold bg-white/[0.06] text-zinc-400 px-2 py-0.5 rounded-md">
                  {documents.length}
                </span>
              </div>

              {documents.length === 0 && (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-5 h-5 text-zinc-600" />
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">No documents yet.<br/>Upload a PDF or TXT to get started.</p>
                </div>
              )}

              <div className="space-y-1.5">
                <AnimatePresence>
                  {documents.map((doc, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.05 }}
                      key={doc}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all duration-200 cursor-default"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <span className="text-[13px] text-zinc-300 truncate flex-1 font-medium">{doc}</span>
                      <button
                        onClick={() => handleDelete(doc)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Upload Button */}
            <div className="p-4 border-t border-white/[0.06]">
              <input type="file" ref={fileInputRef} onChange={handleFileInput} accept=".pdf,.txt" className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 disabled:opacity-40
                  bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500
                  shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 active:scale-[0.97]"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isUploading ? "Processing..." : "Upload Document"}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <main className="flex-1 flex flex-col relative z-10 min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl flex items-center px-5 justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors mr-1"
              >
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </motion.button>
            )}
            <MessageSquare className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-400">Chat</span>
            {documents.length > 0 && (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                {documents.length} source{documents.length > 1 ? 's' : ''} loaded
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseWebSearch(!useWebSearch)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border",
                useWebSearch
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/25 shadow-sm shadow-blue-500/10"
                  : "bg-transparent text-zinc-500 border-white/[0.08] hover:border-white/[0.15] hover:text-zinc-300"
              )}
            >
              <Globe className="w-3.5 h-3.5" />
              Web Search
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto relative">
          {isWelcome ? (
            /* Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center px-6 animate-fade-up">
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/25">
                  <Sparkles className="w-9 h-9 text-white" />
                </div>
                <div className="absolute -inset-4 rounded-[28px] bg-gradient-to-br from-indigo-500/20 to-violet-600/20 blur-xl -z-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">What can I help you discover?</h2>
              <p className="text-sm text-zinc-500 mb-10 max-w-md text-center leading-relaxed">
                Upload documents and ask questions. I&apos;ll search through your files and provide answers with source citations.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                {WELCOME_SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    onClick={() => handleSend(s.text)}
                    className="text-left p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300 group"
                  >
                    <span className="text-lg mb-2 block">{s.icon}</span>
                    <span className="text-[13px] text-zinc-400 group-hover:text-zinc-200 transition-colors leading-snug">{s.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  key={msg.id}
                  className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-md shadow-lg shadow-indigo-600/15"
                      : "bg-white/[0.03] border border-white/[0.06] text-zinc-200 rounded-bl-md"
                  )}>
                    <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/[0.08]">
                        <p className="text-[10px] text-zinc-500 mb-2 font-semibold uppercase tracking-wider flex items-center gap-1">
                          <Search className="w-3 h-3" /> Sources
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map(s => (
                            <span key={s} className="text-[11px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-md font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-white/[0.08] flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-zinc-300">U</span>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-bl-md px-5 py-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" style={{ animation: "typing-dot 1.4s ease-in-out infinite" }} />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" style={{ animation: "typing-dot 1.4s ease-in-out 0.2s infinite" }} />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" style={{ animation: "typing-dot 1.4s ease-in-out 0.4s infinite" }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-4 sm:px-6 pb-5 pt-2">
          <div className="max-w-3xl mx-auto">
            <div className="relative glass rounded-2xl transition-all duration-300 focus-within:border-indigo-500/30 focus-within:shadow-lg focus-within:shadow-indigo-500/5">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask about your documents..."
                className="w-full bg-transparent rounded-2xl pl-5 pr-14 py-4 text-[14px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-none min-h-[56px] max-h-[200px]"
                rows={1}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className={cn(
                  "absolute right-3 bottom-3 p-2.5 rounded-xl transition-all duration-300",
                  input.trim() && !isTyping
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95"
                    : "bg-white/[0.04] text-zinc-600"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-[10px] text-zinc-600 mt-3">
              NeuralDoc may produce inaccurate responses. Verify important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
