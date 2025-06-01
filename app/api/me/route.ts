// pages/api/me.ts

import { isTokenExpired, useUser } from "@/lib/auth";


export default function handler(req:any, res:any) {
  const token = req.cookies.authToken;

  if (!token) return res.status(401).send(null);

  const expired = isTokenExpired(token)

  if(expired) return res.status(401).send(null);

  const user = useUser(token);

  return res.status(200).send(user);

}
