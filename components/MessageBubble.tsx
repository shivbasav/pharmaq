"use client";

import ReactMarkdown from "react-markdown";
import { Brain, User } from "lucide-react";
import type { ChatMessage } from "@/types";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>

      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser
          ? "bg-blue-600"
          : "bg-slate-800 border border-blue-500/20"
      }`}>
        {isUser
          ? <User size={13} className="text-white" />
          : <Brain size={13} className="text-blue-400" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? "bg-blue-600 text-white rounded-tr-sm"
          : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm"
      }`}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="mb-2 last:mb-0">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-white">{children}</strong>
              ),
              ul: ({ children }) => (
                <ul className="mt-1 mb-2 space-y-1">{children}</ul>
              ),
              li: ({ children }) => (
                <li className="flex gap-2">
                  <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                  <span>{children}</span>
                </li>
              ),
              code: ({ children }) => (
                <code className="font-mono text-xs bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">
                  {children}
                </code>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>

    </div>
  );
}