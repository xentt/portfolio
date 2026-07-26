import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listFiles, listTrash, uploadFile, ROOT_FOLDER_ID } from "@/lib/drive";
import { logActivity } from "@/lib/activity";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const trashed = searchParams.get("papelera") === "1";

    let files;
    if (trashed) {
      files = await listTrash();
    } else {
      const folderId = searchParams.get("carpeta") || ROOT_FOLDER_ID;
      files = await listFiles(folderId);
    }

    const mapped = files.map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      size: f.size,
      createdTime: f.createdTime,
      modifiedTime: f.modifiedTime,
      webViewLink: f.webViewLink,
      webContentLink: f.webContentLink,
      trashed: f.trashed,
      parents: f.parents,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error listing files:", error);
    return NextResponse.json(
      { error: "Error al listar archivos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const parentId =
      (formData.get("parentId") as string) || ROOT_FOLDER_ID;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron archivos" },
        { status: 400 }
      );
    }

    const uploaded = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadFile(file.name, file.type, buffer, parentId);
      uploaded.push(result);

      await logActivity({
        userId: Number(session.user.id),
        userEmail: session.user.email || "",
        userName: session.user.name || null,
        action: "upload",
        target: parentId === ROOT_FOLDER_ID ? file.name : `${parentId}/${file.name}`,
      });
    }

    return NextResponse.json({ uploaded: uploaded.length }, { status: 201 });
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: "Error al subir archivos" },
      { status: 500 }
    );
  }
}