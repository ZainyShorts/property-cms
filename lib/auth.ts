// lib/auth.ts
import jwt from "jsonwebtoken";
import { deleteCookie } from 'cookies-next';


const JWT_SECRET = process.env.JWT_SECRET!;

type DecodedToken = {
  userEmail?: string;
  userId?: string;
  role?: string;
};



export function isTokenExpired(token: string) {
  if (!token) return true;

  try {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded === "string" || !("exp" in decoded)) return true;

    const now = Math.floor(Date.now() / 1000); // current time in seconds
    return (decoded.exp as number) < now; // true if expired
  } catch (error) {
    // Invalid token or decode error
    return true;
  }
}


export const logoutUser =async () => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_CMS_SERVER}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Include cookies in request
    });
  } catch (err) {
    console.error('Logout error:', err);
  }

  localStorage.clear();
  window.location.href = '/sign-in';
};

// Optional: Function to check if user is logged in
export const isAuthenticated = (): boolean => {
  // This is a simple check - you might want to verify the token too
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    return cookies.some(cookie => cookie.trim().startsWith('token='));
  }
  return false;
};


export function useUser(token: string): DecodedToken | null {
  if (!token) return null;

  const decoded = jwt.verify(token, process.env.JWT_SECRET!);

  if (!decoded || typeof decoded !== 'object') return null;

  return {
    userEmail: (decoded as any).useremail,
    userId: (decoded as any).userId,
    role: (decoded as any).role,
  };
}
