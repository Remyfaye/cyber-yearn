import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "../../../../../lib/zod-schema";
import { prisma } from "../../../../../lib/db";
import { handleResponse, hashPassword } from "../../../../../lib";
import { createAuthToken } from "../../../../../lib/user";

export async function POST(req: NextRequest) {
  try {
    // 1. Get data from body and parse it using - registerSchema (Zod)
    const body = await req.json();
    const { email, password } = registerSchema.parse(body);

    console.log("// 2. checking if user exists");
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json({ error: "User already Exists", status: 409 });

    console.log("// 3. hashing password");
    const hashedPassword = await hashPassword(password);

    console.log("// 4. finding learner role id");
    const learnerRole = await prisma.role.findUnique({
      where: { name: "learner" },
    });
    if (!learnerRole) return handleResponse(400, "invalid learner role");

    console.log("// 5. creating new user");
    const newUser = await prisma.user.create({
      data: {
        email,
        username: email.split("@")[0],
        passwordHash: hashedPassword,
        UserRole: { create: [{ roleId: learnerRole?.id }] },
      },
    });

    // include UserRole in the user to be sent to the frontend
    console.log("");
    const userWithUserRole = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: { UserRole: { include: { role: true } } },
    });

    // map through UserRole of a user and get names
    const role = userWithUserRole?.UserRole.map((r) => r.role.name) || [];

    // send UserId and UserRole to setAuthCookies to create token and store in cookies
    const token = await createAuthToken(newUser.id, role);

    console.log("newuser:", newUser);
    const response = NextResponse.json({
      status: 200,
      data: { ...newUser, role },
    });
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
    });

    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error, status: 500 });
  }
}
