import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { loginUser, registerUser } from "../../_lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  //   if the req pathname ends with /auth/register
  const isRegister = req.headers.get("x-by-path")?.endsWith("/auth/register");
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
