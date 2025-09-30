import { NextRequest } from "next/server";
import { handleResponse, handleCatch } from "../../../../../lib";
import { prisma } from "../../../../../lib/db";
import { handleRoleAccess } from "../../../../../lib/user";

export async function GET(request: NextRequest) {
  try {
    // 1. check if user is admin
    const isAdmin = await handleRoleAccess(request, "admin");
    if (!isAdmin) return handleResponse(401, "user not allowed");

    // 2. get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        status: true,
        createdAt: true,
        UserRole: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // 3. add stringed role
    const formattedUsers = allUsers.map((user) => ({
      ...user,
      roles: user.UserRole.map((ur) => ur.role.name),
    }));

    return handleResponse(200, "all users retrieved", formattedUsers);
  } catch (error: unknown) {
    return handleCatch(error);
  }
}
