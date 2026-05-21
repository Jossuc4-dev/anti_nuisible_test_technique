import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const isLoggedIn = !!token && token === process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  //console.log(process.env.NEXT_ADMIN_PASSWORD, token);
  return NextResponse.json({ loggedIn: isLoggedIn });
}
