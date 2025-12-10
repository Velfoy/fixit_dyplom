import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    id: string;
    taskId: string;
  }>;
}

// GET - fetch all comments for a task
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { taskId } = await params;
    const taskIdNum = parseInt(taskId);

    if (isNaN(taskIdNum)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const comments = await prisma.service_task_comment.findMany({
      where: { service_task_id: taskIdNum },
      include: {
        employees: {
          include: {
            users: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        },
        document: {
          select: {
            id: true,
            type: true,
            url: true,
            filename: true,
            filesize: true,
            thumbnail_url: true,
            duration: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // For comments without employee records (admin comments),
    // we need to fetch user info separately
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        if (!comment.employees && comment.mechanic_id === null) {
          // This is likely an admin comment, try to find user info from logs or other means
          // For now, return with "Admin" as the author
          return {
            ...comment,
            admin_author: {
              first_name: "Admin",
              last_name: "User",
              email: "",
            },
          };
        }
        return comment;
      })
    );

    return NextResponse.json(enrichedComments);
  } catch (error) {
    console.error("Error fetching task comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST - create a new comment
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can add comments" },
        { status: 403 }
      );
    }

    const { taskId } = await params;
    const taskIdNum = parseInt(taskId);

    if (isNaN(taskIdNum)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const body = await req.json();
    const { message, title, status, documentIds } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get employee ID for the current user if they are an employee
    // Admins may not have an employee record, so mechanic_id can be null
    const employee = await prisma.employees.findUnique({
      where: { user_id: parseInt(session.user.id || "0") },
    });

    // Create comment
    const comment = await prisma.service_task_comment.create({
      data: {
        service_task_id: taskIdNum,
        mechanic_id: employee?.id || null,
        message: message.trim(),
        title: title?.trim() || null,
        status: status || null,
        has_attachment: documentIds && documentIds.length > 0,
      },
      include: {
        employees: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        },
        document: true,
      },
    });

    // Link documents to this comment if provided
    if (documentIds && documentIds.length > 0) {
      await prisma.document.updateMany({
        where: {
          id: { in: documentIds },
        },
        data: {
          service_task_comment_id: comment.id,
        },
      });

      // Fetch updated comment with documents
      const updatedComment = await prisma.service_task_comment.findUnique({
        where: { id: comment.id },
        include: {
          employees: {
            include: {
              users: {
                select: {
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
            },
          },
          document: true,
        },
      });

      // Add admin author info if no employee record
      if (!updatedComment?.employees) {
        return NextResponse.json({
          ...updatedComment,
          admin_author: {
            first_name: "Admin",
            last_name: "User",
            email: session.user.email || "",
          },
        });
      }
      return NextResponse.json(updatedComment);
    }

    // Add admin author info if no employee record
    if (!comment.employees) {
      return NextResponse.json({
        ...comment,
        admin_author: {
          first_name: "Admin",
          last_name: "User",
          email: session.user.email || "",
        },
      });
    }
    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating task comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
