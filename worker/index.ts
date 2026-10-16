/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  RESEND_API_KEY?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContactRequest(request, env);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}

async function handleContactRequest(request: Request, env: Env): Promise<Response> {
  if (!env.RESEND_API_KEY) {
    return Response.json({ error: "Email service is not configured." }, { status: 503 });
  }

  let payload: { name?: unknown; email?: unknown; message?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim().slice(0, 100) : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase().slice(0, 254) : "";
  const message = typeof payload.message === "string" ? payload.message.trim().slice(0, 5000) : "";
  if (!name || !emailPattern.test(email) || !message) {
    return Response.json({ error: "Please complete every field." }, { status: 400 });
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
  const send = (body: Record<string, unknown>) => fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
      "user-agent": "NicholasHamiltonLinktree/1.0",
    },
    body: JSON.stringify(body),
  });

  const enquiry = await send({
    from: "Nicholas Hamilton Website <contact@nicholashamiltonlinktree.com>",
    to: ["howyagaan@gmail.com"],
    reply_to: email,
    subject: `Website enquiry from ${name}`,
    html: `<h1>New website enquiry</h1><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Message:</strong></p><p>${safeMessage}</p>`,
  });

  if (!enquiry.ok) {
    console.error("Contact email failed", enquiry.status, await enquiry.text());
    return Response.json({ error: "Message delivery failed." }, { status: 502 });
  }

  const receipt = await send({
    from: "Nicholas Hamilton <contact@nicholashamiltonlinktree.com>",
    to: [email],
    reply_to: "howyagaan@gmail.com",
    subject: "We received your message",
    html: `<p>Hi ${safeName},</p><p>Thanks for getting in touch. Your message has been received, and we’ll get back to you as soon as possible.</p><p><strong>Your message:</strong></p><p>${safeMessage}</p><p>— Nicholas Hamilton</p>`,
  });

  if (!receipt.ok) console.error("Contact receipt failed", receipt.status, await receipt.text());
  return Response.json({ ok: true });
}

export default worker;
