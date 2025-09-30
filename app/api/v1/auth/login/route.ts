import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "../../../../../lib/zod-schema";
import { verifyPassword } from "../../../../../lib";
import { createAuthToken } from "../../../../../lib/user";
import { prisma } from "../../../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    // 1. get body from userInput
    const body = await req.json();

    // 2. Check if email or password is missing
    const { email, password } = loginSchema.parse(body);
    if (!email || !password)
      return NextResponse.json({ error: "Missing Credential", status: 401 });

    const userWithoutRoles = await prisma.user.findUnique({
      where: { email: email },
    });

    // 3. check if user exists and include role array
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: { UserRole: { include: { role: true } } },
    });
    if (!user) return NextResponse.json({ error: "Invalid User", status: 401 });

    // 4. Check if password is correct
    const correctPassword = await verifyPassword(user?.passwordHash, password);
    if (!correctPassword)
      return NextResponse.json({ error: "Password is incorrect", status: 401 });

    // 5. extract user UserRole
    const roles = await user.UserRole.map((userRole) => userRole.role.name);

    // 6. send UserId and UserRole to create token
    const token = await createAuthToken(user.id, roles);

    const formattedUser = { ...userWithoutRoles, roles };

    const response = NextResponse.json({
      status: 200,
      data: { ...formattedUser, token },
    });
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.log("login failed:", error);
    return NextResponse.json({ error: error, msg: error });
  }
}
