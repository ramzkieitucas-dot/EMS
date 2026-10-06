import { NextRequest } from "next/server";
import { API_URL, getToken } from "@/lib/session";

type RouteContext = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const token = await getToken();

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const hasBody = ["POST", "PUT", "PATCH"].includes(request.method);

  const response = await fetch(
    `${API_URL}/${path.join("/")}${request.nextUrl.search}`,
    {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    }
  );

  if (response.status === 204) {
    return new Response(null, { status: 204 });
  }

  return new Response(await response.text(), {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const DELETE = forward;
