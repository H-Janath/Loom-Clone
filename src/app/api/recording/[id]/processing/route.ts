import { client } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { id } = params;

    const personalWorkspace = await client.user.findUnique({
      where: { id },
      include: {
        workspace: {
          where: { type: "PERSONAL" },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        },
      },
    });

    const workspaceId = personalWorkspace?.workspace?.[0]?.id;
    if (!workspaceId) {
      return NextResponse.json({ status: 404, message: "Personal workspace not found" });
    }

    const updatedWorkspace = await client.workSpace.update({
      where: { id: workspaceId },
      data: {
        videos: {
          create: {
            source: body.filename,
            userId: id,
          },
        },
      },
      select: {
        User: {
          select: {
            subscription: {
              select: { plan: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      status: 200,
      plan: updatedWorkspace.User.subscription?.plan,
    });
  } catch (error) {
    console.error("Error in processing video:", error);
    return NextResponse.json({ status: 500, error: "Internal Server Error" });
  }
}
