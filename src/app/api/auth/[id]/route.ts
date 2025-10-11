import { client } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  console.log("Endpoint hit 🟢");

  try {
    // Check if user already exists in the database
    const userProfile = await client.user.findUnique({
      where: {
        clerkid: id,
      },
      include: {
        studio: true,
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    });

    if (userProfile) {
      return NextResponse.json({ status: 200, user: userProfile });
    }

    // If not found, fetch user from Clerk
    const clerkUser = await clerkClient.users.getUser(id);

    // Create new user in your database
    const createUser = await client.user.create({
      data: {
        clerkid: id,
        email: clerkUser.emailAddresses[0].emailAddress,
        firstname: clerkUser.firstName,
        lastname: clerkUser.lastName,
        studio: {
          create: {},
        },
        workspace: {
          create: {
            name: `${clerkUser.firstName}'s workspace`,
            type: "PERSONAL",
          },
        },
      },
    });

    if (createUser) {
      return NextResponse.json({ status: 201, user: createUser });
    }
  } catch (error) {
    console.error("ERROR", error);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}
