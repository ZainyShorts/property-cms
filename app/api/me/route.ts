// pages/api/me.ts

import { isTokenExpired, useUser } from "../../../lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: any) {

    const token = req.cookies.get("token")?.value;

  if (!token) return NextResponse.json(null);

  const expired = isTokenExpired(token)

  if(expired) return NextResponse.json(null);

  const user = useUser(token);
  return NextResponse.json({...user,token});

}
