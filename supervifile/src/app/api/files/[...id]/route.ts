import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getFile,
  getFileBuffer,
  renameFile,
  moveToTrash,
  restoreFromTrash,
  permanentlyDelete,
  ROOT_FOLDER_ID,
} from "@/lib/drive";
import { logActivity } from "@/lib/activity";

const OPERATIONS = ["download", "rename", "trash", "restore", "delete"] as const;
type Operation = (typeof OPERATIONS)[number];

function parseParams(id: string[]): { fileId: string; operation?: string } {
  const last = id[id.length - 1];
  if (OPERATIONS.includes(last as Operation)) {
    return {
      fileId: id.slice(0, -1).join("/"),
      operation: last,
    };
  }
  return { fileId: id.join("/") };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string[] } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { fileId, operation } = parseParams(params.id);

    if (operation === "download") {
      const { searchParams } = new URL(request.url);
      const fileName = searchParams.get("name") || "download";
      const file = await getFile(fileId);
      const buffer = await getFileBuffer(fileId);

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": file.mimeType || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Length": String(buffer.length),
        },
      });
    }

    if (fileId === ROOT_FOLDER_ID || fileId === "root") {
      return NextResponse.json({
        id: ROOT_FOLDER_ID,
        name: "Mi Unidad",
        parents: [],
      });
    }

    const file = await getFile(fileId);
    return NextResponse.json({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      parents: file.parents,
    });
  } catch (error) {
    console.error("Error getting file:", error);
    return NextResponse.json(
      { error: "Error al obtener información" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string[] } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const userEmail = session.user.email || "";
  const userName = session.user.name || null;

  try {
    const id = params.id;
    const operation = id[id.length - 1];
    const fileId = id.slice(0, -1).join("/");

    switch (operation) {
      case "rename": {
        const { name } = await request.json();
        if (!name || !name.trim()) {
          return NextResponse.json(
            { error: "El nombre no puede estar vacío" },
            { status: 400 }
          );
        }
        const result = await renameFile(fileId, name.trim());

        await logActivity({
          userId,
          userEmail,
          userName,
          action: "rename",
          target: name.trim(),
          details: `Nombre anterior: ${fileId.split("/").pop()}`,
        });

        return NextResponse.json(result);
      }

      case "trash": {
        await moveToTrash(fileId);

        await logActivity({
          userId,
          userEmail,
          userName,
          action: "trash",
          target: fileId,
        });

        return NextResponse.json({ success: true });
      }

      case "restore": {
        await restoreFromTrash(fileId);

        await logActivity({
          userId,
          userEmail,
          userName,
          action: "restore",
          target: fileId.replace(/^trash\//, ""),
        });

        return NextResponse.json({ success: true });
      }

      case "delete": {
        await permanentlyDelete(fileId);

        await logActivity({
          userId,
          userEmail,
          userName,
          action: "delete",
          target: fileId.replace(/^trash\//, ""),
        });

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: "Operación no válida" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json(
      { error: "Error en la operación" },
      { status: 500 }
    );
  }
}