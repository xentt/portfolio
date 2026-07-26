import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createFolder, ROOT_FOLDER_ID } from "@/lib/drive";
import { logActivity } from "@/lib/activity";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { name, parentId } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "El nombre no puede estar vacío" },
        { status: 400 }
      );
    }

    const folder = await createFolder(name.trim(), parentId || ROOT_FOLDER_ID);

    await logActivity({
      userId: Number(session.user.id),
      userEmail: session.user.email || "",
      userName: session.user.name || null,
      action: "create_folder",
      target: folder.id,
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Error al crear la carpeta" },
      { status: 500 }
    );
  }
}