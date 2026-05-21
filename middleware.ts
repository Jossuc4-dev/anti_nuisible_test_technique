import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const adminToken = request.cookies.get("admin_token");
  const isAuthenticated = adminToken?.value === process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  if (request.nextUrl.pathname.startsWith("/admin") && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
