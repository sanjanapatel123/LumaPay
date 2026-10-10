import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl =
      process.env.API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:5000";

    const backendResponse = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      return NextResponse.json(data ?? { message: "Login failed" }, {
        status: backendResponse.status,
      });
    }

    if (!data?.token || typeof data.token !== "string") {
      return NextResponse.json(
        { message: "Login response did not contain a valid token" },
        { status: 502 },
      );
    }

    const response = NextResponse.json(data);

    response.cookies.set("wallet_session", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to the authentication service" },
      { status: 502 },
    );
  }
}
