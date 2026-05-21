import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();

  //console.log(process.env.NEXT_ADMIN_PASSWORD);

  if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD!) {
    return NextResponse.json({ error: "Mot de passe incorrect" + process.env.NEXT_PUBLIC_ADMIN_PASSWORD!}, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_token", process.env.NEXT_PUBLIC_ADMIN_PASSWORD!, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
