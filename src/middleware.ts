// src/middleware.ts
// CostLens AI — Route Protection Middleware
// Redirects unauthenticated users to login page

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes — always accessible
        const publicRoutes = ["/login", "/register", "/", "/api/auth", "/api/health"];
        if (publicRoutes.some((route) => pathname.startsWith(route))) {
          return true;
        }

        // API routes need a token
        if (pathname.startsWith("/api/")) {
          return !!token;
        }

        // Dashboard routes need a token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Protect all routes except static files and public pages
    "/((?!_next/static|_next/image|favicon.ico|login|register|api/auth).*)",
  ],
};
