import { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { headers } from "next/headers";

// Auth Flow:
// 1. When a user signs in or registers, token is created by function - createAuthToken
// 2. UserId and roles are returned by verifyAuthToken
// 3. User details are retrieved and sent to 'me' endpoint via getCurrentUser
// 4. Token is removed from cookies on logout

export async function createAuthToken(userId: string, roles: string[]) {
  const payload = { userId, roles };
  console.log("payload", payload);

  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  if (!secret || !process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in env");
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  return token;
}

export async function verifyAuthToken(token: string) {
  try {
    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    return payload as { userId: string; roles: string[] };
  } catch (error) {
    console.error("Invalid JWT token:", error);
    return null;
  }
}

export async function getCurrentUserByHeader() {
  const headerList = await headers();
  const authorization = headerList.get("authorization");

  if (!authorization) throw new Error("No Authorization header found");

  const token = authorization.replace("Bearer ", "");
  if (!token) throw new Error("Invalid token");

  const decoded = await verifyAuthToken(token);
  console.log("decoded", decoded);
  return decoded;
}

export async function getCurrentUser(request: NextRequest) {
  console.log("fetching token");
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    console.log("No token provided");
    throw new Error("No token provided");
  }

  const user = await verifyAuthToken(token);
  if (!user) console.log("no user found");

  console.log("user retrieved", user?.userId);
  return user;
}

export async function handleRoleAccess(
  request: NextRequest,
  requiredRole: string
): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user ? user.roles.includes(requiredRole) : false;
}
