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
        author: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
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

    const enrichedComments = comments.map((comment) => {
      const author = comment.employees?.users ||
        comment.author || {
          first_name: "Admin",
          last_name: "User",
          email: "",
        };

      return {
        ...comment,
        author,
      };
    });

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
    const authorId = parseInt(session.user.id || "0");

    const comment = await prisma.service_task_comment.create({
      data: {
        service_task_id: taskIdNum,
        mechanic_id: employee?.id || null,
        created_by_user_id: authorId || null,
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
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        },
        author: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
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
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          document: true,
        },
      });

      const author = updatedComment?.employees?.users ||
        updatedComment?.author || {
          first_name: session.user.name?.split(" ")[0] || "",
          last_name: session.user.name?.split(" ").slice(1).join(" ") || "User",
          email: session.user.email || "",
          id: authorId || null,
        };

      return NextResponse.json({
        ...updatedComment,
        author,
      });
    }

    const author = comment.employees?.users ||
      comment.author || {
        first_name: session.user.name?.split(" ")[0] || "",
        last_name: session.user.name?.split(" ").slice(1).join(" ") || "User",
        email: session.user.email || "",
        id: authorId || null,
      };

    return NextResponse.json({
      ...comment,
      author,
    });
  } catch (error) {
    console.error("Error creating task comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

// DELETE - delete a comment (only by the user who created it)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const url = new URL(req.url);
    const commentId = url.searchParams.get("commentId");

    if (!commentId || isNaN(parseInt(commentId))) {
      return NextResponse.json(
        { error: "Invalid comment ID" },
        { status: 400 }
      );
    }

    const taskIdNum = parseInt(taskId);
    if (isNaN(taskIdNum)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const commentIdNum = parseInt(commentId);

    // Fetch the comment to verify ownership
    const comment = await prisma.service_task_comment.findUnique({
      where: { id: commentIdNum },
      include: {
        employees: {
          include: {
            users: {
              select: {
                id: true,
              },
            },
          },
        },
        author: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Verify that the current user is the creator of the comment
    const currentUserId = parseInt(session.user.id || "0");
    const commentCreatorId =
      comment.employees?.users?.id || comment.author?.id || null;

    if (!commentCreatorId || commentCreatorId !== currentUserId) {
      return NextResponse.json(
        { error: "You can only delete your own comments" },
        { status: 403 }
      );
    }

    // Delete the comment (documents should be handled by cascade delete in the database)
    await prisma.service_task_comment.delete({
      where: { id: commentIdNum },
    });

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting task comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
