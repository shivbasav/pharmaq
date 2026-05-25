import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      systemPrompt,
    }: { messages: ChatMessage[]; systemPrompt?: string } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const activePrompt = systemPrompt ?? SYSTEM_PROMPT;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: activePrompt,
    });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage.content);

    // Stream response back
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              const data = JSON.stringify({ text });
              controller.enqueue(
                new TextEncoder().encode(`data: ${data}\n\n`)
              );
            }
          }
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ done: true })}\n\n`
            )
          );
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}