import { NextRequest } from "next/server";
import { handleCatch, handleResponse } from "../../../../../lib";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/user";

export async function GET(request: NextRequest) {
  try {
    // 1. Get UserId and roles from headers
    const user = await getCurrentUser(request);

    // 2. Return fetched User
    if (!user?.userId) return handleResponse(401, "User not logged in");

    // 3. Retrieve user info from userId
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
    });

    const userDataWithUserRole = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { UserRole: { include: { role: true } } },
    });

    const role = userDataWithUserRole?.UserRole.map((r) => r.role.name);

    return handleResponse(200, "data retrieved", { ...userData, role });
  } catch (error) {
    handleCatch(error);
  }
}
