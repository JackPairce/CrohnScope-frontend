import { NextRequest, NextResponse } from "next/server";

const allowedUsers: string[] = [];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const headers = req.headers;
  const currentTime = new Date();

  // Set custom header for current path
  headers.set("x-current-path", url.pathname);

  // Log request details
  console.log(
    `[${currentTime.toDateString()} - ${currentTime.toLocaleTimeString()}] ${
      req.method
    } ${req.url}`
  );

  // Redirect root path to datagen
  if (url.pathname === "/") {
    url.pathname = "/datagen";
    return NextResponse.redirect(url, { headers });
  }

  // Skip middleware for Next.js internal routes
  if (req.method === "GET" && !req.nextUrl.pathname.startsWith("/_next/")) {
    return NextResponse.next({ headers });
  }

  return NextResponse.next();
}
export const config = {
  //   matchers: ["/", "/home/:path*"], // Apply middleware only to the root path and all paths starting with /home
};
