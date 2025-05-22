import { loginUser, registerUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const isRegister = req.headers.get("x-current-path")?.endsWith("/register");
  const response = isRegister
    ? await registerUser({ username, password })
    : await loginUser({ username, password });

  // if response has uid, set it in the cookie
  if (response.uid) {
    const cookieStore = await cookies();
    cookieStore.set("uid", "" + response.uid, {
      httpOnly: true,
    });
  }

  return new NextResponse(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
