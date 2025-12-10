import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

interface RouteParams {
  params: Promise<{
    id: string;
    taskId: string;
  }>;
}

// POST - upload file/video for task comment
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can upload files" },
        { status: 403 }
      );
    }

    const { taskId } = await params;
    const taskIdNum = parseInt(taskId);

    if (isNaN(taskIdNum)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    // Determine document type
    let docType: "PHOTO" | "VIDEO" | "DOCUMENT" = "DOCUMENT";
    if (file.type.startsWith("image/")) {
      docType = "PHOTO";
    } else if (file.type.startsWith("video/")) {
      docType = "VIDEO";
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads", "task-comments");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${originalName}`;
    const filepath = join(uploadDir, filename);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Create document record
    const document = await prisma.document.create({
      data: {
        service_task_id: taskIdNum,
        type: docType,
        url: `/uploads/task-comments/${filename}`,
        filename: file.name,
        filesize: file.size,
        // service_task_comment_id will be set when comment is created
      },
    });

    return NextResponse.json({
      id: document.id,
      type: document.type,
      url: document.url,
      filename: document.filename,
      filesize: document.filesize,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// GET - fetch all documents for a task
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { taskId } = await params;
    const taskIdNum = parseInt(taskId);

    if (isNaN(taskIdNum)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const documents = await prisma.document.findMany({
      where: { service_task_id: taskIdNum },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching task documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
